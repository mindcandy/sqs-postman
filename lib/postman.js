var debug = require('debug')('postman');
var path = require('path');
var uuid = require('node-uuid');
var async = require('async');
var AWS = require('aws-sdk');

var exports = module.exports = create;

var DEFAULT_CONCURRENT_PRODUCERS = 10;

function create(options) {
  options = options || {};
  options.concurrentProducers = options.concurrentProducers || DEFAULT_CONCURRENT_PRODUCERS;
  
  AWS.config.update({region: options.awsRegion || 'eu-west-1'});
  
  var credentials = new AWS.SharedIniFileCredentials({profile: options.awsProfile || 'default'});
  AWS.config.credentials = credentials;
  
  var sqs = new AWS.SQS();

  return new Postman(sqs, options);
}

function Postman(sqs, options) {
  debug('starting postman with options %j', options);
  this.sqs = sqs;
  this.options = options;
};

Postman.prototype.getQueueUrl = function (queueName, cb) {
  debug('getting queueUrl for queue with name %s', queueName);

  var params = {
    QueueName: queueName
  };

  this.sqs.getQueueUrl(params, function (err, data) {
    if (err) return cb(err);

    cb(null, data.QueueUrl);
  });
};

Postman.prototype.getStats = function (queueUrl, cb) {
  debug('getting stats for queue %s', queueUrl);

  this.sqs.getQueueAttributes({
    QueueUrl: queueUrl,
    AttributeNames: ['All']
  }, function (err, data) {
    if (err) return cb(err);

    var currentNumberOfMessages = parseInt(data.Attributes.ApproximateNumberOfMessages);

    var stats = {
      messages: currentNumberOfMessages
    };

    cb(null, stats);
  });
};

Postman.prototype.sendMessage = function (options, cb) {
  debug('sending message with options %j', options);
  var self = this;

  var queueName = options.queueName;
  this.getQueueUrl(queueName, function (err, queueUrl) {
    if (err) return cb(err);

    var messageFile = path.resolve(options.messageSource);
    debug('loading messageBody from file %s', messageFile);
    var messageBody = JSON.stringify(require(messageFile));

    var totalMessages = options.total || 1;
    var batchSize = totalMessages <= 10 ? totalMessages : 10;
    var batches = createBatches(totalMessages, batchSize);;
   
    debug('about to send these batches %j', batches);

    var processedBatches = 0;
    async.eachLimit(batches, self.options.concurrentProducers, function sendMessageBatch(batch, next) {
      debug('processing batch with size %s', batch);
      
      var entries = createEntries(messageBody, batch);
      self.sqs.sendMessageBatch({ Entries: entries, QueueUrl: queueUrl }, function (err, data) {
        if (err) return next(err);

        debug('successfully processed batch %s', ++processedBatches);

        next(null);
      })
    }, function (err) {
      cb(null, 'done');
    });    
  });
};

function createEntries(messageBody, n) {
  var entries = [];
  for (var i = 0; i < n; i++) {
    var id = uuid.v4();
    entries.push({
      Id: id,
      MessageBody: messageBody.replace('%unique%', id)
    });
  }
  return entries;
}

function createBatches(totalMessages, batchSize) {
  var batches = [];
  var requiredFullBatches = Math.floor(totalMessages / batchSize);
  
  for (var i = 0; i < requiredFullBatches; i++) {
    batches.push(batchSize);
  }

  var lastBatch = totalMessages - (requiredFullBatches * batchSize);
  if (lastBatch > 0) {
    batches.push(lastBatch);
  }

  return batches;
}

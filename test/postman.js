var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

describe('postman', function () {

  var underTest = rewire('../lib/postman');

  var sandbox = sinon.sandbox.create();

  var queueName = 'my-test-queue';
  var queueUrl = 'http://aws/' + queueName;

  var sqsMock = {
    getQueueUrl: sandbox.stub(),
    getQueueAttributes: sandbox.stub(),
    sendMessageBatch: sandbox.stub()
  };

  var debugMock = sandbox.stub();
  var pathMock = {
    resolve: sandbox.stub()
  };
  var uuidMock = {
    v4: sandbox.stub()
  };
  var asyncMock = {
  };
  var awsMock = {};

  before(function () {
    underTest.__set__({
      // debug: debugMock,
      // path: pathMock,
      // uuid: uuidMock,
      // async: asyncMock,
      AWS: awsMock
    });

    // configStub.get.withArgs('public').returns(dummyPublicConfig);
  });

  describe('constructor', function () {

  });

  describe('api', function () {

    var Postman = underTest.Postman;

    describe('#getQueueUrl()', function () {

      it('should use the right queue name', function (done) {
        var postman = new Postman(sqsMock, {});

        sqsMock.getQueueUrl.yields(null, { QueueUrl: queueUrl });

        postman.getQueueUrl(queueName, function (err, queueUrl) {
          assert(sqsMock.getQueueUrl.calledWith({ QueueName: queueName }));

          done();
        });
      });

      it('should call the callback with an error if the SQS call fails', function (done) {
        var postman = new Postman(sqsMock, {});

        var expectedError = new Error('getQueueUrl failed!');
        sqsMock.getQueueUrl.yields(expectedError);

        postman.getQueueUrl(queueName, function (err, queueUrl) {
          assert.equal(err, expectedError);
          done();
        });
      });

      it('should call the callback with the queueUrl', function (done) {
        var postman = new Postman(sqsMock, {});

        sqsMock.getQueueUrl.yields(null, { QueueUrl: queueUrl });

        postman.getQueueUrl(queueName, function (err, result) {
          assert.equal(result, queueUrl);
          done();
        });
      });

    });

    describe('#getStats()', function () {

      it('should use the right queue URL', function (done) {
        var postman = new Postman(sqsMock, {});

        sqsMock.getQueueAttributes.yields(null, { Attributes: { ApproximateNumberOfMessages: 5 } });

        postman.getStats(queueUrl, function (err, stats) {
          assert(sqsMock.getQueueAttributes.calledWith({
            QueueUrl: queueUrl,
            AttributeNames: ['All']
          }));

          done();
        });
      });

      it('should call the callback with an error if the SQS call fails', function (done) {
        var postman = new Postman(sqsMock, {});

        var expectedError = new Error('getQueueAttributes failed!');
        sqsMock.getQueueAttributes.yields(expectedError);

        postman.getStats(queueUrl, function (err, stats) {
          assert.equal(err, expectedError);
          done();
        });
      });

      it('should call the callback with a proper stats object', function (done) {
        var postman = new Postman(sqsMock, {});

        var sqsResponse = { Attributes: { ApproximateNumberOfMessages: 5 } };
        sqsMock.getQueueAttributes.yields(null, sqsResponse);

        postman.getStats(queueUrl, function (err, stats) {
          assert.deepEqual(stats, { messages: sqsResponse.Attributes.ApproximateNumberOfMessages });
          done();
        });
      });

    });

    describe('#sendMessage()', function () {

      it('should use the right queue URL', function (done) {
        var postman = new Postman(sqsMock, {});
        var messageOptions = {
          queueName: queueName,
          messageSource: __dirname + '/message.json',
          total: 10
        };

        sqsMock.sendMessageBatch.yields(null, 'batch');

        postman.sendMessage(messageOptions, function (err, result) {
          var args = sqsMock.sendMessageBatch.firstCall.args;
          var sqsOptionsArg = args[0];

          assert(sqsOptionsArg.QueueUrl, queueUrl);

          done();
        });
      });

      it('should contain batches with no more than 10 entries', function (done) {
        var postman = new Postman(sqsMock, {});
        var messageOptions = {
          queueName: queueName,
          messageSource: __dirname + '/message.json',
          total: 15
        };

        sqsMock.sendMessageBatch.yields(null, 'batch');

        var expectedBatches = Math.ceil(15 / 10);

        postman.sendMessage(messageOptions, function (err, result) {
          var args = null;
          var sqsOptionsArg = null;
          for (var i = 0; i < expectedBatches; i++) {
            args = sqsMock.sendMessageBatch.getCall(i).args;
            sqsOptionsArg = args[0];
            assert(sqsOptionsArg.Entries.length <= 10);
          }

          assert(sqsMock.sendMessageBatch.callCount, expectedBatches);

          done();
        });

      });

      it('should call the callback with an error if one of the batches fails', function (done) {
        var postman = new Postman(sqsMock, {});
        var messageOptions = {
          queueName: queueName,
          messageSource: __dirname + '/message.json',
          total: 10
        };

        var expectedError = new Error('Oops! the batches have failed');

        sqsMock.sendMessageBatch.yields(expectedError);

        postman.sendMessage(messageOptions, function (err, result) {
          assert(err, expectedError);
          done();
        });
      });

    });

  });

});

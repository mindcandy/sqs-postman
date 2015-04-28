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
    getQueueAttributes: sandbox.stub()
  };

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

  });

});

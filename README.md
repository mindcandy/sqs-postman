# sqs-postman

A simple tool for sending messages to AWS SQS

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

It comes with the following features out of the box:

- Sends messages in batches of up to 10 messages at a time (AWS limit)
- Batches are sent out in parallel using a default of `10` producers, which can be configured using the `--concurrent-producers` option

## Installation

```bash
$ npm install -g sqs-postman
```

## AWS Configuration

For configuring AWS credentials, please go [here](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

## Usage

```bash
$ postman --help

Usage: postman [options] [command]


  Commands:

    message [options] <queue>  Messages the specified queue
    stats <queue>              Gets queue stats

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -p, --aws-profile <value>  Specifies AWS profile name. It defaults to default
    -r, --aws-region <id>      Specifies the AWS region. It defaults to eu-west-1
```

The `help` option can be used in commands too `$ postman message --help`

### Examples

Send message to queue using custom AWS profile

```bash
$ postman message my-queue --aws-profile my-profile --message-source ./message.json
```

Send 15 messages to queue using custom profile and specific AWS region

```bash
$ postman message my-queue --aws-profile my-profile --aws-region us-east-1 --message-source ./message.json --total 15
```

Send 1000 messages using 20 concurrent producers

```bash
$ postman message my-queue --message-source ./message.json --total 1000 --concurrent-producers 20
```

## API

Postman can also be included on any project and used programmatically.

### `sendMessage(options, cb)`

- `options` - an object containing options
    - `queueName` - the name of the SQS queue
    - `messageSource` - the path to the file containing the message body, e.g.: `./my-message.json`
    - `total` - the total number of messages that need to be sent out
- `cb(err, result)` - a callback which is called when all messages have been sent, or an error occurs


### `getQueueUrl(queueName, cb)`

- `queueName` - the name of the SQS queue
- `cb(err, queueUrl)` - a callback which is called with either the `queueUrl` or an error if any

### `getStats(queueUrl, cb)`

- `queueUrl` - the queueUrl
- `cb(err, stats)` - a callback which is called with either the queue stats or an error if any

## Debugging

Postman uses the [debug](https://github.com/visionmedia/debug) module, and can be enabled as follows:

```bash
$ DEBUG=sqs-postman* postman ...
```

## Performance Tests

| Messages |   aws-cli  | sqs-postman |
| -------- | ---------- | ----------- |
|      100 |  0m 4.956s |    0m 0.90s |
|     1000 | 2m 31.457s |    0m 4.18s |
|    10000 | 8m 30.715s |   0m 30.83s |

The difference in performance between aws-cli and sqs-postman is huge! Because of sqs-postman's ability to process batches in parallel (async), the execution time can be reduced quite considerably.

These tests were performed on a Macbook Pro 15-inch, Mid 2012 with a 2.6 GHz Intel Core i7 Processor and 16 GB 1600 MHz DDR3 of RAM. And time was measured using Unix `time`.

## Contributing

Contributions are always welcome! Just follow the normal fork > branch > pull request workflow.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/sqs-postman.svg
[npm-url]: https://npmjs.org/package/sqs-postman
[downloads-image]: https://img.shields.io/npm/dm/sqs-postman.svg
[downloads-url]: https://npmjs.org/package/sqs-postman

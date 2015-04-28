# postman

A simple tool for sending messages to AWS SQS

It comes with the following features out of the box:

- Sends messages in batches of up to 10 messages at a time
- Batches are sent out in parallel using a default of `10` producers, which can be configured using the `--concurrent-producers` option

## Installation

```bash
$ npm install -g git@github.com:mindcandy/postman.git
```

## AWS Configuration

For configuring AWS credentials, please go [here](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

## API

### sendMessage(options, cb)

#### Arguments

- `options` - an object containing options
    - `queueName` - the name of the SQS queue
    - `messageSource` - the path to the file containing the message body, e.g.: `./my-message.json`
    - `total` - the total number of messages that need to be sent out
- `cb(err, result)` - a callback which is called when all messages have been sent, or an error occurs


### getQueueUrl(queueName, cb)

- `queueName` - the name of the SQS queue
- `cb(err, queueUrl)` - a callback which is called with either the `queueUrl` or an error if any

### getStats(queueUrl, cb)

- `queueUrl` - the queueUrl
- `cb(err, stats)` - a callback which is called with either the queue stats or an error if any

## Command Line

One of the best features of postman is that it can be used from the command line.

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

## Debugging

Postman uses the [debug](https://github.com/visionmedia/debug) module, and can be enabled as follows:

```bash
$ DEBUG=postman* postman ...
```

## License

MIT


/**
    Receives an Alexa request
    Diffrentiates between Launch and Intent
    Writes to SQS
    and responds with a speechlet
**/

'use strict';

var AWS = require("aws-sdk");
AWS.config.region = 'us-east-1';
var sqsURL = 'https://sqs.us-east-1.amazonaws.com/365496274414/colorexpert';
var appName = 'Emotional Cat';
exports.handler = function (event, context) {
    try {
        var speechletResponse;
        var messAttrs = {};
        messAttrs.app = {
            DataType: 'String',
            StringValue: appName
        };
        if (event.request.type === "LaunchRequest") {
            speechletResponse = buildSpeechletResponse("Cat is happy sad or grumpy");
            messAttrs.content = {
                DataType: 'String',
                StringValue: 'launched'
            };
            writeToSqs(appName + '::' + 'Happy, Sad, or Grumpy?', context, speechletResponse, messAttrs);
        } else if (event.request.type === "IntentRequest") {
            var intentName = event.request.intent.name;
            var suffix;
            messAttrs.content = {
                DataType: 'String'
            };
            switch(intentName) {
                case "SadCat":
                    suffix = 'Sad Cat';
                    speechletResponse = buildSpeechletResponse("why you want sad kitty");
                    messAttrs.content.StringValue = 'sad';
                    break;
                case "HappyCat":
                    suffix = 'Happy Cat';
                    speechletResponse = buildSpeechletResponse("mew mew mew mew mew mew mew mew mew mew mew");
                    messAttrs.content.StringValue = 'happy';
                    break;
                case "GrumpyCat":
                    suffix = 'Grumpy Cat';
                    speechletResponse = buildSpeechletResponse("you should buy a boat");
                    messAttrs.content.StringValue = 'grumpy';
                    break;
                default:
                    throw "unspecified intent";
            }
            writeToSqs(appName + '::' + suffix, context, speechletResponse, messAttrs);
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function writeToSqs(msg, context, speechletResponse, mattrs) {
    var queue = new AWS.SQS();
    var params = {
        MessageBody: msg,
        QueueUrl: sqsURL,
        MessageAttributes: mattrs
    };
    
    console.log('ooooga we writin to ' + sqsURL);
    queue.sendMessage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log("message Sent");
        }
        context.succeed(buildResponse(speechletResponse));
    });
}

function buildSpeechletResponse(output) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        }
    };
}

function buildResponse(speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: {},
        response: speechletResponse
    };
}
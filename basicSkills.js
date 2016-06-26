
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
exports.handler = function (event, context) {
    try {
        var speechletResponse;
        if (event.request.type === "LaunchRequest") {
            speechletResponse = buildSpeechletResponse("hey I am the launch");
            var messAttrs = {
                app: {
                    DataType: 'String',
                    StringValue: 'MotivationBus'
                },
                content: {
                    DataType: 'String',
                    StringValue: 'y6n0XsiX_QQ'
                }
            };
            writeToSqs('MotivationBus::Launch', context, speechletResponse, messAttrs);
        } else if (event.request.type === "IntentRequest") {
            speechletResponse = buildSpeechletResponse("hey I am the intent");
            writeToSqs('MotivationBus::Intent', context, speechletResponse, data);
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
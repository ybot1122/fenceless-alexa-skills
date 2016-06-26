
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
        var messAttrs = {};
        messAttrs.app = {
            DataType: 'String',
            StringValue: 'MotivationBus'
        };
        if (event.request.type === "LaunchRequest") {
            speechletResponse = buildSpeechletResponse("Let's do this");
            messAttrs.video = {
                DataType: 'String',
                StringValue: 'y6n0XsiX_QQ'
            };
            writeToSqs('MotivationBus::Launch', context, speechletResponse, messAttrs);
        } else if (event.request.type === "IntentRequest") {
            var intentName = event.request.intent.name;
            messAttrs.video = {
                DataType: 'String'
            };
            switch(intentName) {
                case "PushMe":
                    speechletResponse = buildSpeechletResponse("Push It");
                    messAttrs.video.StringValue = 'nI4PFf0YBHI';
                    break;
                case "SootheMe":
                    speechletResponse = buildSpeechletResponse("Soothe It");
                    messAttrs.video.StringValue = 'pCVF0CSRTYA';
                    break;
                case "MotivateMe":
                    speechletResponse = buildSpeechletResponse("Motivate It");
                    messAttrs.video.StringValue = '2iyb2ovLN3E';
                    break;
                case "BeastMode":
                    speechletResponse = buildSpeechletResponse("Break It");
                    messAttrs.video.StringValue = 'G5w7MIKwSO0';
                    break;
                default:
                    throw "unspecified intent";
            }
            writeToSqs('MotivationBus::Intent', context, speechletResponse, messAttrs);
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
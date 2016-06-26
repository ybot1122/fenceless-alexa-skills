
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
            StringValue: 'Mash And Jam'
        };
        if (event.request.type === "LaunchRequest") {
            speechletResponse = buildSpeechletResponse("Let's do this");
            messAttrs.video = {
                DataType: 'String',
                StringValue: 'y6n0XsiX_QQ'
            };
            writeToSqs('Mash And Jam::Recommendation', context, speechletResponse, messAttrs);
        } else if (event.request.type === "IntentRequest") {
            var intentName = event.request.intent.name;
            var suffix;
            messAttrs.video = {
                DataType: 'String'
            };
            switch(intentName) {
                case "RecommendMe":
                    suffix = 'Recommendation';
                    speechletResponse = buildSpeechletResponse("Lets do this");
                    messAttrs.video.StringValue = 'y6n0XsiX_QQ';
                    break;
                case "PushMe":
                    suffix = 'pregame';
                    speechletResponse = buildSpeechletResponse("Lets Bump This Yo");
                    messAttrs.video.StringValue = 'G5w7MIKwSO0';
                    break;
                case "SootheMe":
                    suffix = 'chillin';
                    speechletResponse = buildSpeechletResponse("Low Key Turn Up");
                    messAttrs.video.StringValue = 'Zovq8G3hcc0';
                    break;
                case "MotivateMe":
                    suffix = 'hyped';
                    speechletResponse = buildSpeechletResponse("Who Gonna Stop Us");
                    messAttrs.video.StringValue = 'Ss71qissgfU';
                    break;
                default:
                    throw "unspecified intent";
            }
            writeToSqs('Mash And Jam::' + suffix, context, speechletResponse, messAttrs);
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
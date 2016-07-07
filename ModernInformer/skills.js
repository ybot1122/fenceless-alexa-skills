
/**
    MODERN INFORMER
**/

'use strict';

var AWS = require("aws-sdk");
AWS.config.region = 'us-east-1';
var sqsURL = 'https://sqs.us-east-1.amazonaws.com/365496274414/colorexpert';
var appName = 'Headline Hitter';
var http = require('http');
exports.handler = function (event, context) {
    try {
        var messAttrs = {};
        messAttrs.app = {
            DataType: 'String',
            StringValue: appName
        };
        if (event.request.type === "LaunchRequest") {
            var speechletResponse = buildSpeechletResponse("Top Story");
            messAttrs.content = {
                DataType: 'String',
                StringValue: 'top'
            };
            writeToSqs(appName + '::' + 'Top Story', messAttrs);
            context.succeed(buildResponse(speechletResponse));
        } else if (event.request.type === "IntentRequest") {
            var intentName = event.request.intent.name;
            var suffix;
            var topic;
            messAttrs.content = {
                DataType: 'String'
            };
            switch(intentName) {
                case "TopHeadline":
                    suffix = 'Top Story';
                    messAttrs.content.StringValue = 'top';
                    topic = 'home';
                    break;
                case "SportsHeadline":
                    suffix = 'Top Sports Story';
                    messAttrs.content.StringValue = 'sports';
                    topic = 'sports';
                    break;
                case "PoliticsHeadline":
                    suffix = 'Top Politics Story';
                    messAttrs.content.StringValue = 'politics';
                    topic = 'politics';
                    break;
                case "WorldHeadline":
                    suffix = 'Top World Story';
                    messAttrs.content.StringValue = 'world';
                    topic = 'world';
                    break;
                default:
                    throw "unspecified intent";
            }
            writeToSqs(appName + '::' + suffix, messAttrs);
            requestHeadline(context, topic);
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function requestHeadline(context, topic) {
    var url = "https://api.nytimes.com/svc/topstories/v2/" + topic + ".json";
    url += "?api-key=284edb50e7c4e855497c5135176c9f14:17:67515972";

    var options = {
        protocol: "http:",
        host: "api.nytimes.com",
        path: "/svc/topstories/v2/" + topic + ".json?api-key=284edb50e7c4e855497c5135176c9f14:17:67515972"
    };

    http.request(options, function(response) {

      var rawStr = "";
      response.on('data', (chunk) => {
        rawStr += chunk;
      });

      response.on('end', () => {
        var res = JSON.parse(rawStr);
        var story = res.results[0];
        var byline = story.byline;
        var title = story.title;
        var abstract = story.abstract;
        var speechletResponse = buildSpeechletResponse(title);
        context.succeed(buildResponse(speechletResponse));
      });

    }).end();
}

function writeToSqs(msg, mattrs) {
    var queue = new AWS.SQS();
    var params = {
        MessageBody: msg,
        QueueUrl: sqsURL,
        MessageAttributes: mattrs
    };
    
    queue.sendMessage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        }
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
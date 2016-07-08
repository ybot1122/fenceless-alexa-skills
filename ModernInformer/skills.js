
/**
    MODERN INFORMER
**/

'use strict';

var appName = 'Modern Informer';
var http = require('http');
exports.handler = function (event, context) {
  try {
    if (event.request.type === "LaunchRequest") {
      // LaunchRequest
      var speechletResponse = buildSpeechletResponse("Would you like the top headline in sports, politics, or world?");
      context.succeed(buildResponse(speechletResponse, false));
    } else if (event.request.type === "IntentRequest") {
      // IntentRequest
      var intentName = event.request.intent.name;
      var topic;
      switch(intentName) {
        case "SportsHeadline":
          topic = "sports";
          break;
        case "PoliticsHeadline":
          topic = "politics";
          break;
        case "WorldHeadline":
          topic = "world";
          break;
        default:
          throw "unspecified intent";
      }
      requestHeadline(context, topic);
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

// routine to my GET call for headline from NYT
function requestHeadline(context, topic) {
    var url = "https://api.nytimes.com/svc/topstories/v2/" + topic + ".json";
    url += "?api-key=284edb50e7c4e855497c5135176c9f14:17:67515972";

    var options = {
        protocol: "http:",
        host: "api.nytimes.com",
        path: "/svc/topstories/v2/" + topic + ".json?api-key=284edb50e7c4e855497c5135176c9f14:17:67515972"
    };

    // callback to be invoked when response is received
    http.request(options, function(response) {
      var rawStr = "";

      // append data from stream
      response.on('data', (chunk) => {
        rawStr += chunk;
      });

      // end of stream. build response and finish
      response.on('end', () => {
        var res = JSON.parse(rawStr);
        var story = res.results[0];
        var byline = story.byline;
        var title = story.title;
        var abstract = story.abstract;
        var speechletResponse = buildSpeechletResponse(title);
        context.succeed(buildResponse(speechletResponse, true));
      });
    }).end();
}

function buildSpeechletResponse(output) {
    return {
      type: "PlainText",
      text: output
    };
}

function buildResponse(speechletResponse, endSession) {
    return {
        version: "1.0",
        response: {
          outputSpeech: speechletResponse,
          shouldEndSession: endSession
        }
    };
}
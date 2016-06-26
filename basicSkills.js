
'use strict';

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        var speechletResponse;
        if (event.request.type === "LaunchRequest") {
            speechletResponse = buildSpeechletResponse("hey I am the launch");
            context.succeed(buildResponse(speechletResponse));
        } else if (event.request.type === "IntentRequest") {
            speechletResponse = buildSpeechletResponse("hey I am the intent");
            context.succeed(buildResponse(speechletResponse));
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

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
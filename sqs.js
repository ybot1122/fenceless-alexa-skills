var Blah = (function() {
  var cognitoIdentityPoolID = 'us-east-1:48326d47-5092-42a0-baa7-1639194edd04';
  var sqsUrl = 'https://sqs.us-east-1.amazonaws.com/365496274414/colorexpert';
  var awsRegion = 'us-east-1';

  // set the default config object
  var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolID
  });

  AWS.config.credentials = creds;
  AWS.config.region = awsRegion ;
  var sqs = new AWS.SQS();

  function getQ() {
    var params = {
      QueueUrl: sqsUrl, /* required */
      VisibilityTimeout: 0,
      WaitTimeSeconds: 20,
      MessageAttributeNames: ['All']
    };

    // get message from sqs
    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log(data);
        if (data.Messages[0]) {
          var myMessage = data.Messages[0]
          document.getElementById("sqsMessage").innerHTML = myMessage.Body;

          var msgAttrs = myMessage.MessageAttributes;
          var appName = msgAttrs.app.StringValue;
          console.log(appName);
          if (appName === "Mash And Jam") {
            var div_player = document.createElement('div');
            var div_container = document.getElementById('mash-and-jam');
            div_player.id = 'player';
            div_container.innerHTML = '';
            div_container.appendChild(div_player);

            var vid = msgAttrs.video.StringValue;
            player = new YT.Player('player', {
              height: '100%',
              videoId: vid,
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                autohide: 1
              }
            });
          } else {
            console.error("unknown app");
          }
        }
      }

      // delete the sqs message
      var params = {
        QueueUrl: sqsUrl,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      sqs.deleteMessage(params, function(err, data) {
        if (err) {
          console.error(err, err.stack);
        }
        getQ();
      });
    });
  }

  getQ();
  setInterval(getQ, 21000);
}());
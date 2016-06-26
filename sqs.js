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
    console.log('called');
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
          var myData = data.Messages[0].Body;
          document.getElementById("sqsMessage").innerHTML = myData;
          console.log(data.Messages[0].MessageAttributes);
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
}());
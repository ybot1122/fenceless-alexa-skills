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
          } else if (appName === "Headline Hitter") {
            var topic = msgAttrs.content.StringValue;
            if (topic === "top") { topic = "home"; }
            var url = "https://api.nytimes.com/svc/topstories/v2/" + topic + ".json";
            url += "?api-key=284edb50e7c4e855497c5135176c9f14:17:67515972";
            
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
              var res = JSON.parse(oReq.responseText);
              var story = res.results[0];
              var byline = story.byline;
              var title = story.title;
              var abstract = story.abstract;
              var short_url = story.short_url;
              var div_container = document.getElementById('modern-informer');
              div_container.innerHTML = '';

              var div_title = document.createElement('h3');
              div_title.innerHTML = title;

              var div_byline = document.createElement('div');
              div_byline.innerHTML = byline;
              div_byline.id = 'mi_byline';

              var div_abstract = document.createElement('div');
              div_abstract.innerHTML = abstract;
              div_abstract.id = 'mi_abstract';

              var div_url = document.createElement('a');
              div_url.innerHTML = "full story: " + short_url;
              div_url.setAttribute('href', short_url);

              div_container.appendChild(div_title);
              div_container.appendChild(div_byline);
              if (story.multimedia && story.multimedia.length > 0) {

                story.multimedia.sort(function(a, b) {
                  return b.width - a.width;
                });
                console.log(story.multimedia);

                var div_img = document.createElement('img');
                div_img.setAttribute('src', story.multimedia[0].url);
                div_container.appendChild(div_img);
              }
              div_container.appendChild(div_abstract);
              div_container.appendChild(div_url);
            });
            oReq.open("GET", url);
            oReq.send();

          } else if (appName === "Emotional Cat") {
            var oReq = new XMLHttpRequest();
            var emotion = msgAttrs.content.StringValue;
            if (emotion !== 'launched') {
              var url = "https://api.imgur.com/3/gallery/search/time?q=" + emotion + "%20cat";
              oReq.addEventListener("load", function() {
                var res = JSON.parse(oReq.responseText);
                var cat = res.data[5];
                console.log(res);
                var cat_title = cat.title;
                var cat_poster = cat.account_url;
                var cat_link = cat.link;

                var div_container = document.getElementById('emotional-cat');
                div_container.innerHTML = '';

                var div_title = document.createElement('h3');
                div_title.innerHTML = cat_title;

                var div_byline = document.createElement('div');
                div_byline.innerHTML = "Posted by: " + cat_poster;

                var div_img = document.createElement('img');
                if (cat.link) {
                  div_img.setAttribute('src', cat.link);
                } else if (cat.mp4) {
                  div_img.setAttribute('src', cat.mp4);
                } else if (cat.gifv) {
                  div_img.setAttribute('src', cat.gifv);
                } else {
                  div_img.setAttribute('src', "https://i.imgur.com/" + cat.cover + ".jpg");
                }
                div_container.appendChild(div_title);
                div_container.appendChild(div_byline);
                div_container.appendChild(div_img);
              });
              oReq.open("GET", url);
              oReq.setRequestHeader("Authorization", "Client-ID 757517983818ba0");
              oReq.send()              
            }

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
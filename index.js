var express = require('express');
var server = express();
var tmi = require('tmi.js');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "sdhacks",
    password: "sdhacks",
    database: "default"
})

server.get("/", function(req, res) {
  res.end("Hello World");
});

server.listen(80, function() {
  console.log("listening");
});

var client = new tmi.client({
  identity: {
    username: 'kevzho',
    password: 'oauth:m4hjanfsfjrexi5nyrw20ofdvo6s3d'
  },
  channels: ["#kevzho"]
});
client.connect();
function check() {
  if (client.readyState() != "OPEN") {
    setTimeout(check, 100);
  } else {
    init();
  }
}
function init() {
  console.log("init called");
  connection.connect(function(err) {
    if (err == null) {
      console.log("success");
    } else {
      console.log(err);
    }
  });
  client.on("message", function(channel, user, message, self) {
    if (self) return;
    if (user["message-type"] == "whisper") {
      // PM
      console.log(message);
      if (message == "PLS IM SO LONELY") {
        connection.query('SELECT * FROM sdhacks;', function(err, rows, fields) {
          if (err) throw err;

          connection.query('SELECT * FROM sdhacks WHERE user = "' + user + '";', function(err, rows2, fields) {
            if (rows2.length > 0) {
              var userFollows = rows2[0].following.split(",");
              var biggestFollowing = 0;
              var biggestFollowingUsername = "";

              rows.forEach(function(row) {
                if (row.username != rows2[0].username) {
                  var counter = 0;

                  userFollows.forEach(function(userFollow) {
                    if (row.indexOf(userFollow) != -1) {
                      counter++;
                    }
                  });

                  if (biggestFollowing < counter) {
                    biggestFollowing = counter;
                    biggestFollowingUsername = row.username;
                  }
                }
              });

              // return biggest
            }
          });

          console.log('The solution is: ', rows[0].solution);
        });
       // find partner
      }
    } else if (user["message-type"] == "chat") {
      // chat message
      console.log(message);
      var following;
      // GET followed streams of current user when they enroll
      if (message == "!enroll") {
        client.api({
          url: "https://api.twitch.tv/kraken/user",
          method: "GET /streams/followed",
          headers: {
            "Accept": "application/vnd.twitchtv.v3+json",
            "Authorization": "OAuth 3eb787117110834e079932bedfb8e6a7",
            "Client-ID": "1dac77895e8f56fa1a71e7c43ef09d87"
          }
        }, function(err, res, body) {
            console.log(body);
            following = body["streams"];
        });
        // PULL user info, stick into mySQL, send message back
        connection.query("INSERT INTO sdhacks (username, following) VALUES (" +
          connection.escape(user) + ", " + connection.escape(following)+ ")");
      }
    }
  });

  // client.on("chat", function (channel, user, message, self) {
  //     // Don't listen to my own messages..
  //     if (self) return;
  //     console.log(message);
  //     // Do your stuff.
  // });
  // client.on("whisper", function (user, message) {
  //   // Do your stuff.
  //   console.log(user);
  //   console.log(message);
  // });
}
check();
client.api({
    url: "https://api.twitch.tv/kraken/?client_id=kulwfkh2h6utqnc916kraui298qgwrj"
}, function(err, res, body) {
    console.log(body);
    // console.log(client.getUsername());
});

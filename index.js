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
      if (message == "match me") {
        console.log("matching");
        connection.query('SELECT * FROM sdhacks;', function(err, rows, fields) {
          if (err) throw err;
          console.log('SELECT * FROM sdhacks WHERE username = "' + user.username + '";');
          connection.query('SELECT * FROM sdhacks WHERE username = "' + user.username + '";', function(err, rows2, fields) {
            if (rows2 && rows2.length > 0) {
              var userFollows = rows2[0].following.split(",");
              var biggestFollowing = 0;
              var biggestFollowingUsername = "";

              rows.forEach(function(row) {
                if (row.username != rows2[0].username) {
                  var counter = 0;

                  userFollows.forEach(function(userFollow) {
                    console.log(row.following);
                    if (row.following.indexOf(userFollow) != -1) {
                      counter++;
                    }
                  });

                  if (biggestFollowing < counter) {
                    biggestFollowing = counter;
                    biggestFollowingUsername = row.username;
                  }
                }
              });

              if (biggestFollowing > 0) {
                client.whisper(rows2[0].username, "Your best match is " + biggestFollowingUsername + " with a " + (biggestFollowing / userFollows.length * 100) + "% match strength");
              } else {
                client.whisper(rows2[0].username, "You did not have any matches. Sorry.");
              }
            } else {
              // console.log("enroll first");
              // console.log(user.username);
              client.whisper(user.username, "Please !enroll in chat first.").catch(function(err) {
                throw err;
              });
            }
          });
        });
       // find partner
      }
    } else if (user["message-type"] == "chat") {
      // chat message
      console.log(message);
      var following = new Array();
      // GET followed streams of current user when they enroll
      if (message == "!enroll") {
        client.api({
          url: "https://api.twitch.tv/kraken/users/" + user.username + "/follows/channels",
          method: "GET",
          headers: {
            "Accept": "application/vnd.twitchtv.v3+json",
            "Authorization": "OAuth m4hjanfsfjrexi5nyrw20ofdvo6s3d",
            "Client-ID": "kulwfkh2h6utqnc916kraui298qgwrj"
          }
        }, function(err, res, body) {
            // console.log(body["streams"][0].channel);
            console.log(body);
            body["follows"].forEach(function(stream) {
              following.push(stream.channel.name);
            });
            try {
              connection.query("DELETE FROM sdhacks WHERE username='" + user.username +"';");
            } catch (e) {}
            connection.query("INSERT INTO sdhacks (username, following) VALUES (" + connection.escape(user.username) + ", " + connection.escape(following.join(","))+ ")");
            client.say("kevzho", user.username + ", you have been enrolled! PM me 'match me' to match with someone.");
        });
        // PULL user info, stick into mySQL, send message back
        // connection.query("INSERT INTO sdhacks (username, following) VALUES (" +
        //   connection.escape(user) + ", " + connection.escape(following.join(","))+ ")");
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

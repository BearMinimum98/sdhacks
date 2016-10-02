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
       // find partner
      }
    } else if (user["message-type"] == "chat") {
      // chat message
      console.log(message);
      if (message == "!enroll") {
        // PULL user info, stick into mySQL, send message back

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

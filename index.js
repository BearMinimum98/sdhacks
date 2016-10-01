var express = require('express');
var server = express();
var tmi = require('tmi.js');

server.get("/", function(req, res) {
  res.end("Hello World");
});

server.listen(80, function() {
  console.log("listening");
})
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
  client.on("message", function(channel, user, message, self) {
    if (self) return;
    if (user["message-type"] == "whisper") {
      // PM
      console.log(message);
    } else if (user["message-type"] == "chat") {
      // chat message
      console.log(message);
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

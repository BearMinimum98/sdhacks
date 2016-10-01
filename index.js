var express = require('express');
var server = express();

server.get("/", function(req, res) {
  res.end("Hello World");
});

server.listen(808, function() {
  console.log("listening");
})

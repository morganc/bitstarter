var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var myBuffer = fs.readFile('index.html');
  var myMessage = 'There is no such file';
  if (myBuffer) {
    myMessage = myBuffer.toString();
  }
  response.send(myMessage);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

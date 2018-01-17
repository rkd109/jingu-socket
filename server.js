var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

http.listen(port, function(){
  console.log('listening on *:'+port);
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  // io.emit('chat message', 'a user connected');
  socket.on('disconnect', function(){
    io.emit('chat message', 'user disconnected');
  });
});
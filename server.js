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
  // socket.on('chat message', function(msg){
  //   io.emit('chat message', msg);
  // });
  // io.emit('chat message', 'a user connected');
  socket.on('disconnect', function(data){
    io.emit('disconnect', data);
    console.log('exit users' + data);
  });
  socket.on('connect', function(data){
    io.emit('connect', data);
    console.log('connect users' + data);
  });
    // Join Room
    socket.on('join', function(data) {
      socket.join('room' + data.roomId);
      console.log('join users' + data);
    });
    // Broadcast to room
    socket.on('chat message', function(data) {
      io.sockets.in('room' + data.roomId).emit('chat message', data.message);
      console.log('chat message' + data);
    });
});
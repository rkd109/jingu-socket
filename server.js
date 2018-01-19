var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8080;

io.set('heartbeat timeout', 50000);
io.set('heartbeat interval', 10000);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on *:'+port);
});

io.on('connection', function(socket){
    var username ;
    var roomname;
    socket.on('disconnect', function(data){
        io.sockets.in('room' + roomname).emit('disconnect', username);
        console.log('exit users' + username);
  });
  // socket.on('connect', function(data){
  //   io.emit('connect', data);
  //   console.log('connect users' + data);
  // });
    // Join Room 
    socket.on('join', function(data) {
        socket.join('room' + data.roomId);
        username = data.nickName;
        roomname = data.roomname;
        io.sockets.in('room' + data.roomname).emit('join message', data.nickName);
        console.log('join users : ' + data.nickName);
    });
    // Broadcast to room
    socket.on('chat message', function(data) {
        io.sockets.in('room' + data.roomname).emit('chat message', data.message);
        console.log('chat message : ' + data.message);
    });
});  
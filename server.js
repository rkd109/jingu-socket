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
// var userlist = [];
var roomlist = [];
io.on('connection', function(socket){
    var username ;
    var roomname;
    socket.on('disconnect', function(data){
      //1. 유저가 해당 방에서 나간다 .. 유저가 나간 방을 검색
        var disconnectinfo =  roomlist.filter(x => x.roomname === roomname)

        
        if(disconnectinfo.length == 0) 
          return false;

      //2. 해당 방의 유저리스트에서 유저 이름 삭제
          delete disconnectinfo[0].userlist[disconnectinfo[0].userlist.indexOf(username)];
         
          
          io.sockets.in('room' + roomname).emit('disconnect', username, disconnectinfo[0].userlist);

        // delete userlist[userlist.indexOf(username)];
        // io.sockets.in('room' + roomname).emit('disconnect', username, userlist);
        
        console.log('exit users' + username);
  });
    // Join Room 
    socket.on('join', function(data) {
        socket.join('room' + data.roomname);
        username = data.nickName;
        roomname = data.roomname;

        var isroom = roomlist.filter(x=> x.roomname === roomname);
        var currentRoomUserList ; 

        //1. 방의 중복 여부를 확인한다 없다면 룸 리스트에 추가 (방 이름의 중복은 허용치 않는다.)
        if(isroom.length === 0)
        {
            roomlist.push({roomname : roomname , userlist : new Array()});
        }
        //0번째가 없는 케이스는 없을 것으로 생각되는데 , 다른 방법이 있는지 생각해보자
        currentRoomUserList = roomlist.filter(x=> x.roomname === roomname);

        //2. 방 목록에 추가가 되었다면, 유저를 추가 한다.
        currentRoomUserList[0].userlist.push(username);

        io.sockets.in('room' + roomname).emit('join message', username , currentRoomUserList[0].userlist);
        //1. 방의 중복 여부를 확인한다
        //2. 중복이 없다면 리스트에 방과 방의 유저리스트를 추가한다.
        //2. 중복이 있다면 리스트를 검색하여 해당 방의 유저리스트에 추가한다
        

        // io.sockets.in('room' + data.roomname).emit('userlist', userlist);

        console.log('join users : ' + data.nickName);
    });
    // Broadcast to room
    socket.on('chat message', function(data) {
        io.sockets.in('room' + data.roomname).emit('chat message', data.message);
        console.log('chat message : ' + data.message);
    });
});  
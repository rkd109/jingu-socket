var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8000;
//var port = 8000; -> aws port

io.set('heartbeat timeout', 50000);
io.set('heartbeat interval', 10000);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on *:'+port);
});

//var roomlist = [ {roomname : 'a', userlist : new Array('a','b','c') }, {roomname : 'b', userlist : new Array('d','e') } ];
var roomlist = [];

io.on('connection', function(socket){
    var username ;
    var roomname;

    socket.on('connection', function(data){
    //    if (JSON.stringify(roomlist) != JSON.stringify(data)){
        socket.emit('connection', roomlist);
    //    }

     });

    socket.on('disconnect', function(data){
        //1. 유저가 해당 방에서 나간다 .. 유저가 나간 방을 검색
        // var disconnectinfo =  roomlist.filter(x => x.roomname === roomname);
        var disconnectinfo =  roomlist.find(x => x.roomname === roomname);
        // console.log('disconnectinfo  ' + disconnectinfo);
        // console.log('disconnectinfo.userlist  ' + disconnectinfo.userlist);
        if(disconnectinfo == undefined)
            return false;

        // console.log(disconnectinfo);

        //2. 해당 방의 유저리스트에서 유저 이름 삭제
        // delete disconnectinfo[0].userlist[disconnectinfo[0].userlist.indexOf(username)];
        if(typeof(disconnectinfo.userlist) == 'object'){
            disconnectinfo.userlist.splice(disconnectinfo.userlist.indexOf(username),1);
        }
        if(disconnectinfo.userlist.length == 0 )
        {
            roomlist.splice(roomlist.findIndex(x => x.roomname === roomname) , 1);
        }
        else
        {
            io.sockets.in('room' + roomname).emit('disconnect', username, disconnectinfo.userlist);
        }
        
        // delete userlist[userlist.indexOf(username)];
        // io.sockets.in('room' + roomname).emit('disconnect', username, userlist);
        
        // console.log('exit users' + username);

  });

    // Join Room 
    socket.on('join', function(data) {
        socket.join('room' + data.roomname);
        username = data.nickName;
        roomname = data.roomname;

        var isroom = roomlist.find(x=> x.roomname === roomname);
        var currentRoomUserList ; 

        //1. 방의 중복 여부를 확인한다 없다면 룸 리스트에 추가 (방 이름의 중복은 허용치 않는다.)
        if(isroom == undefined)
        {
            roomlist.push({roomname : roomname , userlist : new Array()});
        }
        //0번째가 없는 케이스는 없을 것으로 생각되는데 , 다른 방법이 있는지 생각해보자
        currentRoomUser = roomlist.find(x=> x.roomname === roomname);

        //2. 방 목록에 추가가 되었다면, 유저를 추가 한다.
        currentRoomUser.userlist.push(username);

        io.sockets.in('room' + roomname).emit('join message', username , currentRoomUser.userlist);
        //1. 방의 중복 여부를 확인한다
        //2. 중복이 없다면 리스트에 방과 방의 유저리스트를 추가한다.
        //2. 중복이 있다면 리스트를 검색하여 해당 방의 유저리스트에 추가한다

        // io.sockets.in('room' + data.roomname).emit('userlist', userlist);

    });

    // Broadcast to room
    socket.on('chat message', function(data) {

        io.sockets.in('room' + data.roomname).emit('chat message', data.message , data.nickName);
        
    });
});  
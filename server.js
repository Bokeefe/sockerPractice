/* jshint esversion:6 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
    let votes =[{name:'brexit',cnntCount:1,yea:0,nay:0},{name:'brexit',cnntCount:1,yea:0,nay:0}];
    let voteNames = ['brexit'];
    socket.emit('getVotes', voteNames);

    socket.on('newVote', function (data) {
        
    });

    socket.on('votePick', function (data) {
        let voteID = data.votePick;
        // console.log(voteID);

        // app.get('/'+voteID, function (req, res) {
        //     res.sendFile(__dirname + '/canvas.html');
        //   });
        
    });
  });

  app.post('/votePick', (req, res) => { 
      console.log(req.votePick);
      res.send("hello?");
    // app.get('/'+voteID, (req, res) => {
    // });

  });
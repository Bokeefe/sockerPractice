/* jshint esversion:6 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

server.listen(80);
let votes = ['brexit','Catalan']
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/getVotes',(req,res)=>{
    res.send(votes);
});

app.post('/votePick', (req, res) => { 
    let voteName = req.body.votePick;
    res.send(voteName);

    app.get('/'+voteName,(req,res)=>{
        res.sendFile(__dirname + '/canvas.html');
    });
    var nsp = io.of('/');
    nsp.on('connection', function(socket){
      socket.join(voteName);
      socket.emit();
      setTimeout(()=>{console.log(socket.nsp.adapter.rooms);},5000);
    });


});


// io.on('connection', function (socket) {
//     let votes =[{name:'brexit',cnntCount:1,yea:0,nay:0},{name:'buyfut',cnntCount:1,yea:0,nay:0}];
//     let voteNames = ['brexit'];
//     socket.emit('getVotes', voteNames);

//     socket.on('newVote', function (data) {
        
//     });

//     socket.on('votePick', function (data) {
//         let voteID = data.votePick;
//     });
// });


    // votes.forEach((element)=> {
    //     if(element.name===req.body.votePick){
    //         res.send(JSON.stringify(element));
    //     } 
    // }, this);

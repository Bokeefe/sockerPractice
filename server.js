/* jshint esversion:6 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");
const db = require('./db.json');
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
console.log(db);
app.post('/votePick', (req, res) => { 
    let voteName = req.body.votePick;
    res.send(voteName);

    app.get('/'+voteName,(req,res)=>{
        res.sendFile(__dirname + '/canvas.html');
    });
    var nsp = io.of('/');
    nsp.on('connection', function(socket){
        allVotes = [];
      socket.join(voteName);
      //db[voteName].cnctCount++;
        //socket.rooms[voteName]={'yea':0,'nay':0,'cnctCount':1};
        if(!db[voteName]) {
            db[voteName]={'yea':0,'nay':0,'cnctCount':1};
            socket.emit('update',db[voteName]);
        } else {
            socket.emit('update',db[voteName]);
        }
        socket.on('yea', function () {
            db[voteName].yea++;
            socket.emit('update',db[voteName]);
          });
          socket.on('nay', function () {
            db[voteName].nay++;
            socket.emit('update',db[voteName]);            
          });
      setInterval(()=>{console.log(db[voteName]);},3000);
    });
});


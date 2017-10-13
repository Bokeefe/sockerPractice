/* jshint esversion:6 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");
let db = require('./db.json');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

server.listen(80);
let votes = ['brexit','Catalan']
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/newVote', (req, res) => {
    var voteName = JSON.parse(req.body.voteName);
    votes.push(voteName);
    res.send(voteName);
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
        if(!db[voteName]) {
            db[voteName]={'yea':0,'nay':0,'cnctCount':1};
            socket.emit('update',db[voteName]);
        } else {
            socket.emit('update',db[voteName]);
        }

        socket.on('yea', function () {
            db[voteName].yea++;
            socket.emit('update',db[voteName]);
            save(db);
          });
          socket.on('nay', function () {
            db[voteName].nay++;
            socket.emit('update',db[voteName]);   
            save(db);
          });
    });
});

function save(x){
    console.log(x);
    x = JSON.stringify(x);   
    fs.writeFileSync('./db.json', x);
}

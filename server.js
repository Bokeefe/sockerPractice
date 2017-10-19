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
let votes = [];

db.forEach((i)=> {
    votes.push(i.voteName);
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/newVote', (req, res) => {
    var voteName = JSON.parse(req.body.voteName);
    console.log(votes.indexOf(voteName));
    if(votes.indexOf(voteName) !== -1 ){
        res.send("That name has already been used recently");
    } else {
        votes.push(voteName);
        res.send(voteName);
    }
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
            db[voteName]={'yea':0,'nay':0,'abs':0,'cnctCount':1};
            socket.emit('update',db[voteName]);
        } else {
            socket.emit('update',db[voteName]);
        }

        socket.on('yea', function () {
            db[voteName].yea++;
            socket.emit('update',db[voteName]);
            save(db,voteName);
          });
          socket.on('nay', function () {
            db[voteName].nay++;
            socket.emit('update',db[voteName]);   
            save(db,voteName);
          });
          socket.on('abs', function () {
            db[voteName].abs++;
            socket.emit('update',db[voteName]);   
            save(db,voteName);
          });
    });
});

function save(entireDB,name){
    console.log(entireDB[name]);

    //x = JSON.stringify(x);   
   // fs.writeFileSync('./db.json', x);
}

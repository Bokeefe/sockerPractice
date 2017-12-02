/* jshint esversion:6 */
var app = require('express')();
var http = require('http').Server(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");

const voted = new Set;
var nsp = io.of('/');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

server.listen(85);

let votes = [];
let db = [];

db.forEach((i)=> {
    votes.push(i.voteName);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/newVote', (req, res) => {
    var voteName = JSON.parse(req.body.voteName);
    if(votes.indexOf(voteName) !== -1 ){
        res.send("That name has already been used recently");
    } else {
        votes.push(voteName);
        res.send(voteName);
    }
});

app.post('/getVotes',(req,res)=>{
    const oldVotes = require('./dbArray.json');
    let allVotes = {"currentVotes": votes, "oldVotes":oldVotes};
    res.send(allVotes);
});

app.post('/votePick', (req, res) => { 
    let voteName = req.body.votePick;
    res.send(voteName);

    app.get('/'+voteName,(req,res)=>{
        //TODO Verify if vote exists
        res.sendFile(__dirname + '/room.html');
    });
    
    nsp.on('connection', (socket) => {
        if(voted.has(socket)) return;
            voted.add(socket);
        
        socket.on('room', (voteName) => {
            socket.join(voteName);

            if(!db[voteName]) {
                db[voteName]={'yea':0,'nay':0,'abs':0,'cnctCount':1,'date':Date.now()};
                io.emit('update',db[voteName]);
           
            } else {
                db[voteName].cnctCount++;
                io.emit('update',db[voteName]);
            }
        }); 

        socket.on('yea', (voteName)=>{
            db[voteName].yea++;
            io.emit('update',db[voteName]);
        });
        
        socket.on('nay', (voteName)=>{
            db[voteName].nay++;
            io.emit('update',db[voteName]);   
        });
        
        socket.on('abs', (voteName)=>{
            db[voteName].abs++;
            io.emit('update',db[voteName]);   
        });

        socket.on('save', (voteName)=>{
            save(db,voteName);
            saveArray(db,voteName);
            io.emit('endVote',db[voteName]);
        });


        socket.on('disconnect', ()=>{
            db[voteName].cnctCount--;
            db[voteName].cnctCount===0 ? save(db,voteName) : console.log( db[voteName].cnctCount );
        });
    });
});

function save(entireDB,name){
    let db = require( "./db.json");
    db[name] = entireDB[name];
    db = JSON.stringify(db);   
   fs.writeFileSync('./db.json', db);

}

function saveArray (entireDB,name) {
   entireDB[name].voteName = name;
   let dbArray = require('./dbArray.json');
   dbArray.push(entireDB[name]);
   x = JSON.stringify(dbArray);   
   fs.writeFileSync('./dbArray.json', x);
}

// app.get('*', function(req, res){
//     console.log(db[voteName]);
    
//     // res.send(`
//     // <style>
//     // body{
//     //     text-align:center;
//     // }
//     // h1,p,a {
//     //     font-size:36px;
//     // }
//     // </style>
//     // <h1>404</h1>
//     //  This vote may have already ended.<br> <a href="/">
//     //  <<< BACK</a>`, 404);
// });
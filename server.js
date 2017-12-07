/* jshint esversion:6 */
"use strict";
var http = require('http').Server(app);

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");

const voted = new Set;
var nsp = io.of('/');

console.log(" server running on 80");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

server.listen(3000,'showofhands.club');
//server.listen(80,'localhost'); //local


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

        socket.on('saveVote', (voteName)=>{
            save(db,voteName);
            saveArray(db,voteName);
            io.emit('endVote',db[voteName]);
        });

        socket.on('cancelVote', (voteName)=>{
            console.log(db);
            delete db[voteName];
            console.log(db);
            
            io.emit('cancelVote');
        });


        socket.on('disconnect', ()=>{
            // db[voteName].cnctCount--;
            // db[voteName].cnctCount===0 ? save(db,voteName) : console.log( db[voteName].cnctCount );
        });
    });
});

function save(db, voteName){
    let bigDB = require('./db.json');
    bigDB[voteName] = db[voteName];
    bigDB = JSON.stringify(bigDB);   
    fs.writeFileSync('./db.json', bigDB);
}

function saveArray (entireDB,name) {
   entireDB[name].voteName = name;
   let dbArray = require('./dbArray.json');
   dbArray.push(entireDB[name]);
   let x = JSON.stringify(dbArray);   
   fs.writeFileSync('./dbArray.json', x);
}
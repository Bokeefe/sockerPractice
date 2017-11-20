/* jshint esversion:6 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");
let db = [];
const voted = new Set;
 
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
    if(votes.indexOf(voteName) !== -1 ){
        res.send("That name has already been used recently");
    } else {
        votes.push(voteName);
        res.send(voteName);
    }
});

app.post('/getVotes',(req,res)=>{
    const oldVotes = require('./db.json');
    let allVotes = {"currentVotes": votes, "oldVotes":oldVotes};
    res.send(allVotes);
});



app.post('/votePick', (req, res) => { 
    let voteName = req.body.votePick;
    res.send(voteName);

    app.get('/'+voteName,(req,res)=>{
        res.sendFile(__dirname + '/canvas.html');
    });
    
    var nsp = io.of('/');


    io.sockets.on('connection', (socket) => {

        if(voted.has(socket)) return;
        
        voted.add(socket);




        socket.on('room', (voteName) => {

            //TODO check if room exists
            socket.join(voteName);

            if(!db[voteName]) {
                db[voteName]={'yea':0,'nay':0,'abs':0,'cnctCount':1};
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
    console.log('made it');
   entireDB[name].voteName = name;
   let dbArray = require('./dbArray.json');
   console.log(dbArray);
   dbArray.push(entireDB[name]);
   console.log(dbArray);
   x = JSON.stringify(dbArray);   
   fs.writeFileSync('./dbArray.json', x);
}
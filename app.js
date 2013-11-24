var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  // , mongo = require('mongodb').MongoClient
  , format = require('util').format
  , io = require('socket.io').listen(server);


// mongo.connect('mongodb://127.0.0.1:27017/angel-hub', function(err, db) {
//     if(err) throw err;

//     var collection = db.collection('jobs');

//     collection.insert({a:2}, function(err, docs) {

//       collection.count(function(err, count) {
//         console.log(format("count = %s", count));
//       });

//       // Locate all the entries using find
//       collection.find().toArray(function(err, results) {
//         console.dir(results);
//         // Let's close the db
//         db.close();
//       });
//     });
//   });


app.use(express.static(__dirname + '/static'));

server.listen(3000);

var jobs = [
    {
        "Title" : "Title 1",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
    {
        "Title" : "Title 2",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
    {
        "Title" : "Title 3",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
    {
        "Title" : "Title 4",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
    {
        "Title" : "Title 5",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
    {
        "Title" : "Title 6",
        "Start" : "StartTime",
        "End" : "EndTime",
        "Location" : "Somewhere"
    },
];

io.sockets.on('connection', function (socket) {

  socket.emit('dataUpdate', { jobList: jobs });

  socket.on('myOtherEvent', function(data) {
    console.log(data);
  });
});
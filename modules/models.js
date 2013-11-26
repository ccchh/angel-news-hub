var MongoDB     = require('mongodb').Db;
var Server      = require('mongodb').Server;
var dbPort      = 27017;
var dbHost      = '127.0.0.1';
var dbName      = 'angel-hub';

/* establish the database connection */
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
    if (e) {
        console.log(e);
    }   else{
        console.log('connected to database :: ' + dbName);
    }
});
var jobs = db.collection('jobs');

this.getJobs = function(cb) {
    cb(jobs.find().toArray(function(toArrayError, results) {
        if (toArrayError) throw toArrayError;
        cb(results);
    }));
}

function getJobById(jobId) {

}

function removeJob(jobId) {}

function addJob(job) {}

function updateJob(job) {}

mongo.connect('mongodb://127.0.0.1:27017/angel-hub', function(err, db) {
    if(err) throw err;

    var collection = db.collection('jobs');

    collection.insert({a:2}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
  });
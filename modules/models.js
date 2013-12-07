var config = require('../config').db;
var db = require('mongodb').MongoClient;
var _ = require('underscore');

dbConnectionString = "mongodb://" + config.server + ":" + config.port + "/" + config.dbName;



exports.getJobs = function(cb) {
  cb(null);
};

exports.getSchedule = function(cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

    var collection = db.collection('schedule');
    collection.find().sort({
      start: 1
    }).toArray(function(err, results) {
      cb(results);
      db.close();
    });
  });
};

exports.updateSchedule = function(data, cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

    var collection = db.collection('schedule');
    var count = data.length;

    _.each(data, function(item) {
      collection.update({
          id: item.id
        }, {
          $set: {
            id: item.id,
            title: item.title,
            location: item.location,
            start: item.start,
            end: item.end
          }
        }, {
          safe: true,
          upsert: true
        },
        function(err) {
          if (err) {
            console.log(err);
            console.log("Error Updating Schedule :(");
          }
          count--;
          if (count === 0) {
            console.log("Schedule update successfull");
            //Return Updated Data to Callback
            exports.getSchedule(cb);
          }
        }
      );
    });
  });
};

exports.getNews = function(cb) {
  cb([{
    title: "Testtitel",
    text: "foobar",
    date: new Date(),
  }, {
    title: "Testtitel",
    text: "foobar",
    date: new Date(),
  }]);
};

exports.getNumbers = function(cb) {
  cb({
    "angelsNeeded": 0,
    "nightAngelsNeeded": 12,
    "hoursWorked": 2343,
    "currentlyWorking": 32
  });
};
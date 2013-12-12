var config = require('../config').db;
var db = require('mongodb').MongoClient;
var _ = require('underscore');
var moment = require('moment');

dbConnectionString = "mongodb://" + config.server + ":" + config.port + "/" + config.dbName;



exports.getShifts = function(cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

    var now = moment([2013, 11, 21, 12]).toDate();
    var soon = moment([2013, 11, 21, 12]).add('hours', 1).toDate();
    var soonEnd = moment([2013, 11, 21, 12]).add('hours', 2).toDate();

    var collection = db.collection('shifts');
    collection.find({
      totalAngelsNeeded: {
        $gte: 0 //We only need Shifts that are not full
      },
      start: {
        $gte: now,
        $lt: soon
      }
    }).sort({
      start: 1
    }).toArray(function(err, nowresults) {
      collection.find({
        totalAngelsNeeded: {
          $gte: 0 //We only need Shifts that are not full
        },
        start: {
          $gte: soon,
          $lt: soonEnd
        }
      }).sort({
        start: 1
      }).toArray(function(err, soonresults) {
        var results = {
          nowShifts: nowresults,
          soonShifts: soonresults
        };
        cb(results);
        db.close();
      });
    });
  });
};

exports.updateShifts = function(data, cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

    var collection = db.collection('shifts');
    var count = data.length;

    _.each(data, function(item) {
      collection.update({
          id: item.id
        }, {
          $set: {
            id: item.id,
            title: item.title,
            start: item.start,
            end: item.end,
            location: item.location,
            angelsNeeded: item.angelsNeeded,
            totalAngelsNeeded: item.totalAngelsNeeded
          }
        }, {
          safe: true,
          upsert: true
        },
        function(err) {
          if (err) {
            console.log(err);
            console.log("Error Updating Shifts :(");
          }
          count--;
          if (count === 0) {
            console.log("Shift update successfull");
            //Return Updated Data to Callback
            exports.getSchedule(cb);
          }
        }
      );
    });
  });
};

exports.getSchedule = function(cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

    var now = moment([2013, 11, 27, 17, 30]).toDate();
    var soon = moment([2013, 11, 27, 17, 30]).add('hours', 3).toDate();

    var collection = db.collection('schedule');
    collection.find({
      start: {
        $lte: now
      },
      end: {
        $gte: now
      }
    }).sort({
      start: 1
    }).toArray(function(err, nowresults) {

      collection.find({
        start: {
          $gt: now
        },
        end: {
          $lt: soon
        }
      }).sort({
        start: 1
      }).toArray(function(err, soonresults) {

        var results = {
          nowTalks: nowresults,
          soonTalks: soonresults
        };

        cb(results);
        db.close();
      });
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
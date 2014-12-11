var config = require('../config').db;
var MongoClient = require('mongodb').MongoClient;
var MongoServer = require('mongodb').Server;
var _ = require('underscore');
var moment = require('moment');
var cache = require('node-cache');
var numberCache = new cache({
  stdTTL: 60,
  checkperiod: 120
});

var mongoClient = new MongoClient(new MongoServer(config.server, config.port));

exports.getShifts = function(cb) {
  mongoClient.open(function(err, mongoClient) {
    if (err) throw err;
    var db = mongoClient.db(config.dbName);

    var now = moment().toDate();
    var soon = moment().add('hours', 1).toDate();
    var soonEnd = moment().add('hours', 3).toDate();

    var collection = db.collection('shifts');
    collection.find({
      totalAngelsNeeded: {
        $gt: 0 //We only need Shifts that are not full
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
          $gt: 0 //We only need Shifts that are not full
        },
        start: {
          $gte: soon,
          $lt: soonEnd
        }
      }).sort({
        start: 1
      }).toArray(function(err, soonresults) {
        collection.find({
          totalAngelsNeeded: {
            $gt: 0
          },
          start: {
            $lt: now
          },
          end: {
            $gt: now
          }
        }).toArray(function(err, runningresults) {
          var results = {
            runningShifts: runningresults,
            nowShifts: nowresults,
            soonShifts: soonresults
          };
          mongoClient.close();
          cb(results);
        });
      });
    });
  });
};

exports.updateShifts = function(data, cb) {
  mongoClient.open(function(err, mongoClient) {
    if (err) throw err;
    var db = mongoClient.db(config.dbName);

    var collection = db.collection('shifts');
    var count = data.length;

    _.each(data, function(item) {
      collection.update({
          ShiftId: item.ShiftId
        }, {
          $set: {
            ShiftId: item.ShiftId,
            title: item.title,
            start: item.start,
            end: item.end,
            location: item.location,
            angelsNeeded: item.angelsNeeded,
            totalAngelsNeeded: item.totalAngelsNeeded,
            totalAngelsTaken: item.totalAngelsTaken
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
            collection.find().toArray(function(err, dbdata) {
              _.each(dbdata, function(i) {
                if (!_.any(data, function(j) {
                  return i.ShiftId == j.ShiftId;
                })) {
                  collection.remove({
                    ShiftId: i.ShiftId
                  }, null, function() {});
                }
              });
              console.log("Shift update successfull");
              //Return Updated Data to Callback
              mongoClient.close();
              exports.getShifts(cb);
            });
          }
        }
      );

    });
  });
};

exports.getSchedule = function(cb) {
  mongoClient.open(function(err, mongoClient) {
    if (err) throw err;
    var db = mongoClient.db(config.dbName);

    var now = moment().toDate();
    var soon = moment().add('hours', 3).toDate();

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

        mongoClient.close();
        cb(results);
      });
    });
  });
};

exports.updateSchedule = function(data, cb) {
  mongoClient.open(function(err, mongoClient) {
    if (err) throw err;
    var db = mongoClient.db(config.dbName);

    var collection = db.collection('schedule');
    var count = data.length;

    _.each(data, function(item) {
      collection.update({
          talkId: item.talkId
        }, {
          $set: {
            talkId: item.talkId,
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
            mongoClient.close();
          }
        }
      );
    });
  });
};

exports.getNews = function(cb) {
  cb([]);
};

exports.getNumbers = function(cb) {

  var nightStartHour = 2;
  var nightEndHour = 8;

  var now = moment();
  var soon = moment().add('hours', 3);
  var nightStart, nightEnd;

  if (now.hour() >= nightStartHour && now.hour() < nightEndHour) { //In the Night
    nightStart = moment();
    nightEnd = moment([now.year(), now.month(), now.date(), nightEndHour]);
  } else { //Not in the Night
    if (now.hour() < nightStartHour) { //After midnight
      nightStart = moment([now.year(), now.month(), now.date(), nightStartHour]);
      nightEnd = moment([now.year(), now.month(), now.date(), nightEndHour]);
    } else {
      nightStart = moment([now.year(), now.month(), now.date() + 1, nightStartHour]);
      nightEnd = moment([now.year(), now.month(), now.date() + 1, nightEndHour]);
    }
  }

  mongoClient.open(function(err, mongoClient) {
    if (err) throw err;
    var db = mongoClient.db(config.dbName);

    var collection = db.collection('shifts');

    collection.find({
      start: {
        $gt: now.toDate()
      }
    }).toArray(function(err, futureResults) {
      var hoursWorked = Math.floor(_.reduce(futureResults, function(memo, s) {
        var duration = (s.end - s.start) / 1000 / 60;
        return memo + (s.totalAngelsNeeded * duration);
      }, 0) / 60);

      collection.find({
        start: {
          $lt: now.toDate()
        },
        end: {
          $gte: now.toDate()
        }
      }).toArray(function(err, nowResults) {
        var angelsWorking = _.reduce(nowResults, function(memo, s) {
          return memo + s.totalAngelsTaken;
        }, 0);

        collection.find({
          start: {
            $gte: now.toDate(),
            $lt: soon.toDate()
          }
        }).toArray(function(err, soonResults) {

          var angelsNeeded = _.reduce(soonResults, function(memo, s) {
            console.log(s.totalAngelsNeeded, s.ShiftId);
            return memo + s.totalAngelsNeeded;
          }, 0);

          collection.find({
            start: {
              $gte: nightStart.toDate()
            },
            end: {
              $lte: nightEnd.toDate()
            }
          }).toArray(function(err, nightResults) {
            var nightAngelsNeeded = _.reduce(nightResults, function(memo, s) {
              return memo + s.totalAngelsNeeded;
            }, 0);

            mongoClient.close();
            cb({
              "angelsNeeded": angelsNeeded,
              "hoursWorked": hoursWorked,
              "currentlyWorking": angelsWorking,
              "nightAngelsNeeded": nightAngelsNeeded
            });
          });
        });
      });
    });
  });
};

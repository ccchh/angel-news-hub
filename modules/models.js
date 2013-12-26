var config = require('../config').db;
var db = require('mongodb').MongoClient;
var _ = require('underscore');
var moment = require('moment');
var cache = require('node-cache');
var numberCache = new cache({
  stdTTL: 60,
  checkperiod: 120
});

dbConnectionString = "mongodb://" + config.server + ":" + config.port + "/" + config.dbName;



exports.getShifts = function(cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

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
          cb(results);
          db.close();
        });
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
              db.close();
              exports.getShifts(cb);
            });
          }
        }
      );

    });
  });
};

exports.getSchedule = function(cb) {
  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

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

  var nightStartHour = 22;
  var nightEndHour = 6;

  var now = moment();
  var soon = moment().add('hours', 3);
  var nightStart, nightEnd;

  if (now.hour() >= nightStartHour || now.hour() < nightEndHour) { //Nighttime
    if (now.hour() < nightEndHour) { //After Midnight
      nightStart = moment();
      nightEnd = moment([now.year(), now.month(), now.date(), nightEndHour]);
    } else { //Before Midnight
      nightStart = moment();
      nightEnd = moment([now.year(), now.month(), now.date() + 1, nightEndHour]);
    }
  } else { //Daytime
    nightStart = moment([now.year(), now.month(), now.date(), nightStartHour]);
    nightEnd = moment([now.year(), now.month(), now.date() + 1, nightEndHour]);
  }

  db.connect(dbConnectionString, function(err, db) {
    if (err) throw err;

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
            return memo + s.totalAngelsNeeded;
          }, 0);

          collection.find({
            start: {
              $gte: nightStart.toDate()
            },
            end: {
              $lt: nightEnd.toDate()
            }
          }).toArray(function(err, nightResults) {
            var nightAngelsNeeded = _.reduce(nightResults, function(memo, s) {
              console.log(s);
              return memo + s.totalAngelsNeeded;
            }, 0);

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

// collection.find({
//   totalAngelsNeeded: {
//     $gte: 0 //We only need Shifts that are not full
//   },
//   start: {
//     $gte: now,
//     $lt: soon
//   }
// }).sort({
//   start: 1
// }).toArray(function(err, nowresults) {
//   collection.find({
//     totalAngelsNeeded: {
//       $gte: 0 //We only need Shifts that are not full
//     },
//     start: {
//       $gte: soon,
//       $lt: soonEnd
//     }
//   }).sort({
//     start: 1
//   }).toArray(function(err, soonresults) {
//     var results = {
//       nowShifts: nowresults,
//       soonShifts: soonresults
//     };
//     cb(results);
//     db.close();
//   });
// });
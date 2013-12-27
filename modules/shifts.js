//Responsible for getting Data from the Angel-System
var https = require("https");
var cronJob = require('cron').CronJob;
var config = require('../config.js');
var _ = require('underscore');
var moment = require('moment');

var models, sockets;

module.exports = function(module_models, module_sockets) {

  models = module_models;
  sockets = module_sockets;

  console.log("Running Shift Cronjob");
  download(config.angelSystem.hostname, config.angelSystem.path + config.angelSystem.key,
    function(data) {
      if (data !== null) {
        cronCallback(JSON.parse(data));
      } else {
        console.log("Shift Cronjob failed. There is a problem with your internet connection.");
      }
    }
  );

  return new cronJob(config.angelSystem.cronString, function() {
    console.log("Running Shift Cronjob");
    download(config.angelSystem.hostname, config.angelSystem.path + config.angelSystem.key,
      function(data) {
        if (data !== null) {
          cronCallback(JSON.parse(data));
        } else {
          console.log("Shift Cronjob failed. There is a problem with your internet connection.");
        }
      }
    );
  }, null, false); //Don't start the job right now.
};

function cronCallback(shifts) {
  var shiftArray = [];

  _.each(shifts, function(s) {
    var angelsNeeded = _.map(s.angeltypes, function(i) {
      if (_.contains(config.angelSystem.ignoreAngelTypes, parseInt(i.angel_type_id))) {
        return {
          angeltype: config.angelSystem.angelIdMapping[i.angel_type_id],
          count: 0,
          taken: 0
        };
      } else {
        return {
          angeltype: config.angelSystem.angelIdMapping[i.angel_type_id],
          count: i.count - i.taken,
          taken: i.taken
        };
      }
    });

    shift = {
      ShiftId: s.SID,
      title: s.name,
      start: new Date(s.start * 1000),
      end: new Date(s.end * 1000),
      location: s.room_name,
      angelsNeeded: angelsNeeded,
      totalAngelsNeeded: _.reduce(angelsNeeded, function(memo, num) {
        return memo + num.count;
      }, 0),
      totalAngelsTaken: _.reduce(angelsNeeded, function(memo, num) {
        return memo + num.taken;
      }, 0)
    };


    shiftArray.push(shift);
  });

  models.updateShifts(shiftArray, function() {
    sockets.broadcastShiftUpdate();
  });
}

// Utility function that downloads a URL and invokes
// callback with the data.
function download(hostname, path, callback) {
  var options = {
    "rejectUnauthorized": false,
    "hostname": hostname,
    "path": path,
    "port": 443,
    "method": "GET"
  };

  https.get(options, function(res) {
    var data = "";
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function(err) {
    callback(null);
  });
}
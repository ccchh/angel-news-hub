//Responsible for getting Data from the Angel-System
var https = require("https");
var cronJob = require('cron').CronJob;
var hostname = "engelsystem.de";
var path = "/30c3/?p=shifts_json_export&export=user_shifts&key=c2e07c1b447efb82b53145a33e65f540";
var _ = require('underscore');



module.exports = function(io) {
  return new cronJob('*/5 * * * * *', function() {
    download(hostname, path, function(data) {
      var json = JSON.parse(data);
      io.sockets.emit("dataUpdate", {
        "numbers": {
          "angelsNeeded": 0,
          "nightAngelsNeeded": 12,
          "hoursWorked": 2343,
          "currentlyWorking": 32
        },
        "shifts": generateShiftData(json),
        "news": [],
        "talks": [],
        "messages": []
      });
    });
  }, null, true);
};


function generateShiftData(json) {
  var shiftData = {
    "nowShifts": [],
    "soonShifts": []
  };
  console.log(json);
  _.forEach(json, function(item) {
    var now = new Date();
    var start = new Date(item.start * 1000);
    var diff = start - now;
    //WORKAROUND CHANGE LATER
    if (true || (diff < (1000 * 60 * 60 * 2) && diff > 0)) {

      angelsNeeded = _.map(item.angeltypes, function(i) {
        return {
          "angeltype": "audio",
          "count": i.count - i.taken
        };
      });

      shift = {
        "title": item.name,
        "start": start,
        "end": new Date(item.end * 1000),
        "location": item.room_name,
        "angelsNeeded": angelsNeeded,
        "totalAngelsNeeded": _.reduce(angelsNeeded, function(memo, num) {
          return memo + num.count;
        }, 0)

      };
      if (shift.totalAngelsNeeded > 0) {
        if (diff < (1000 * 60 * 60)) {
          shiftData.nowShifts.push(shift);
        } else {
          shiftData.soonShifts.push(shift);
        }
      }
    }
  });
  console.log(shiftData);

  return shiftData;
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
    console.log(res);
    res.on('data', function(chunk) {
      console.log("Chunk: ", chunk);
      data += chunk;
    });
    res.on("end", function() {
      console.log("Data: ", data);
      callback(data);
    });
  }).on("error", function(err) {
    callback(null);
  });
}
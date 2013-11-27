//Responsible for getting Data from the Angel-System
var http = require("http");
var cronJob = require('cron').CronJob;
var url = "http://localhost:3000/static/data.json";
var _ = require('underscore');

module.exports = function(io) {
  return new cronJob('*/5 * * * * *', function() {
    download(url, function(data) {
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
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}
var http = require("http");
var cronJob = require('cron').CronJob;
var config = require('../config.js');
var _ = require('underscore');
var moment = require('moment');

var models, sockets;

module.exports = function(module_models, module_sockets) {

  models = module_models;
  sockets = module_sockets;

  return new cronJob(config.schedule.cronString, function() {
    console.log("Running Schedule Cronjob");
    download(config.schedule.url, function(data) {
      if (data !== null) {
        try {
          var json = JSON.parse(data);
          cronCallback(json);
        } catch(e) {
          console.log("Schedule Cronjob failed. Could not Parse JSON", data);
        }
      } else {
        console.log("Schedule Cronjob failed. There is a problem with your internet connection.");
      }
    });
  }, null, false); //Don't start the job right now.
};

function cronCallback(data) {

  var talkArray = [];

  _.each(data.schedule.conference.days, function(day) {
    _.each(day.rooms, function(room) {
      _.each(room, function(talk) {
        //Some dark Calculation Magic for the Talk End DateTime
        var startSplit = talk.start.split(":");
        var durationSplit = talk.duration.split(":");
        var dateSplit = day.date.split("-");

        var start = moment({
          year: parseInt(dateSplit[0]),
          month: parseInt(dateSplit[1]) - 1, //Month are 0-indexed :(
          day: parseInt(dateSplit[2]),
          hour: parseInt(startSplit[0]),
          minute: parseInt(startSplit[1])
        });

        if (startSplit[0] <= 3) {
          start.add('days', 1);
        }

        end = moment(start).add({
          'hours': durationSplit[0],
          'minutes': durationSplit[1]
        });

        //The Actual Object to Store in Database.
        var talkObject = {
          talkId: talk.id,
          title: talk.title,
          location: talk.room,
          start: start.toDate(),
          end: end.toDate(),
        };

        talkArray.push(talkObject);
      });
    });
  });

  models.updateSchedule(talkArray, function() {
    sockets.broadcastScheduleUpdate();
  });

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
  }).on("error", function(err) {
    callback(null);
  });
}

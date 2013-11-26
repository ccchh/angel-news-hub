var models = require('./models');

module.exports = function(io) {

io.sockets.on('connection', function (socket) {
  models.getJobs(function(data) {
      socket.emit('dataUpdate', { jobList: data });
  });

  socket.on('myOtherEvent', function(data) {
    console.log(data);
  });
});

};
var models = require('./models');

module.exports = function(io) {

io.sockets.on('connection', function (socket) {
  models.getJobs(function(data) {
      socket.emit('dataUpdate', {
        "shifts": data,
        "angels-needed": 10,
        "night-angels-needed": 12,
        "hours-worked": 2343,
        "currently-working": 32
    });
  });
});

};
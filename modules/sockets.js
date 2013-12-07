var models, io;
var s = {};

module.exports = function(module_io, module_models) {

  models = module_models;
  io = module_io;

  io.sockets.on('connection', function(socket) {
    s.emitJobUpdate(socket);
    s.emitScheduleUpdate(socket);
    s.emitNewsUpdate(socket);
    s.emitNumberUpdate(socket);
  });

  return s;
};

//Update to all Clients
s.broadcastJobUpdate = function() {
  models.getJobs(function(data) {
    io.sockets.emit('jobUpdate', data);
  });
};

s.broadcastScheduleUpdate = function() {
  models.getSchedule(function(data) {
    io.sockets.emit('scheduleUpdate', data);
  });
};

s.broadcastNewsUpdate = function() {
  models.getNews(function(data) {
    io.sockets.emit('newsUpdate', data);
  });
};

s.broadcastNumberUpdate = function() {
  models.getNews(function(data) {
    io.sockets.emit('numberUpdate', data);
  });
};


//Update to Single Client
s.emitJobUpdate = function(socket) {
  models.getJobs(function(data) {
    socket.emit('jobUpdate', data);
  });
};

s.emitScheduleUpdate = function(socket) {
  models.getSchedule(function(data) {
    socket.emit('scheduleUpdate', data);
  });
};

s.emitNewsUpdate = function(socket) {
  models.getNews(function(data) {
    socket.emit('newsUpdate', data);
  });
};

s.emitNumberUpdate = function(socket) {
  models.getNumbers(function(data) {
    socket.emit('numberUpdate', data);
  });
};
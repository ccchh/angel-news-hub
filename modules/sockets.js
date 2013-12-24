var models, io;
var s = {};

module.exports = function(module_io, module_models) {

  models = module_models;
  io = module_io;

  io.sockets.on('connection', function(socket) {
    s.emitShiftUpdate(socket);
    s.emitScheduleUpdate(socket);
    s.emitNewsUpdate(socket);
    s.emitNumberUpdate(socket);

    socket.on('requestData', function(data) {
      s.emitShiftUpdate(socket);
      s.emitScheduleUpdate(socket);
      s.emitNewsUpdate(socket);
      s.emitNumberUpdate(socket);
    });
  });

  return s;
};

//Update to all Clients
s.broadcastShiftUpdate = function() {
  models.getShifts(function(data) {
    io.sockets.emit('shiftUpdate', data);
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
s.emitShiftUpdate = function(socket) {
  models.getShifts(function(data) {
    socket.emit('shiftUpdate', data);
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
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  // , mongo = require('mongodb').MongoClient
  , format = require('util').format
  , io = require('socket.io').listen(server)

app.use("/static", express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

server.listen(3000);

require('./modules/routes')(app);
require('./modules/sockets')(io);
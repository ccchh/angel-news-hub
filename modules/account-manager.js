var bcrypt = require('bcrypt');
var users = require('../config.js').users;
var _ = require('underscore');


exports.manualLogin = function(user, pass, callback) {
  var u = _.find(users, function(i) {
    return i.username == user;
  });

  if (u) {
    bcrypt.compare(pass, u.hash, function(err, res) {
      if (res) {
        callback(u);
      } else {
        callback(null);
      }
    });
  } else {
    callback(null);
  }
};

exports.autoLogin = function(user, pass, callback) {
  var u = _.find(users, function(i) {
    return i.username == user;
  });

  if (u) {
    if (u.hash == pass) {
      callback(u);
    } else {
      callback(null);
    }
  } else {
    callback(null);
  }
};
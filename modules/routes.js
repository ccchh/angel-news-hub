var am = require('./account-manager');

module.exports = function(app) {

  app.get('/admin', function(req, res) {
    if (req.cookies.user === undefined || req.cookies.pass === undefined) {
      res.redirect("login");
    } else {
      am.autoLogin(req.cookies.user, req.cookies.pass, function(u) {
        if (u !== null) {
          req.session.user = u;
          res.render("backend_jobs");
        } else {
          res.redirect("login");
        }
      });
    }
  });

  app.get('/login', function(req, res) {
    if (req.cookies.user === undefined || req.cookies.pass === undefined) {
      res.render("login");
    } else {
      am.autoLogin(req.cookies.user, req.cookies.pass, function(u) {
        if (u !== null) {
          console.log("User Autologin: ", u.username);
          req.session.user = u;
          res.redirect("/");
        } else {
          res.render("login");
        }
      });
    }
  });

  app.post('/login', function(req, res) {
    console.log("Login Attempt: ", req.param('user'), req.param('pass'));
    console.log(req.param);
    am.manualLogin(req.param('user'), req.param('pass'), function(u) {
      if (u) {
        console.log("User Logged in: ", u.username);
        req.session.user = u;
        res.cookie('user', u.username, {
          maxAge: 86400000 //24 Hours
        });
        res.cookie('pass', u.hash, {
          maxAge: 86400000 //24 Hours
        });
        res.redirect('/admin');
      } else {
        res.redirect("login");
      }
    });
  });

  app.get('/logout', function(req, res) {
    res.clearCookie('user');
    res.clearCookie('pass');
    res.redirect('/');
  });

  app.get('/', function(req, res) {
    res.render("dashboard");
  });
};
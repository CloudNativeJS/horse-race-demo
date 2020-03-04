'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  const router = server.loopback.Router();

  router.get('/', (req, res) => {
    if (!req.user) {
      res.render('login.ejs');
    } else {
      if (req.user.username.charAt(0) != '@') req.user.username = '@' + req.user.username;
      res.render('index.ejs', {user: req.user});
    }
  });

  router.get('/admin/:password', (req, res) => {
    if (req.params.password == process.env.ADMIN_PASSWORD) {
      res.render('admin.ejs');
    }
    else {
      res.send(401, "NOT AUTHENTICATED ")
    }
  });

  router.get('/race', (req, res) => {
    res.render('race.ejs');
  });

  router.get('/privacy', (req, res) => {
    res.render('privacy.ejs');
  });

  router.get('/terms', (req, res) => {
    res.render('privacy.ejs');
  });

  router.get('/leaderboard', (req, res) => {
    res.render('leaderboard.ejs');
  });

  router.post('/join', (req, res) => {
    if (server.gameConfig.STATE == 'PRE-GAME') {
      server.io.emit('joined-queue', req.body);
    }
    res.json(server.gameConfig);
  });

  router.post('/clicks', (req, res) => {
    const socketId = req.body.socket_id;
    if (server.gameConfig.STATE == 'IN-PROGRESS' && server.gameConfig.users[socketId].taps < server.gameConfig.MAX_TAPS) {
      server.gameConfig.users[socketId].distance += server.gameConfig.INCREMENT;
      if (server.gameConfig.users[socketId].distance >= 100) {
        server.gameConfig.users[socketId].place = server.gameConfig.place;
        server.gameConfig.users[socketId].time = getRaceTime();
        server.io.emit('player-finished', server.gameConfig.users[socketId]);
        if (server.gameConfig.place == Object.keys(server.gameConfig.users).length) {
          server.io.emit('game-finished', server.gameConfig.users);
        } else {
          server.gameConfig.place++;
        }
      }
      server.io.emit('update-distances', server.gameConfig.users);
      if (server.gameConfig.users[socketId].distance >= 50) {
        if (!server.gameConfig.hasReached50) {
          server.io.emit('reached-half-way', server.gameConfig.users[socketId]);
          server.gameConfig.hasReached50 = true;
        }
      }
      if (server.gameConfig.users[socketId].distance >= 75) {
        if (!server.gameConfig.hasReached75) {
          server.io.emit('reached-three-quaters', server.gameConfig.users[socketId]);
          server.gameConfig.hasReached75 = true;
        }
      }
      server.gameConfig.users[socketId].taps++;
    }
    res.end();
  });

  server.use(router);

  function getRaceTime() {
    let currentDate = new Date();
    let milliDifference = currentDate.getTime() - server.gameConfig.startDate.getTime();
    return milliDifference;
  }
};

// // route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {
//
//     // if user is authenticated in the session, carry on
//     if (req.isAuthenticated())
//         return next();
//
//     // if they aren't redirect them to the home page
//     res.redirect('/');
// }

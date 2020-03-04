'use strict';

module.exports = (app, io) => {
  app.get('/', (req, res) => {
    if (!req.user) {
      res.render('login.ejs');
    } else {
      if (req.user.username.charAt(0) !== '@') { req.user.username = '@' + req.user.username; }
      res.render('index.ejs', {user: req.user});
    }
  });

  app.get('/admin/:password', (req, res) => {
    if (req.params.password === process.env.ADMIN_PASSWORD) {
      res.render('admin.ejs');
    }    else {
      res.send(401, 'NOT AUTHENTICATED ');
    }
  });

  app.get('/race', (req, res) => {
    res.render('race.ejs');
  });

  app.get('/privacy', (req, res) => {
    res.render('privacy.ejs');
  });

  app.get('/terms', (req, res) => {
    res.render('privacy.ejs');
  });

  app.get('/leaderboard', (req, res) => {
    res.render('leaderboard.ejs');
  });

  app.post('/api', async(req,res) => {
    const Cloudant = require('../cloudant');
    const updateDB = Cloudant.updateBoard;
    let localBoard = req.body;
    res.json(await updateDB(localBoard));

  })

  app.get('/api', async(req,res) => {
    const Cloudant = require('../cloudant');
    const fetchDB = Cloudant.fetchData;
    const doc = await fetchDB();
    res.json(doc.board);
  })

  app.post('/join', (req, res) => {
    if (app.gameConfig.STATE === 'PRE-GAME') {
      io.emit('joined-queue', req.body);
    }
    res.json(app.gameConfig);
  });

  app.post('/clicks', (req, res) => {
    const socketId = req.body.socket_id;
    if (app.gameConfig.STATE === 'IN-PROGRESS' && app.gameConfig.users[socketId].taps < app.gameConfig.MAX_TAPS) {
      app.gameConfig.users[socketId].distance += app.gameConfig.INCREMENT;
      if (app.gameConfig.users[socketId].distance >= 100) {
        app.gameConfig.users[socketId].place = app.gameConfig.place;
        app.gameConfig.users[socketId].time = getRaceTime();
        io.emit('player-finished', app.gameConfig.users[socketId]);
        if (app.gameConfig.place === Object.keys(app.gameConfig.users).length) {
          io.emit('game-finished', app.gameConfig.users);
        } else {
          app.gameConfig.place++;
        }
      }
      io.emit('update-distances', app.gameConfig.users);
      if (app.gameConfig.users[socketId].distance >= 50) {
        if (!app.gameConfig.hasReached50) {
          io.emit('reached-half-way', app.gameConfig.users[socketId]);
          app.gameConfig.hasReached50 = true;
        }
      }
      if (app.gameConfig.users[socketId].distance >= 75) {
        if (!app.gameConfig.hasReached75) {
          io.emit('reached-three-quaters', app.gameConfig.users[socketId]);
          app.gameConfig.hasReached75 = true;
        }
      }
      app.gameConfig.users[socketId].taps++;
    }
    res.end();
  });

  const getRaceTime = () => {
    let currentDate = new Date();
    let milliDifference = currentDate.getTime() - app.gameConfig.startDate.getTime();
    return milliDifference;
  };
};

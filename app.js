'use strict';
module.exports = (options) => {
  const passport = require('passport');
  const Strategy = require('passport-twitter').Strategy;
  const Cloudant = require('@cloudant/cloudant');
  const session = require('express-session');
  const path = require('path');
  const twitterAccount = 'CloudNativeJS';
  const TwitterClient = require('easy-twitter');
  const cloudant = require('./cloudant')
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const io = require('socket.io')(options.server);
  io.emit('started');

  const sess = {
    secret: 'replace with a secret',
    cookie: {},
    resave: true,
    saveUninitialized: true,
  };

  const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
  const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;

  app.gameConfig = {
    'MAX_TAPS': 100,
    'INCREMENT': 1,
    'place': 1,
    'lane': 1,
    'users': {},
    'STATE': 'PRE-GAME',
    'hasReached50': false,
    'hasReached75': false,
    'startDate': null,
  };

  cloudant.setupDoc();

  passport.use(new Strategy({
    consumerKey: twitterConsumerKey,
    consumerSecret: twitterConsumerSecret,
    callbackURL: process.env.URL + '/login/twitter/return',
  },
  (token, tokenSecret, profile, cb) => {
    const twitter = new TwitterClient({
      consumer_key: twitterConsumerKey,
      consumer_secret: twitterConsumerSecret,
      access_token_key: token,
      access_token_secret: tokenSecret,
    });
    twitter.follow(twitterAccount)
    .then(data => {
      console.log('You\'re now following :' + data.user);
    })
    .catch(err => {
      console.error(err.error);
    });
    return cb(null, profile);
  }));

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser((obj, cb) => {
    cb(null, obj);
  });

  app.use('/', express.static(path.join(__dirname, 'views')));
  app.use('/', express.static('socket.io'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(session(sess));
  app.use(passport.initialize());
  app.use(passport.session());
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');

  app.get('/login/twitter',
    passport.authenticate('twitter'));

  app.get('/login/twitter/return',
    passport.authenticate('twitter', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      res.redirect('/');
    });

  io.on('connection', (socket) => {
    console.log(`${socket.id} connected!`);
    socket.on('admin-change-state', (data) => {
      console.log('Admin changed state to: ', data);
      if (data === 'IN-PROGRESS') {
        setTimeout(() => {
          app.gameConfig.startDate = new Date();
          io.emit('game-start');
        }, 1000); // Delay game start
      }
      app.gameConfig.STATE = data;
    });
    socket.on('admin-finish-race', () => {
      console.log('Admin finish');
      socket.broadcast.emit('game-finished', app.gameConfig.users);
    });
    socket.on('admin-reset-race', () => {
      console.log('Admin reset game');
      resetGame();
      io.emit('refresh');
    });
    socket.on('get-state', () => {
      socket.emit('state', app.gameConfig.STATE);
    });
    socket.on('join-status', (data) => {
      console.log('join-status');
      if (data.status === 'passed') {
        app.gameConfig.users[data.socket_id] = {};
        app.gameConfig.users[data.socket_id].name = data.username;
        app.gameConfig.users[data.socket_id].lane = app.gameConfig.lane;
        app.gameConfig.users[data.socket_id].taps = 0;
        app.gameConfig.lane++;
        app.gameConfig.users[data.socket_id].distance = 0;
        data.lane = app.gameConfig.users[data.socket_id].lane;
      }
      socket.broadcast.emit('joined-status', data);
    });
    socket.on('disconnect', () => {
      socket.broadcast.emit('player-disconnect',
                            app.gameConfig.users[socket.id]);
      delete app.gameConfig.users[socket.id];
      console.log(`${socket.id} disconnected!`);
    });
  });

  require('./routes/')(app, io);

  const resetGame = () => {
    app.gameConfig.place = 1;
    app.gameConfig.STATE = 'PRE-GAME';
    app.gameConfig.lane = 1;
    app.gameConfig.users = {};
  };

  return app;
};

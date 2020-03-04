'use strict';
require('appmetrics-dash').monitor();

const loopback = require('loopback');
const boot = require('loopback-boot');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;
const session = require('express-session')
const path = require('path');
const twitterAccount = 'CloudNativeJS';
const TwitterClient = require('easy-twitter');

const app = module.exports = loopback();

const sess = {
  secret: 'replace with a secret',
  cookie: {}
}

const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY
const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET

app.gameConfig = {
  "MAX_TAPS": 100,
  "INCREMENT": 1,
  "place": 1,
  "lane": 1,
  "users": {},
  "STATE": "PRE-GAME",
  "hasReached50": false,
  "hasReached75": false,
  "startDate": null
}

passport.use(new Strategy({
    consumerKey: twitterConsumerKey,
    consumerSecret: twitterConsumerSecret,
    // callbackURL: 'http://127.0.0.1:8080/login/twitter/return'
    callbackURL: 'https://horserace.eu-gb.mybluemix.net/login/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    const twitter = new TwitterClient({
      consumer_key: twitterConsumerKey,
      consumer_secret: twitterConsumerSecret,
      access_token_key: token,
      access_token_secret: tokenSecret
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

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use('/', loopback.static('public'))
app.use('/', loopback.static('socket.io'))
app.use(session(sess))
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client'));

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/login/twitter/return',
  passport.authenticate('twitter', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

boot(app, __dirname);

// start the server if `$ node server.js`
if (require.main === module) {
  app.io = require('socket.io')(app.start());
  let io = app.io;
  io.on('connection', function(socket) {
    console.log(`${socket.id} connected!`);
    socket.on('admin-change-state', (data) => {
      if (data == 'IN-PROGRESS') {
        setTimeout(() => {
          app.gameConfig.startDate = new Date();
          io.emit('game-start');
        }, 1000); // Delay game start
      }
      app.gameConfig.STATE = data;
    });
    socket.on('admin-finish-race', () => {
      socket.broadcast.emit('game-finished', app.gameConfig.users);
    });
    socket.on('admin-reset-race', () => {
      resetGame();
      io.emit('refresh');
    });
    socket.on('get-state', () => {
      socket.emit('state', app.gameConfig.STATE);
    });
    socket.on('join-status', (data) => {
      if (data.status == "passed") {
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
    socket.on('disconnect', function() {
      socket.broadcast.emit('player-disconnect', app.gameConfig.users[socket.id]);
      delete app.gameConfig.users[socket.id];
      console.log(`${socket.id} disconnected!`);
    });
  });
}

function resetGame() {
  app.gameConfig.place = 1;
  app.gameConfig.STATE = 'PRE-GAME';
  app.gameConfig.lane = 1;
  app.gameConfig.users = {};
}

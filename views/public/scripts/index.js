'use strict';

// const url = 'https://horse-race.eu-gb.mybluemix.net';
//const url = 'http://127.0.0.1:3000';
const url = 'http://' + window.location.hostname

const socket = io();

const xhr = new XMLHttpRequest();

let username;

let state;
socket.emit('get-state');

socket.on('state', (data) => {
  state = data;
});

socket.on('player-finished', (user) => {
  if (user.name == username) {
    switchToFinishedScreen(user);
  }
});

socket.on('refresh', () => {
  window.location.reload(false);
});

const errorText = document.getElementById('login-error');
const joinButton = document.getElementById('btn-join');
joinButton.addEventListener('click', () => {
  if (state === 'PRE-GAME') {
    username = user.username;
    console.log('username: ', username);
    if (!username.replace(/\s/g, '').length) {
      errorText.textContent = 'Username cannot be blank!';
      return;
    }

    const data = JSON.stringify({
      'socket_id': socket.io.engine.id,
      'username': username,
    });

    xhr.open('POST', url + '/join');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(data);
    switchToPendingScreen();
  }
});

socket.on('joined-status', (data) => {
  if (data.username === username) {
    if (data.status === 'passed') {
      switchToTapScreen();
    } else if (data.status == 'exists') {
      userExists.textContent = 'User Name is Taken!';
    } else {
      switchToLandingScreen();
    }
  }
});

const tapButton = document.getElementById('btn-tap');
tapButton.addEventListener('click', (e) => {
  const data = JSON.stringify({
    'socket_id': socket.io.engine.id,
  });

  xhr.open('POST', url + '/clicks');
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.send(data);
  e.preventDefault();
});

socket.on('game-start', () => {
  tapButton.disabled = false;
  tapButton.textContent = 'Tap!';
});

const landing = document.getElementById('landing');
const pending = document.getElementById('pending');
const tapping = document.getElementById('tapping');
const finised = document.getElementById('finished');

function switchToLandingScreen() {
  landing.style.display = 'block';
  tapping.style.display = 'none';
  pending.style.display = 'none';
}

function switchToPendingScreen() {
  landing.style.display = 'none';
  tapping.style.display = 'none';
  pending.style.display = 'block';
}

function switchToTapScreen() {
  landing.style.display = 'none';
  pending.style.display = 'none';
  tapping.style.display = 'block';
}

function switchToFinishedScreen(user) {
  document.getElementById('finished-place').textContent = `${formatPlace(user.place)}!`;
  document.getElementById('finished-time').textContent = `${user.time / 1000}s`;
  tapping.style.display = 'none';
  pending.style.display = 'none';
  finished.style.display = 'block';
}

function formatPlace(place) {
  let suffix = 'th';
  if (place == 1) {
    suffix = 'st';
  } else if (place == 2) {
    suffix = 'nd';
  } else if (place == 3) {
    suffix = 'rd';
  }
  return place + suffix;
}

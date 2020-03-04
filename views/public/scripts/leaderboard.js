'use strict';

// const url = 'https://horse-race.eu-gb.mybluemix.net';
//const url = 'http://127.0.0.1:3000';
const url = 'http://' + window.location.hostname

const socket = io();

const data = null;

const leaderTable = document.querySelector('#leader > div');

let placeCount = 1;
const IBMers = new Set(['@mhdawson1', '@BethGriggs_', '@dhigit9', '@tmmoore_1']);

const xhr = new XMLHttpRequest();

xhr.addEventListener('readystatechange', () => {
  if (xhr.readyState === 4) {
    const board = JSON.parse(xhr.responseText);
    Object.keys(board).forEach((user) => {
      const row = document.getElementById('row-template').content.cloneNode(true);
      row.querySelector('.row').id = user;
      const place = row.querySelector('.leader-place');
      if (IBMers.has(user)) {
        place.innerHTML = '<img style="height: 1em" src="../public/images/ibm-logo.svg">';
      } else {
        place.textContent = placeCount;
        placeCount++;
      }
      const username = row.querySelector('.leader-username');
      username.textContent = user;
      const profilePic = row.querySelector('.leader-img');
      profilePic.src = `https://avatars.io/twitter/${user.replace('@', '')}/small`;
      const time = row.querySelector('.leader-time');
      time.textContent = board[user] / 1000 + 's';
      leaderTable.appendChild(row);
    });
  }
});

xhr.open('GET', url + '/api', true);
xhr.send(null);

socket.on('game-finished', () => {
  window.location.reload();
});

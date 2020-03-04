const url = 'https://horserace.eu-gb.mybluemix.net';
// const url = 'http://127.0.0.1:8080';

const socket = io(url);

const data = null;

const leaderTable = document.querySelector('#leader > div');

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

let placeCount = 1;
const IBMers = new Set(['@tomleahs', '@Mhamwala', '@george_adams95',
                        '@mhdawson1', '@BethGriggs_', '@dhigit9', '@tmmoore_1']);
xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
    users = JSON.parse(this.responseText);
    let doneUsers = new Set();
    for (let user in users) {
      // skip loop if the property is from prototype
      if (!users.hasOwnProperty(user)) continue;
      const obj = users[user];
      if (!doneUsers.has(obj.username)) {
        doneUsers.add(obj.username);
        const row = document.getElementById('row-template').content.cloneNode(true);
        row.querySelector('.row').id = obj.username
        const place = row.querySelector('.leader-place');
        if (IBMers.has(obj.username)) {
          place.innerHTML = `<img style="height: 1em" src="./assets/images/ibm-logo.svg">`;
        } else {
          place.textContent = placeCount;
          placeCount ++;
        }
        const username = row.querySelector('.leader-username');
        username.textContent = obj.username;
        const profilePic = row.querySelector('.leader-img');
        profilePic.src = `https://avatars.io/twitter/${obj.username.replace('@', '')}/small`;
        const time = row.querySelector('.leader-time');
        time.textContent = obj.time / 1000 + 's';
  
        leaderTable.appendChild(row);
      }
    }
  }
});

xhr.open("GET", url + '/api/results?filter[order]=time ASC');
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);

socket.on('game-finished', () => {
  window.location.reload();
});

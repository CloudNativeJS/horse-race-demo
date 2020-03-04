const url = 'https://horserace.eu-gb.mybluemix.net';
// const url = 'http://127.0.0.1:8080';

const socket = io(url);
// const socket = io('http://localhost:8080');

const track = document.getElementById('race-track');
const xhr = new XMLHttpRequest();

socket.on('joined-status', (user) => {
  if (user.status == "passed") {
    switchToRaceScreen();
    const lane = document.getElementById('lane-template').content.cloneNode(true);
    lane.querySelector('.row').id = `lane-${user.lane}`;
    lane.querySelector('.lane-name').textContent = user.username;
    track.appendChild(lane);
  }
});

socket.on('player-disconnect', (user) => {
  const lane = document.getElementById(`lane-${user.lane}`);
  lane.style.backgroundColor = 'red';
  const laneName = lane.querySelector('.lane-name');
  laneName.style.color = "darkred";
  laneName.textContent = `${user.name} disconnected!`;
  setTimeout(() => {
    lane.parentElement.removeChild(lane);
  }, 3000); // Time before lane gets deleted
});

socket.on('update-distances', (users) => {
  Object.keys(users).forEach(user => {
    const userData = users[user];
    const lane = document.getElementById(`lane-${userData.lane}`);
    const horse = lane.querySelector('.horse');
    horse.style.paddingLeft = `${userData.distance}%`;
  });
});

socket.on('player-finished', (user) => {
  const leaderboardTable = document.getElementById('leaderboard-table');
  const row = document.getElementById('row-template').content.cloneNode(true);
  const place = row.querySelector('.leaderboard-place');
  place.textContent = formatPlace(user.place);
  const name = row.querySelector('.leaderboard-name');
  name.textContent = user.name;
  const time = row.querySelector('.leaderboard-time');
  time.textContent = user.time + 'ms';
  leaderboardTable.appendChild(row);
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      const xhr_put = new XMLHttpRequest();
      var data = {
        "username": user.name,
        "time": user.time
      }
      xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
          console.log(this.responseText);
        }
      });
      xhr_put.open("PUT", url + "/api/results");
      xhr_put.setRequestHeader("Content-Type", "application/json");
      if (JSON.parse(this.responseText).length == 0) {
        xhr_put.send(JSON.stringify(data));
      } else if (JSON.parse(this.responseText)[0].time > user.time) {
        data.id = JSON.parse(this.responseText)[0].id
        xhr_put.send(JSON.stringify(data));
      } else {
      }
    }
  });
  xhr.open("GET", url + '/api/results/?filter[where][username]=' + user.name);
  xhr.send();
});

socket.on('game-finished', (users) => {
  switchToLeaderboardScreen();
});

socket.on('refresh', () => {
  window.location.reload(false);
});

const home = document.getElementById("home");
const race = document.getElementById("race");
const leaderboard = document.getElementById("leaderboard");

function switchToRaceScreen() {
  home.style.display = 'none';
  race.style.display = 'block';
}

function switchToLeaderboardScreen() {
  race.style.display = 'none';
  leaderboard.style.display = 'block';
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

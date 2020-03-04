const socket = io('https://horserace.eu-gb.mybluemix.net');
// const socket = io('http://127.0.0.1:8080');

document.getElementById('admin-start').addEventListener('click', () => {
    const queueTable = document.getElementById('queue-table');
    queueTable.innerHTML = '';
    socket.emit('admin-change-state', 'IN-PROGRESS');
});

document.getElementById('appmetrics-dash').addEventListener('click', () => {
  const url = window.location.protocol + '//' + window.location.hostname + ':3001/appmetrics-dash';
  window.open(url,'_blank');
});

document.getElementById('admin-reset').addEventListener('click', () => {
    const queueTable = document.getElementById('queue-table');
    queueTable.innerHTML = '';
    socket.emit('admin-reset-race');
});

document.getElementById('admin-finish').addEventListener('click', () => {
    const queueTable = document.getElementById('queue-table');
    queueTable.innerHTML = '';
    socket.emit('admin-finish-race');
});

socket.on('joined-queue', (user) => {
    const queueTable = document.getElementById('queue-table');
    const row = document.getElementById('row-template').content.cloneNode(true);
    row.querySelector('.row').id = user.username
    const username = row.querySelector('.queue-username');
    username.textContent = user.username;
    const acceptBtn = row.querySelector('.accept-user');
    acceptBtn.id = 'passed-' + user.username;
    acceptBtn.addEventListener("click", function() {
        user.status = "passed";
        socket.emit('join-status', user);
        const toDelete = document.getElementById(user.username);
        toDelete.parentElement.removeChild(toDelete);
    });

    const declineBtn = row.querySelector('.decline-user');
    declineBtn.id = 'failed-' + user.name;
    declineBtn.addEventListener("click", function() {
        user.status = "failed";
        socket.emit('join-status', user);
        const toDelete = document.getElementById(user.username);
        toDelete.parentElement.removeChild(toDelete);
    });

    queueTable.appendChild(row);
});

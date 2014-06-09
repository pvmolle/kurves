"use strict";

function Game() {
    this.url = window.location.pathname.substr(1);
    this.state = 'lobby-ask-name';
}

function Player(id, color) {
    this.id = id;
    this.color = color;
    this.name = null;
    this.direction = null;
    this.orientation = window.orientation;
    this.ready = false;
}

var visibleMap = {
    'lobby-ask-name': '.client__form',
    'lobby-ask-ready': '.client__button',
    'lobby-ready': '.client__state',
    'playing': '.client__orientation',
    'done': '.client__state'
};

function setVisibleState() {
    if (!game) {
        return;
    }

    var all = document.querySelector('.client').children;

    [].forEach.call(all, function(container) {
        container.style.display = 'none';
    });

    document.querySelector(visibleMap[game.state]).style.display = 'block';
};

// Fields

var game = new Game();
var player;

setVisibleState();

// Socket

var socket = io('/', { secure: true });

// Listeners

var input = document.getElementById('playerName');
var playerState = document.querySelector('.client__state span');

input.addEventListener('change', function() {
    var value = input.value.trim();

    if (!/^[A-Za-z]+$/.test(value) || value.length > 10) {
        input.dataset['invalid'] = true;
        return;
    }

    input.dataset['invalid'] = false;
});

document.getElementById('formPlayer').addEventListener('submit', function(evt) {
    evt.preventDefault();

    var input = document.getElementById('playerName');
    if (input.dataset['invalid'] === 'true') {
        return;
    }

    player.name = input.value.trim();

    input.value = '';
    input.blur();

    socket.emit('name player', {
        gameUrl: game.url,
        playerId: player.id,
        playerName: player.name
    });

    game.state = 'lobby-ask-ready';
    setVisibleState();
});

document.getElementById('readyButton').addEventListener('click', function(evt) {
    evt.preventDefault();

    socket.emit('ready player', {
        gameUrl: game.url,
        playerId: player.id
    });

    playerState.innerHTML = 'awaiting other players...';

    game.state = 'lobby-ready';
    setVisibleState();
});

// Sockets

socket.on('connect', function() {
    socket.emit('new player', {
        gameUrl: game.url
    });
});

socket.on('player confirmed', function(data) {
    player = new Player(data.playerId, data.playerColor);
});

socket.on('start ready', function() {
    game.state = 'lobby-ready';
    playerState.innerHTML = 'ready?';
    setVisibleState();
});

socket.on('start game', function() {
    game.state = 'playing';
    setVisibleState();
});

socket.on('end game', function(data) {
    game.state = 'done';

    if (player.id === data.gameWinnerId) {
        playerState.innerHTML = 'you win!';
    } else {
        playerState.innerHTML = 'you lose!';
    }

    setVisibleState();
});

// Device orientation stuff

var arrow = document.getElementById('deviceorientation');

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(evt) {
        if ('playing' !== game.state) {
            return;
        }

        var angle = Math.floor(evt.beta);
        var direction = null;

        if (player.orientation < 0) {
            angle *= -1;
        }

        if (angle < -20) {
            direction = 'left';
            arrow.style.webkitTransform = 'rotate(-45deg)';
        } else  if (angle > 20) {
            direction = 'right';
            arrow.style.webkitTransform = 'rotate(45deg)';
        } else {
            arrow.style.webkitTransform = 'rotate(0)';
        }

        if (direction === player.direction) {
            return;
        }

        player.direction = direction;

        socket.emit('move player', {
            gameUrl: game.url,
            playerId: player.id,
            playerDirection: player.direction
        });
    });

    window.addEventListener('orientationchange', function(evt) {
        if (!player) {
            return;
        }

        player.orientation = window.orientation;
    });
}
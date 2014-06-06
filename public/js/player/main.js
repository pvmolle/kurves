(function(window, document, io) {

	"use strict";

	function Game() {
		this.url = window.location.pathname.substr(1);
		this.state = 'lobby';
	}

	function Player(id, color) {
		this.id = id;
		this.color = color;
		this.name = null;
		this.direction = null;
		this.orientation = window.orientation;
		this.ready = false;
	}

	// Fields

	var game = new Game();
	var player;

	// Socket

	var socket = io();

	// Listeners

	document.getElementById('formPlayer').addEventListener('submit', function(evt) {
		evt.preventDefault();

		var input = document.getElementById('playerName');

		if (!/^[A-Za-z]+$/.test(input.value)) {
			return;
		}

		player.name = input.value;

		socket.emit('name player', {
			gameUrl: game.url,
			playerId: player.id,
			playerName: player.name
		});
	});

	document.getElementById('readyButton').addEventListener('click', function(evt) {
		evt.preventDefault();

		socket.emit('ready player', {
			gameUrl: game.url,
			playerId: player.id
		});
	});

	// Sockets

	socket.on('connect', function() {
		socket.emit('new player', {
			gameUrl: game.url
		});
	});

	socket.on('player confirmed', function(data) {
		player = new Player(data.playerId, data.playerColor);
		var playerText = document.getElementById('player');
		playerText.style.color = player.color;
		playerText.innerHTML = 'What\'s your name?';
	});

	socket.on('start ready', function() {
		alert('ready?');
	});

	socket.on('start game', function() {
		alert('start!');
	});

	// Device orientation stuff
	
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(evt) {
			if (!game || 'playing' !== game.state) {
				return;
			}

			var angle = Math.floor(evt.beta);
			var direction = null;

			if (orientation < 0) {
				angle *= -1;
			}

			if (angle < -20) {
				direction = 'left';
			}
			
			if (angle > 20) {
				direction = 'right';
			}

			if (direction === player.direction) {
				return;
			}

			player.direction = direction;

			document.getElementById('deviceorientation').innerHTML = player.direction;
			
			socket.emit('move player', {
				gameUrl: game.url,
				playerId: player.id,
				playerDirection: player.direction
			});
		});

		window.addEventListener('orientationchange', function(evt) {
			orientation = window.orientation;
		});
	}

})(window, document, io, null);
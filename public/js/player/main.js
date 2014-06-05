(function(window, document, io) {

	"use strict";

	// Fields

	var inputGame = document.getElementById('textFieldGame');
	var buttonGame = document.getElementById('submitButtonGame');
	var title = document.getElementById('game');
	var subtitle = document.getElementById('player');
	var gameUrl;
	var playerId;
	var gameUrl = (function() {
		return window.location.pathname.substr(1);
	})();
	var direction;
	var orientation;

	// Socket

	var socket = io();

	// Device orientation
	orientation = window.orientation;

	// Listeners
	
	socket.on('connect', function() {
		socket.emit('new player', {
			gameUrl: gameUrl
		});
	});

	socket.on('new player', function(data) {
		gameUrl = data.gameUrl;
		playerId = data.playerId;

		title.innerHTML = 'Game: ' + gameUrl;
		subtitle.innerHTML = 'Player: ' + playerId;
	});

	// Device orientation stuff
	
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(evt) {

			var angle = Math.floor(evt.beta);

			if (orientation < 0) {
				angle *= -1;
			}

			if (angle < -20) {
				direction = 'left';
			} else if (angle > 20) {
				direction = 'right';
			} else {
				direction = null;
			}

			document.getElementById('deviceorientation').innerHTML = direction;
			socket.emit('player move', {
				gameUrl: gameUrl,
				playerId: playerId,
				playerDirection: direction
			});
		});

		window.addEventListener('orientationchange', function(evt) {
			orientation = window.orientation;
		});
	}

})(window, document, io, null);
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

	// Socket

	var socket = io();

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
			document.getElementById('deviceorientation').innerHTML = evt.beta;
			socket.emit('player move', {
				gameUrl: gameUrl,
				playerId: playerId,
				angle: evt.beta
			});
		});
	}

})(window, document, io, null);
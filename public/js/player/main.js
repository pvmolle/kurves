(function(window, document, io) {

	"use strict";

	// Fields

	var inputGame = document.getElementById('textFieldGame');
	var buttonGame = document.getElementById('submitButtonGame');
	var title = document.getElementById('game');
	var subtitle = document.getElementById('player');
	var input = document.getElementById('textField');
	var button = document.getElementById('submitButton');
	var gameId;
	var playerId;

	// Socket

	var socket = io();

	// Listeners

	button.addEventListener('click', function(evt) {
		evt.preventDefault();

		var message;
		if (!(message = input.value.trim())) {
			return;
		}

		if (!gameId || !playerId) {
			return;
		}

		socket.emit('new message', {
			message: message
		});
		input.value = '';
	});

	buttonGame.addEventListener('click', function(evt) {
		evt.preventDefault();

		var game;
		if (!(game = inputGame.value.trim())) {
			return;
		}

		socket.emit('new player', {
			game: game
		});
	})

	socket.on('new player', function(data) {
		gameId = data.game;
		playerId = data.player;

		title.innerHTML = 'Game: ' + gameId;
		subtitle.innerHTML = 'Player: ' + playerId;
	});

	// Device orientation stuff
	
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(evt) {
			document.getElementById('deviceorientation').innerHTML = evt.beta;
		});
	}

})(window, document, io, null);
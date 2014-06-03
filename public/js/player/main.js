(function(window, document, io) {

	"use strict";

	// Fields

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

		if (!game) {
			return;
		}

		socket.emit('new message', { message: message });
		input.value = '';
	});

	socket.on('connect', function() {
		socket.emit('new player');
	});

	socket.on('new player', function(data) {
		gameId = data.game;
		playerId = data.player;

		title.innerHTML = 'Game: ' + gameId;
		subtitle.innerHTML = 'Player: ' + playerId;
	});

})(window, document, io, null);
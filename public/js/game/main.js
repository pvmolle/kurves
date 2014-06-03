(function(window, document, io) {

	"use strict";

	var title = document.getElementById('game');
	var list = document.getElementById('chat');
	var gameId;
	var socket = io();

	socket.on('connect', function() {
		socket.emit('new game');
	})

	socket.on('new game', function(data) {
		gameId = data.game;
		title.innerHTML = 'Game: ' + gameId;
	});

	socket.on('new message', function(data) {
		alert('new message');
		var message = document.createElement('li');
		message.innerHTML = data.message;
		list.appendChild(message);
	});

})(window, document, io, null);
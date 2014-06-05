(function(window, document, io) {

	"use strict";

	// rAF polyfill

	window.requestAnimFrame = (function (){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function(callback){
	          	window.setTimeout(callback, 1000 / 60);
	          };
	})();

	var title = document.getElementById('game');
	var list = document.getElementById('list');
	var gameUrl;
	var players = {};
	var socket = io();

	socket.on('connect', function() {
		socket.emit('new game');
	})

	socket.on('new game', function(data) {
		gameUrl = data.url;
		title.innerHTML = 'Game: ' + gameUrl;
	});

	socket.on('new player', function(data) {
		players[data.player.id] = data.player;
	});

	socket.on('player move', function(data) {
		players[data.playerId].angle = data.angle;
	});

	// Game loop
	
	requestAnimFrame(function loop() {
		requestAnimFrame(loop);
		var text = '';
		var playersList = Object.keys(players);
		playersList.forEach(function(p) {
			text += '<li>' + players[p].id + ': ' + players[p].angle + '</li>';
		});
		list.innerHTML = text;
	});

})(window, document, io, null);
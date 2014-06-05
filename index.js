"use strict";

/**
 * Module dependencies
 */

var express = require('express');

// Path to public directory

var pub = __dirname + '/public';

// Setup middleware

var app = express();
app.use(express.static(pub));

var server = app.listen(3000);

// Websockets

var io = require('socket.io').listen(server);

// Set default template engine to "jade"

app.set('view engine', 'jade');

// Logic

var Game = function(id) {
	this.players = [];
	this.url = (function() {
		return Math.random().toString(36).substr(2, 5);
	})();
};

var Player = function(id) {
	this.id = id;
};

var gameMap = {};
var urlGameMap = {};
var playerGameMap = {};

// Routes

app.get('/', function(req, res) {
	res.render('game');
});

app.get('/:game', function(req, res) {
	if (!urlGameMap[req.params.game]) {
		return res.send(404);
	}

	res.render('player');
});

// Moar websockets

io.on('connection', function(socket) {

	socket.on('new game', function() {
		var game = new Game();

		urlGameMap[game.url] = game;
		socket.join(game.url);
		game.socket = socket;

		socket.emit('new game', {
			url: game.url
		});
	});

	socket.on('new player', function(data) {
		if (Object.keys(urlGameMap).length < 1) {
			return;
		}

		var player = new Player(socket.id);
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.players.push(player);
		socket.join(game.url);

		game.socket.emit('new player', {
			player: player
		});

		playerGameMap[player.id] = game.id;
		
		socket.emit('new player', {
			gameUrl: game.url,
			playerId: player.id
		});
	});

	socket.on('player move', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.socket.emit('player move', {
			playerId: data.playerId,
			angle: data.angle
		});
	});

});
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

// Routes

app.get('/', function(req, res) {
	res.render('game');
});

app.get('/player', function(req, res) {
	res.render('player');
});

// Moar websockets

var Game = function(id) {
	this.id = id;
	this.players = [];
};

var Player = function(id) {
	this.id = id;
};

var gameMap = {};
var playerGameMap = {};


io.on('connection', function(socket) {

	socket.on('new game', function() {
		var game = new Game(socket.id);

		gameMap[game.id] = game;
		socket.join(game.id);

		socket.emit('new game', {
			game: game.id
		});
	});

	socket.on('new player', function(data) {
		if (Object.keys(gameMap).length < 1) {
			return;
		}

		var player = new Player(socket.id);
		var game = gameMap[data.game];
		if (!game) {
			return;
		}

		game.players.push(player);
		socket.join(game.id);

		playerGameMap[player.id] = game.id;
		
		socket.emit('new player', {
			game: game.id,
			player: player.id
		});
	});

	socket.on('new message', function(data) {
		var game;

		if (!(game = playerGameMap[socket.id])) {
			return;
		}

		io.sockets.in(game).emit('new message', {
			message: data.message
		});
	});

});
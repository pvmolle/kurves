"use strict";

/**
 * Module dependencies
 */

var express = require('express');

// Path to public directory

var pub = __dirname + '/public';

// Setup middleware

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(pub));

var server = app.listen(app.get('port'));

// Websockets

var io = require('socket.io').listen(server);

// Set default template engine to "jade"

app.set('view engine', 'jade');

// Logic

var Game = function() {
	this.players = {};
	this.url = Math.random().toString(36).substr(2, 5);
	this.socket = null;
    this.playing = false;
};

var Player = function(id) {
    this.id = id;
	this.socket = null;
};

var urlGameMap = {};

// Routes

app.get('/', function(req, res) {
	res.render('game');
});

app.get('/:game', function(req, res) {
    var game = urlGameMap[req.params.game];

	if (!urlGameMap[req.params.game]) {
		return res.send('Game not found!');
	}

    console.log('no. players:' +  Object.keys(game.players).length);
    if (Object.keys(game.players).length >= 6) {
        return res.send('Game is full!');
    }

    if (game.playing) {
        return res.send('Game already started!');
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

        socket.on('disconnect', function() {
            delete urlGameMap[game.url];
        });
	});

	socket.on('new player', function(data) {
		if (Object.keys(urlGameMap).length < 1) {
			return;
		}

		var player = new Player(socket.id);
		player.socket = socket;
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.players[player.id] = player;
		socket.join(game.url);

		game.socket.emit('new player', {
			playerId: player.id,
            foo: 'bar',
            baz: 'steveo'
		});

        socket.on('disconnect', function() {
            console.log('player left');
            game.socket.emit('delete player', {
                playerId: player.id
            });
            delete game.players[player.id];
        });
	});

	socket.on('player confirmed', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		var player = game.players[data.playerId];
		if (!player) {
			return;
		}

		player.socket.emit('player confirmed', {
			gameUrl: game.url,
			playerId: player.id,
			playerColor: data.playerColor
		});
	});

	socket.on('name player', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.socket.emit('name player', {
			playerId: data.playerId,
			playerName: data.playerName
		});
	});

	socket.on('ready player', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.socket.emit('ready player', {
			playerId: data.playerId
		});
	});

	socket.on('start ready', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

        game.playing = true;

		socket.broadcast.to(game.url).emit('start ready');
	});

	socket.on('start game', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		socket.broadcast.to(game.url).emit('start game');
	});

	socket.on('move player', function(data) {
		var game = urlGameMap[data.gameUrl];
		if (!game) {
			return;
		}

		game.socket.emit('move player', {
			playerId: data.playerId,
			playerDirection: data.playerDirection
		});
	});

    socket.on('end game', function(data) {
        var game = urlGameMap[data.gameUrl];
        if (!game) {
            return;
        }

        socket.broadcast.to(game.url).emit('end game', {
            gameWinnerId: data.gameWinnerId
        });
    });

});
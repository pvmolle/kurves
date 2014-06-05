//(function(window, document, io) {

	"use strict";

	function Game(url, width, height, canvasId) {
		this.url = url;
		this.width = width;
		this.height = height;
		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.players = {};
		this.color = '#000000';
		this.playerColors = ['#ff009e', '#ff2600', '#ff9300', '#87ff00', '#00ff61', '#00fdff', '#0043ff', '#bc00ff'];
		this.activeColors = ['#ffffff'];
		this.state = 'lobby';
	}

	Game.prototype.checkAllPlayersReady = function() {
		var self = this;

		var allPlayersReady = true;

		var playersList = Object.keys(this.players);
		playersList.forEach(function(id) {
			var p = self.players[id];

			allPlayersReady = allPlayersReady && p.ready;
		});

		if (allPlayersReady) {

			// Logic to show button
		
		};
	};
	
	Game.prototype.loop = function() {
		var self = this;
		requestAnimationFrame(this.loop.bind(this));

		var playersList = Object.keys(this.players);
		playersList.forEach(function(id) {
			var p = self.players[id];

			if (!p.alive) {
				return;
			}
			
			// Player position
			
			if ('left' === p.direction) {
				p.angle -= Math.PI / 60;
			} else if ('right' === p.direction) {
				p.angle += Math.PI / 60;
			}
			
			p.x += Math.cos(p.angle);
			p.y += Math.sin(p.angle);

			var xToMeasure = p.x + (2 * Math.cos(p.angle));
			var yToMeasure = p.y + (2 * Math.sin(p.angle));

			var xy = [xToMeasure, yToMeasure];

			if (matchColors(xy, self.activeColors)) {
				p.alive = false;
				return;
			}

			// Draw player
			
			ctx.fillStyle = p.color;

			ctx.beginPath();
			ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI, true);
			ctx.fill();
		});
	};

	Game.prototype.start = function() {
		this.state = 'playing';
		this.loop();
	};

	function Player(id, game) {
		this.id = id;
		this.name = null;
		this.direction = null;
		this.x = Math.floor(Math.random() * (game.width - 60)) + 30;
		this.y = Math.floor(Math.random() * (game.height - 60)) + 30;
		this.previousX = this.x;
		this.previousY = this.y;
		this.angle = Math.random() * Math.PI * 2;
		this.alive = true;
		this.color = (function() {
			var length = game.playerColors.length;
			var color = game.playerColors.splice(Math.floor(Math.random() * length), 1)[0];
			game.activeColors.push(color);
			return color;
		})();
		this.ready = false;
	}

	function matchColor(xy, color) {
		var p = ctx.getImageData(xy[0], xy[1], 1, 1).data;
		var hex = 0 === p[3] ? '#ffffff' : '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);

		return hex === color;
	}

	function matchColors(xy, colors) {
		var match = false;
		
		colors.forEach(function(color) {
			if (matchColor(xy, color)) {
				match = true;
			}
		});

		return match;
	}

	function rgbToHex(r, g, b) {
		return ((r << 16) | (g << 8) | b).toString(16);
	}

	function distance(x1, y1, x2, y2) {
		var xs = x2 - x1;
		xs *= xs;

		var ys = y2 - y1;
		ys *= ys;

		return Math.sqrt(xs + ys);
	}

	var game;
	var socket = io();


	// Canvas
	
	var canvas = document.getElementById('the-canvas');
	var ctx = canvas.getContext('2d');

	// Listeners
	
	document.getElementById('startButton').addEventListener('click', function() {
		socket.emit('start ready', {
			gameUrl: game.url
		});

		setTimeout(function() {
			game.start();

			socket.emit('start game', {
				gameUrl: game.url
			});
		}, 3000);
	});

	// Sockets

	socket.on('connect', function() {
		socket.emit('new game');
	})

	socket.on('new game', function(data) {
		game = new Game(data.url, 500, 500, 'the-canvas');
		document.getElementById('title').innerHTML = 'Game: ' + game.url;
		ctx.fillRect(0, 0, game.width, game.height, game.color);
	});

	socket.on('new player', function(data) {
		var player = new Player(data.playerId, game);
		game.players[player.id] = player;

		socket.emit('player confirmed', {
			gameUrl: game.url,
			playerId: player.id,
			playerColor: player.color
		});
	});

	socket.on('name player', function(data) {
		var player = game.players[data.playerId];
		if (!player) {
			return;
		}

		player.name = data.playerName;
		
		var listItem = document.createElement('li');
		listItem.style.color = player.color;
		listItem.innerHTML = player.name + ' - ' + (player.ready ? 'Ready' : 'Standby');

		document.getElementById('list').appendChild(listItem);
	});

	socket.on('ready player', function(data) {
		var player = game.players[data.playerId];
		if (!player) {
			return;
		}

		player.ready = true;

		var listItem = document.createElement('li');
		listItem.style.color = player.color;
		listItem.innerHTML = player.name + ' - ' + (player.ready ? 'Ready' : 'Standby');

		document.getElementById('list').appendChild(listItem);

		game.checkAllPlayersReady();
	});

	socket.on('move player', function(data) {
		game.players[data.playerId].direction = data.playerDirection;
	});

//})(window, document, io, null);
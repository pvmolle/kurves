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
	}

	function Player(options, game) {
		this.id = options.id;
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

	var title = document.getElementById('title');
	var list = document.getElementById('list');
	var game;
	var socket = io();


	// Canvas
	
	var canvas = document.getElementById('the-canvas');
	var ctx = canvas.getContext('2d');

	socket.on('connect', function() {
		socket.emit('new game');
	})

	socket.on('new game', function(data) {
		game = new Game(data.url, 500, 500, 'the-canvas');
		title.innerHTML = 'Game: ' + game.url;
		ctx.fillRect(0, 0, game.width, game.height, game.color);

		// Temporarily add some players
		
		game.players['3'] = new Player({ id: 3 }, game);
		game.players['4'] = new Player({ id: 4 }, game);
		game.players['5'] = new Player({ id: 5 }, game);
		game.players['6'] = new Player({ id: 6 }, game);
	});

	socket.on('new player', function(data) {
		game.players[data.player.id] = new Player(data.player, game);
	});

	socket.on('player move', function(data) {
		game.players[data.playerId].direction = data.playerDirection;
	});

	// Game loop
	
	requestAnimationFrame(function loop() {
		requestAnimationFrame(loop);
		if (!game) {
			return;
		}

		var playersList = Object.keys(game.players);
		playersList.forEach(function(id) {
			var p = game.players[id];

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

			if (matchColors(xy, game.activeColors)) {
				p.alive = false;
				return;
			}

			// Draw player
			
			ctx.fillStyle = p.color;

			ctx.beginPath();
			ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI, true);
			ctx.fill();
		});
	});

//})(window, document, io, null);
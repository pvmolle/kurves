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
	res.render('home');
});

// Moar websockets

io.on('connection', function(socket) {

	socket.on('new message', function(data) {
		io.sockets.emit('new message', {
			message: data.message
		});
	});

});
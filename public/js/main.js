(function(window, document, io) {

	"use strict";

	// Fields

	var list = document.getElementById('chat');
	var input = document.getElementById('textField');
	var button = document.getElementById('submitButton');

	// Socket

	var socket = io();

	// Listeners

	button.addEventListener('click', function(evt) {
		evt.preventDefault();

		var message;
		if (!(message = input.value.trim())) {
			return;
		}

		socket.emit('new message', { message: message });
	});

	socket.on('new message', function(data) {
		var message = document.createElement('li');
		message.innerHTML = data.message;
		list.appendChild(message);
		input.value = '';
	});

})(window, document, io, null);
/**
 * Module dependencies
 */

var express = require('express');

// Path to public directory

var pub = __dirname + '/public';

// Setup middleware

var app = express();
app.use(express.static(pub));

// Set default template engine to "jade"

app.set('view engine', 'jade');

// Routes

app.get('/', function(req, res) {
	res.render('home');
});

app.listen(3000);
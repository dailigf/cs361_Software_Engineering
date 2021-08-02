// App.js

/*
	SETUP
*/ 
var Tx = require('ethereumjs-tx').Transaction;
//Web3
var Web3 = require('Web3');
const web3 = new Web3('http://127.0.0.1:7545');
var express = require('express');   // We are using the express library for the web server
var app = express();            // We need to instantiate an express object to interact with the server in our code
//PORT        = 31337;                 // Set a port number at the top so it's easy to change in the future

var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

app.engine('handlebars', handlebars.engine);
app.set('view engine', handlebars);
app.set('port', 31337);
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/dApp', require('./dApp.js'));



app.listen(app.get('port'), function () {            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.')
});


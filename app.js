/*
	SETUP
*/ 
var Tx = require('ethereumjs-tx').Transaction;
var Web3 = require('Web3');
const web3 = new Web3('http://127.0.0.1:7545');
var express = require('express');   
var app = express();            

var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

app.engine('handlebars', handlebars.engine);
app.set('view engine', handlebars);
app.set('port', 31337);
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Routers
app.use('/dApp', require('./dApp.js'));

app.listen(app.get('port'), function () {           
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.')
});


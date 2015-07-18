var dlxdd = require('./dlxdd_bot');
var express = require('express');
var bodyParser = require('body-parser');
var XMPP = require('node-xmpp-client');
var ltx = require('node-xmpp-core').ltx;
var jsonfile = require('jsonfile');

var slack = express();
var port = process.env.SLACK_PORT || 8080;
var cred = jsonfile.readFileSync([dlxdd.get_home(), "dlxdd_config.json"].join("/")).xmpp;

var xmpp = new XMPP.Client({
	jid : cred['jid'],
	password : cred['pwd']
});

xmpp.on('connection', function() {
	console.log("XMPP connected");
});

xmpp.on('online', function(info) {
	console.log("XMPP online");
	dlxdd.test_mod();
});
xmpp.on('stanza', function(stanza) {
	console.log("Stanza: ", stanza.toString());
});
xmpp.on('error', function(info) {
	console.log("XMPP ERROR:");
	console.log(info);
	console.log(info.stanza.children);
});

slack.use(bodyParser.urlencoded({ extended : true }));
slack.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(400).send(err.message);
});
slack.get('/', function(req, res) {
	dlxdd.test_mod()
	res.status(200).send("<h1>AYO TECHNOLOGY!<br />Deep Lab x Deepdream</h1>")
});
slack.post('/deepdream', dlxdd.respond);
slack.post('/communicate', function(req, res, next) {
	var stanza = new ltx.Element('message', {
		to : cred['bot_jid'],
		type : "chat"
	}).c('body').t(JSON.stringify(req.body));

	console.log(stanza);
	xmpp.send(stanza);
	return res.status(200).end();
});
slack.listen(port, function() {
	console.log("HEY WHAT IS UP ON NODE PORT " + port);
});

var on_exit = function(opts, err) {
	console.log("EXITING...");
	xmpp.end();

	if(opts.exit) {
		process.exit();
	}
};

process.on('SIGINT', on_exit.bind(null, { exit : true }));
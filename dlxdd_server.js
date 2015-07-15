var dlxdd = require('./dlxdd_bot');
var express = require('express');
var bodyParser = require('body-parser');

var slack = express();
var port = process.env.SLACK_PORT || 8080;

slack.use(bodyParser.urlencoded({ extended : true }));
slack.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(400).send(err.message);
});

slack.get('/', function(req, res) {
	res.status(200).send("<h1>AYO TECHNOLOGY!<br />Deep Lab x Deepdream</h1>")
});
slack.post('/deepdream', dlxdd.respond);

slack.listen(port, function() {
	console.log("HEY WHAT IS UP ON NODE PORT " + port);
	console.log(dlxdd);
});
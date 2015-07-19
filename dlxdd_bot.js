module.exports =  {
	exec : function() {
		return require('exec-sync');
	},
	fs : function() {
		return require('fs');
	},
	py : function(cmd) {
		cmd.unshift("python");

		var exec = module.exports.exec();
		var res = exec(cmd.join(" "), true);

		console.log(res.stderr);

		if(res.stderr) {
			console.log(res.stderr.toString());
			return res.stderr.toString();
		}

		console.error("No result to return");
		return null;
	},
	http : function() {
		return require('http');
	},
	querystring : function() {
		return require('querystring');
	},
	xmpp : function(obj) {
		obj = module.exports.querystring().stringify(obj);

		var opts = {
			host : "localhost",
			path : "/communicate",
			port : process.env.SLACK_PORT || 8080,
			method : 'POST',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : obj.length
			}
		};

		var callback = function(res) {
			var str = '';
			
			res.on('data', function(chunk) {
				str += chunk;
			});

			res.on('end', function() {
				console.log(str);
			});
		};

		var req = module.exports.http().request(opts, callback);
		req.on('error', function(err) {
			console.log("ERROR: " + err);
		});

		req.write(obj);
		req.end();

		return req;
	},
	test_mod: function() {
		//return module.exports.create_deepdream("user_id", "user_name");
		//return module.exports.iterate_deepdream("abcdefg12345678");
		//return module.exports.giffify_deepdream("abcdefg12345678");
		//return module.exports.init_deepdream("https://slack-files.com/files-pub/T043P3V33-F07RL3K9T-93ad9997ec/download/1hdwaunxoaaaewie-vinz8uwuskwpqzmo.large.png");
		
		return module.exports.generate_dlxdd_request(null, 
			{ is_test : true, message : "AYO TECHNOLOGY!" },
			"AYO TECHNOLOGY");
	},
	get_home : function() {
		return process.env.HOME || process.env.USERPROFILE;
	},
	generate_dlxdd_request : function(doc_id, extras, response) {
		// create dd_doc and put into dropbox
		var dest_path = "dlxdd_iteration_request_" + Date.now() + ".json";
		var src_path = [module.exports.get_home(), "dlxdd_tmp", dest_path].join("/");

		dlxdd_request = {};
		for(var prop in extras) {
			dlxdd_request[prop] = extras[prop];
		}

		if(doc_id) {
			dlxdd_request.doc_id = doc_id;
		}

		var xmpp = module.exports.xmpp(dlxdd_request);

		if(xmpp) {
			return {
				text : response + " image `" + (doc_id ? doc_id : "(none)") + "`!  Stand by..."
			};
		}

		return null;
	},
	create_deepdream : function(user_id, user_name) {
		var asset_regex = /https:\/\/slack\-files\.com/i;
		var request_file = module.exports.py(['slack_api.py', 'request_file', user_id]);

		if(!request_file || !request_file.match(asset_regex)) {
			console.error("could not get any file.");
			return null;
		}

		var send_to_dropbox = module.exports.py(['slack_api.py', 'send_file', request_file]);
		var init_deepdream = module.exports.init_deepdream(request_file);
		console.log(init_deepdream);

		if(send_to_dropbox && init_deepdream) {
			return {
				text : "...starting Deepdream for <@" + user_id + ">..."
			};			
		} else {
			console.error("could not send file to dropbox.");
		}

		return null;
	},
	init_deepdream : function(request_file) {
		var comp = request_file.split('/');
		comp.reverse();

		module.exports.generate_dlxdd_request(null, {
			file_name : comp[0],
			task_path : "Documents.evaluate_document.evaluateDocument"
		}, "Initing Deepdream for file ");

		return true;
	},
	giffify_deepdream : function(doc_id) {
		return module.exports.generate_dlxdd_request(doc_id, 
			{ task_path : "DeepDream.giffify_deepdream.giffify_deepdream" },
			"Giffifying Deepdream for");
	},
	iterate_deepdream : function(doc_id) {
		return module.exports.generate_dlxdd_request(doc_id, 
			{ task_path : "DeepDream.iterate_deepdream.iterate_deepdream" },
			"MOAR Deepdream on");
	},
	respond : function(req, res, next) {
		var user_name = req.body.user_name;

		if(user_name === 'slackbot') {
			return res.status(200).end();
		}

		console.log(req.body);

		var dlxdd_payload = null;
		var moar_regex = /^moar\s[a-z0-9]{40}/i;
		var giffify_regex = /^gif\s[a-z0-9]{40}/i;

		var PAYLOAD_DIRECTION = {
			CREATE : 1,
			ITERATE : 2,
			GIFFIFY : 3
		};
		
		var build_payload = function(direction, extras) {
			if(direction === PAYLOAD_DIRECTION.CREATE) {
				console.log("no text in request body.  Let's scrape user " + extras + "'s last image...");
				return module.exports.create_deepdream(extras, user_name);
			} else if(direction === PAYLOAD_DIRECTION.ITERATE) {
				console.log("moar-ing image " + extras);
				return module.exports.iterate_deepdream(extras);
			} else if(direction === PAYLOAD_DIRECTION.GIFFIFY) {
				console.log("giffifying image " + extras);
				return module.exports.giffify_deepdream(extras);
			}
		};

		if(!req.body.text) {
			dlxdd_payload = build_payload(PAYLOAD_DIRECTION.CREATE, req.body.user_id);
		} else {
			var moar = req.body.text.match(moar_regex);
			var gif = req.body.text.match(giffify_regex);

			if(moar) {
				dlxdd_payload = build_payload(PAYLOAD_DIRECTION.ITERATE, moar[0].split(" ")[1]);
			} else if(gif) {
				dlxdd_payload = build_payload(PAYLOAD_DIRECTION.GIFFIFY, gif[0].split(" ")[1]);
			}
		}

		if(dlxdd_payload) {
			return res.status(200).json(dlxdd_payload);
		}

		return res.status(200).end();
	}
};
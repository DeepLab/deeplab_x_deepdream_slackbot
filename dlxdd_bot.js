module.exports =  {
	exec : function() {
		return require('exec-sync');
	},
	jsonfile : function() {
		return require('jsonfile');
	},
	py : function(cmd) {
		cmd.unshift("python");

		var exec = module.exports.exec();
		var res = exec(cmd.join(" "), true);

		if(res.stderr) {
			console.log(res.stderr.toString());
			return res.stderr.toString();
		}

		console.error("No result to return");
		return null;
	},
	test_mod: function() {
		//return module.exports.create_deepdream("user_id", "user_name");
		//return module.exports.iterate_deepdream("abcdefg12345678");
		return "OK!";
	},
	create_deepdream : function(user_id, user_name) {
		// scrape user's last image into dropbox
		var asset_regex = /https:\/\/slack\-files\.com/i;
		var request_file = module.exports.py(['slack_api.py', 'request_file', user_id]);

		if(!request_file || !request_file.match(asset_regex)) {
			console.error("could not get any file.");
			return null;
		}

		var send_to_dropbox = module.exports.py(['slack_api.py', 'send_file', request_file]);

		if(send_to_dropbox) {
			return {
				text : "...starting Deepdream for " + user_name + "..."
			};			
		} else {
			console.error("could not send file to dropbox.");
		}

		return null;
	},
	get_home : function() {
		return process.env.HOME || process.env.USERPROFILE;
	},
	iterate_deepdream : function(doc_id) {
		// create dd_doc and put into dropbox
		var dest_path = "dlxdd_iteration_request_" + Date.now() + ".json";
		var src_path = [module.exports.get_home(), "dlxdd_tmp", dest_path].join("/");
		
		var jsonfile = module.exports.jsonfile();
		jsonfile.writeFileSync(src_path, { doc_id : doc_id });

		var send_to_dropbox = module.exports.py(['dropbox_api.py', 'send_to_dropbox', dest_path, src_path]);
		if(send_to_dropbox) {
			return {
				text : "Request to iterate Deepdream on image " + doc_id + " placed.  Please wait..."
			};
		}

		return null;
	},
	respond : function(req, res, next) {
		var user_name = req.body.user_name;

		if(user_name === 'slackbot') {
			return res.status(200).end();
		}

		console.log(req.body);

		var dlxdd_payload = null;
		var moar_regex = /moar\s[a-z0-9\-_]+/i;
		var PAYLOAD_DIRECTION = {
			CREATE : 1,
			ITERATE : 2
		};
		
		var get_payload = function(direction, extras) {
			if(direction === PAYLOAD_DIRECTION.CREATE) {
				console.log("no text in request body.  Let's scrape user " + extras + "'s last image...");
				return module.exports.create_deepdream(extras, user_name);
			} else if(direction === PAYLOAD_DIRECTION.ITERATE) {
				console.log("moar-ing image " + extras);
				return module.exports.iterate_deepdream(extras);
			}
		};

		if(!req.body.text) {
			dlxdd_payload = get_payload(PAYLOAD_DIRECTION.CREATE, req.body.user_id);
		} else if(req.body.text.match(moar_regex)) {
			dlxdd_payload = get_payload(PAYLOAD_DIRECTION.ITERATE, req.body.text.split(" ")[1]);
		}

		if(dlxdd_payload) {
			return res.status(200).json(dlxdd_payload);
		}

		return res.status(200).end();
	}
};
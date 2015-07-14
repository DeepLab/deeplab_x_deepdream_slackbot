module.exports = function(req, res, next) {
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
			return create_deepdream(extras);
		} else if(direction === PAYLOAD_DIRECTION.ITERATE) {
			console.log("moar-ing image " + extras);
			return iterate_deepdream(extras);
		}
	};

	var spawn = require('child_process').spawnSync;

	var create_deepdream = function(user_id) {
		// scrape last image into dropbox
		// wait for result in thread...
		var request_file = spawn('python', ['slack_api.py', 'request_file', user_id]);
		console.info("got file " + request_file);

		if(request_file) {
			var send_to_dropbox = spawn('python', ['slack_api.py', 'send_file', request_file]);
			console.info("sent file " + request_file + "? " + send_to_dropbox);

			if(send_to_dropbox) {
				return {
					text : "File " + request_file + " sent to Deepdream server on " + user_name + "'s behalf."
				};
			}
		}

		return null;
	};

	var iterate_deepdream = function(doc_id) {
		// create dd_doc and put into dropbox
		// wait for result in thread...
		var i_req = { doc_id : doc_id };
		var i_req_path = "dlxdd_iteration_request_" + Date.now() + ".json";

		var send_to_dropbox = spawn('python', 
			['dropbox_api.py', 'send_to_dropbox', i_req_path, JSON.stringify(i_req)]);
		console.info("sent file " + i_req_path + "? " + send_to_dropbox);

		if(send_to_dropbox) {
			return {
				text : "Request to iterate Deepdream on image " + doc_id + " placed.  Please wait..."
			};
		}

		return null;
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
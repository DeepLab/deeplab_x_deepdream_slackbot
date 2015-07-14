import os, json, logging, requests
from utils import default_config_path

def init_slack(config, config_path=None):
	if config_path is None:
		config_path = default_config_path()

	from fabric.operations import prompt

	if 'slack' not in config.keys():
		config['slack'] = {}

	for credential in ['api_token']:
		if credential not in config['slack'].keys():
			config['slack'][credential] = prompt("Slack %s" % credential)

	try:
		with open(config_path, 'wb+') as C:
			C.write(json.dumps(config))

		return True
	except Exception as e:
		logging.error("Could not save config: [%s, %s]" % (type(e), e))

	return False

def __get_api_token(config_path=None):
	if config_path is None:
		config_path = default_config_path()

	try:
		with open(config_path, 'rb') as C:
			return json.loads(C.read())['slack']['api_token']

	except Exception as e:
		logging.error("Could not get API token from config: [%s, %s]" % (type(e), e))

	return None

def request_file_for_user(user_id):
	api_token = __get_api_token()
	
	if api_token is None:
		logging.error("Could not get Slack API token.")
		return None

	try:
		r = json.loads(requests.get('https://slack.com/api/files.list?token=%s&count=2&user=%s&types=images' % \
			(api_token, user_id)).content)

		if not r['ok'] or 'files' not in r.keys():
			logging.error("Not OK")
			return None

		return r['files'][0]['url_download']
		
	except Exception as e:
		logging.error("Could not get any files for user: [%s, %s]" % (type(e), e))

	return None

def put_file_in_dropbox(permalink):
	try:
		r = requests.get(permalink)
		
		if r.status_code != 200 or not r.content:
			logging.error("Sorry, no file")
			return False

		from dropbox_api import send_to_dropbox
		return send_to_dropbox(permalink.split('/')[-1], r.content)

	except Exception as e:
		logging.error("Could not pull file from Slack: [%s, %s]" % (type(e), e))

	return False
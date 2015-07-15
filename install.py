from sys import argv, exit
import os, json, logging

def install_dropbox():
	config = {}
	config_path = os.path.join(os.path.expanduser('~'), "dlxdd_config.json")

	try:
		with open(config_path, 'rb') as C:
			config.update(json.loads(C.read()))
	except Exception as e:
		logging.warn("Config is not good: [%s, %s]" % (type(e), e))

	from dropbox_api import init_dropbox
	return init_dropbox(config)

def setup_slack():
	config = {}
	config_path = os.path.join(os.path.expanduser('~'), "dlxdd_config.json")

	try:
		with open(config_path, 'rb') as C:
			config.update(json.loads(C.read()))
	except Exception as e:
		logging.warn("Config is not good: [%s, %s]" % (type(e), e))

	from slack_api import init_slack
	return init_slack(config)

def make_dirs():
	tmp_dir = os.path.join(os.path.expanduser('~'), "dlxdd_tmp")

	try:
		if not os.path.exists(tmp_dir):
			os.mkdir(tmp_dir)

		return True
	except Exception as e:
		logging.error("Could not make temp directory")

	return False


if __name__ == "__main__":
	res = False

	if len(argv) == 1:
		res = install_dropbox() and setup_slack() and make_dirs()
	else:
		if argv[1] == "dropbox":
			res = install_dropbox()
		if argv[1] == "slack":
			res = setup_slack()
		if argv[1] == "dirs":
			res = make_dirs()

	exit(0 if res else -1)
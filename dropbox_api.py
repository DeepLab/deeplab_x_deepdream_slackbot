import os, json, logging, dropbox
from utils import default_config_path
from sys import argv, exit

def init_dropbox(config, config_path=None):
	if config_path is None:
		config_path = default_config_path()

	from fabric.operations import prompt

	if 'dropbox' not in config.keys():
		config['dropbox'] = {}

	for credential in ['app_key', 'app_secret']:
		if credential not in config['dropbox'].keys():
			config['dropbox'][credential] = prompt("Dropbox %s: " % credential)

	if 'access_token' not in config['dropbox'].keys():
		print "Initiating Dropbox API..."
		flow = dropbox.client.DropboxOAuth2FlowNoRedirect(\
			config['dropbox']['app_key'], config['dropbox']['app_secret'])

		print "Visit %s in a browser and authorize." % flow.start()
		auth_code = prompt("Then paste the authorization code here: ").strip()

		try:
			config['dropbox']['access_token'], config['dropbox']['user_id'] = \
				flow.finish(auth_code)
		except Exception as e:
			logging.error("Could not get Dropbox authorization code: [%s, %s]" % (type(e), e))
			return False

	try:
		with open(config_path, 'wb+') as C:
			C.write(json.dumps(config))

		return True
	except Exception as e:
		logging.error("Could not save config: [%s, %s]" % (type(e), e))

	return False

def __get_client(config_path=None):
	if config_path is None:
		config_path = default_config_path()

	try:
		with open(config_path, 'rb') as C:
			access_token = json.loads(C.read())['dropbox']['access_token']

		return dropbox.client.DropboxClient(access_token)

	except Exception as e:
		logging.error("Could not load config at %s: [%s, %s]" % (config_path, type(e), e))
	
	return None

def __get_folder():
	return os.path.join("/", "deeplab_x_deepdream")

def setup_dlxdd_folder(config_path=None):
	try:
		client = __get_client(config_path=config_path)
		
		if __get_folder() not in \
			[folder['path'] for folder in client.metadata('/')['contents']]:
			print "Creating folder %s" % __get_folder()
			
			res = client.file_create_folder(__get_folder())
			print res

			if res:
				print "Created folder"
				return True
		else:
			return True

	except Exception as e:
		logging.error("Could not init folder: [%s, %s]" % (type(e), e))

	return False

def send_to_dropbox(dest_path, src_path=None, raw_data=None, config_path=None):
	if src_path is None and raw_data is not None:
		data = raw_data
	elif src_path is not None and raw_data is None:
		try:
			with open(src_path, 'rb') as D:
				data = D.read()
		except Exception as e:
			logging.error("Could not get any data from %s" % src_path)
			return False

	try:
		client = __get_client(config_path=config_path)
		res = client.put_file(os.path.join(__get_folder(), dest_path), data)
		
		print res

		if res:
			print "Uploaded %s" % dest_path
			return True
	
	except Exception as e:
		logging.error("Could not upload to dropbox: [%s, %s]" % (type(e, e)))

	return False

if __name__ == "__main__":
	res = False
	
	if len(argv) >= 4 and argv[1] == "send_to_dropbox":
		res = send_to_dropbox(argv[2], src_path=argv[3])
		
	exit(res)

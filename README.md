This is what the slackbot does.

## Dependencies

You should already have Nodejs up and running.  It's also good to run this in a `virtualenv`.  Run `install.py` to setup your personal variables.  Finally, run `npm install`.

## Config

Your config should look like this:

```
{
	"dropbox" : {
		"app_key" : "your dropbox api key",
		"app_secret" : "your app secret"
	},
	"slack" : {
		"api_token" : "your slack api token"
	}
}
```

## Install

```
python install.py
npm install
```

## Run

```
source venv/bin/activate
node dlxdd_server.js
```
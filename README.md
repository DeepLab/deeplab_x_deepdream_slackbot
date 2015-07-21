This is what the slackbot does.

## Dependencies

You will need 2 jabber ids: one for this slackbot, and one for the corresponding annex that processes your dreams.  As you might guess, the slackbot ferries commands to the annex via xmpp.  You should also already have Nodejs up and running.  It's also good to run this in a `virtualenv`.  Run `install.py` to setup your personal variables.  Finally, run `npm install`.

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
	},
	"xmpp" : {
		"jid" : "the jabber id of this client",
		"pwd" : "the corresponding password",
		"bot_jid" : "the jabber id of the annex"
	}
}
```

## Install

```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python install.py
npm install
```

## Run

```
source venv/bin/activate
node dlxdd_server.js
```

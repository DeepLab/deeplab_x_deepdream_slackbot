This is what the slackbot does.

## Dependencies

This will be installed for you if you run `./install.sh`.  Python dependencies are not "sudoed", meaning that you should run this in a virtual environment if necessary.  You should already have pip.

1.	Node.js
1.	Dropbox python API toolkit

## Config

Your config should look like this:

```
{
	"dropbox" : {
		"app_key" : "your dropbox api key",
		"app_secret" : "your app secret"
	}
}
```
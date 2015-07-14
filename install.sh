#! /bin/bash

sudo apt-get update

# Install node.js
sudo apt-get install -yq nodejs nodejs-legacy npm

# Install python dependencies
virtualenv venv
source venv/bin/activate

pip install -r requirements.txt
python install.py

deactivate venv

# With env vars
echo "export SLACK_PORT=8080" >> ~/.bash_profile
source ~/.bash_profile

npm install
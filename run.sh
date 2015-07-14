#! /bin/bash
source ~/.bash_profile

sudo service ssh start

source venv/bin/activate
node dlxdd_server.js

tail -f /dev/null
deactivate venv
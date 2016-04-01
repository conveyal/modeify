#!/bin/bash
git pull
sudo rm server.log
echo "" > server.log
sudo killall -9 node
npm start
top
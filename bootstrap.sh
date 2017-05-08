#!/usr/bin/env bash

# update apt
sudo apt-get update

# install java
sudo apt-get install openjdk-8-jre-headless -y

# install elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.4.0.deb
sudo dpkg -i elasticsearch-5.4.0.deb
sudo sed -i '55anetwork.host: 0.0.0.0' /etc/elasticsearch/elasticsearch.yml
sudo cat >> /etc/elasticsearch/elasticsearch.yml << ENDOFTEXT
http.cors.enabled : true  
http.cors.allow-origin : "*"
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type, Content-Length
ENDOFTEXT
sudo systemctl enable elasticsearch.service
sudo systemctl daemon-reload
sudo systemctl restart elasticsearch.service

# install head. no worky for 5.4. instead clone and install.
#sudo /usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head
sudo apt-get --assume-yes install curl
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get --assume-yes install git nodejs
git clone git://github.com/mobz/elasticsearch-head.git
cd elasticsearch-head
npm install
#npm run start

#!/usr/bin/env bash

# update apt
sudo apt-get update

# install java
sudo apt-get install openjdk-7-jre-headless -y

# install elasticsearch
wget https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.2.0/elasticsearch-2.2.0.deb
sudo dpkg -i elasticsearch-2.2.0.deb
sudo sed -i '54anetwork.host: 0.0.0.0' /etc/elasticsearch/elasticsearch.yml
sudo cat >> /etc/elasticsearch/elasticsearch.yml << ENDOFTEXT
http.cors.enabled : true  
http.cors.allow-origin : "*"
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type, Content-Length
ENDOFTEXT
sudo systemctl enable elasticsearch.service
sudo systemctl daemon-reload
sudo systemctl restart elasticsearch.service

# install head
sudo /usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head

Vagrant.configure("2") do |config|
  config.vm.box = "debian/contrib-jessie64"  
  config.vm.box_url = "https://atlas.hashicorp.com/debian/boxes/contrib-jessie64"
  config.vm.provision :shell, :path => "bootstrap.sh"
  config.vm.network :forwarded_port, guest: 9200, host: 9200
end

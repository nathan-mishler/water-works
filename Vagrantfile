# -*- mode: ruby -*-
# vi: set ft=ruby :

#Vagrant::DEFAULT_SERVER_URL.replace('https://vagrantcloud.com')

Vagrant.configure("2") do |config|

    config.vm.box = "scotch/box"
    config.vm.network "private_network", ip: "192.168.33.15"
    # config.vm.network "public_network"
    config.vm.hostname = "scotchbox"
    config.vm.synced_folder "./", "/var/www/public", :mount_options => ["dmode=777", "fmode=666"]
    #config.vm.provider :virtualbox do |vb|
    #  vb.gui = true
    #end
    # Optional NFS. Make sure to remove other synced_folder line too
    #config.vm.synced_folder "./src", "/var/www/public", :nfs => { :mount_options => ["dmode=777","fmode=666"] }

end

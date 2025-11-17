#!/bin/bash

# TODO: find a better solution for the permissions problem
chmod 777 /home/name

cd ~/Website
source ~/Website/config/prod.toml

apt -y install apache2 libmariadb-dev-compat
apt -y install php$PHP_VERSION-curl libapache2-mod-php$PHP_VERSION \
     php$PHP_VERSION php$PHP_VERSION-cli php$PHP_VERSION-common php$PHP_VERSION-mysql
apt -y install python3 python3-dev python3-virtualenv libapache2-mod-wsgi-py3 python-is-python3
apt -y install mariadb-server
# need gcc libs to build the mysql dependancy for django project
apt -y install cron gcc

# need for cattle prod
apt -y install tree

a2enmod userdir
a2enmod php$PHP_VERSION

# optional
apt -y install fortune-mod

TO_PROD=${1:-1}

./cattle_prod.bash $TO_PROD

# clone website repo
# git clone --single-branch --branch master https://github.com/ImprobabilityCast/Website.git

# copy config
cd ~/Website/config
cp ports.conf apache2.conf /etc/apache2/
cp 999-main.conf 001-um.conf 000-default.conf /etc/apache2/sites-available/
cd ../
ln -s /etc/apache2/sites-available/001-um.conf /etc/apache2/sites-enabled/001-um.conf
ln -s /etc/apache2/sites-available/999-main.conf /etc/apache2/sites-enabled/999-main.conf
ln -s /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-enabled/000-default.conf
apache2ctl restart


if [ $TO_PROD != 0 ]
then # prod
    # certs
    cd ~
    git clone https://github.com/acmesh-official/acme.sh.git
    cd ./acme.sh
    ./acme.sh --install -m $MYEMAIL
    alias acme.sh=/root/.acme.sh/acme.sh
    acme.sh --set-default-ca  --server  letsencrypt
    export DH_API_KEY=$DH_API_KEY
    acme.sh --issue --dns dns_dreamhost -d adoodleydo.dev -d www.adoodleydo.dev -d um.adoodleydo.dev \
        --server  letsencrypt -w /home/name/Website/main
    acme.sh --install-cert -d adoodleydo.dev -d www.adoodleydo.dev -d um.adoodleydo.dev \
        --fullchain-file /etc/apache2/sslfullchain.pem \
        --key-file /etc/apache2/sslkey.key \
        --reloadcmd "apache2ctl restart"
    cd ~/Website
else # debug
    source ~/Website/config/debug.toml
fi

a2enmod ssl

# setup php project
mysql < mood_db_setup.sql
mysql -e "CREATE USER 'php'@'localhost' IDENTIFIED BY '$(cat ~/Website/config/mood_db_php_user_pwd.txt)';"
mysql -e "GRANT SELECT, INSERT, UPDATE ON mood.* TO 'php'@'localhost';"
php -e ~/Website/main/mood/generateData.php 10

mysql -e "CREATE DATABASE adoodleydo;"
mysql -e "CREATE USER 'adoodleydo_user'@'localhost' IDENTIFIED BY '$ADOODLEYDO_DB_DJANGO_USER_PWD';"
mysql -e "GRANT CREATE, INSERT, INDEX, SELECT, ALTER, UPDATE, DELETE ON adoodleydo.* TO 'adoodleydo_user'@'localhost'"
# rest will be done through django migrations

# setup django project
virtualenv ~/Website/um/env
source ~/Website/um/env/bin/activate
python -m ensurepip --upgrade
python -m pip install -r ~/Website/um/proj/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
touch ~/Website/um/um.log
chmod uo+rw ~/Website/um/um.log
apache2ctl restart

# TODO: make subdomain use different port with proxypass
# TODO in general: update index.html to include stuff like etsy and upwork
# update upwork to link to specific projects instead of all of them in one


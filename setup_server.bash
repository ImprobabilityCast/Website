#!/bin/bash

cd ~/Website
source ~/Website/config/prod.toml

apt -y install apache2 libmariadb-dev-compat
apt -y install php$PHP_VERSION-curl libapache2-mod-php$PHP_VERSION \
     php$PHP_VERSION php$PHP_VERSION-cli php$PHP_VERSION-common php-$PHP_VERSION-mysql
apt -y install python3 python3-dev libapache2-mod-wsgi-py3 

a2enmod ssl
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
cp ports.conf /etc/apache2/
cp main.conf um.conf default.conf /etc/apache2/sites-available/
cd ../
ln -s /etc/apache2/sites-available/um.conf /etc/apache2/sites-enabled/um.conf
ln -s /etc/apache2/sites-available/main.conf /etc/apache2/sites-enabled/main.conf
ln -s /etc/apache2/sites-available/default.conf /etc/apache2/sites-enabled/default.conf
rm /etc/apache2/sites-enabled/000-default.conf
service apache2 force-reload

# setup php project
mysql < mood_db_setup.sql
mysql -e "CREATE USER 'php'@'localhost' IDENTIFIED BY $MOOD_DB_PHP_USER_PWD;"
mysql -e "GRANT SELECT, INSERT, UPDATE ON mood.* TO 'php'@'localhost';"
php -e ~/Website/main/mood/generateData.php 10

if [ $TO_PROD != 0 ]
then # prod
    # certs
    git clone https://github.com/acmesh-official/acme.sh.git
    cd ./acme.sh
    ./acme.sh --install -m $MYEMAIL
    alias acme.sh=~/.acme.sh/acme.sh
    export DH_API_KEY=$DH_API_KEY
    acme.sh --issue --dns dns_dreamhost -d adoodleydo.dev -d www.adoodleydo.dev -d um.adoodleydo.dev -d mysql.adoodleydo.dev \
        -w ~/Website/main
    acme.sh --install-cert -d adoodleydo.dev -d www.adoodleydo.dev -d um.adoodleydo.dev -d mysql.adoodleydo.dev \
        --reload-cmd "service apache2 force-reload"
else # debug
    source ~/Website/config/debug.toml
fi

mysql -e "CREATE DATABASE adoodleydo;"
mysql -e "CREATE USER 'adoodleydo_user'@'localhost' IDENTIFIED BY $ADOODLEYDO_DB_DJANGO_USER_PWD;"
mysql -e "GRANT CREATE, INSERT, INDEX, SELECT, ALTER, UPDATE, DELETE ON adoodleydo.* TO 'adoodleydo_user'@'localhost'"
# rest will be done through django migrations

# setup django project
python -m venv ~/Website/um/env
source ~/Website/um/env/bin/activate
python -m ensurepip --upgrade
python -m pip install -r ~/Website/um/proj/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
service apache2 force-reload


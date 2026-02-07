#!/bin/bash


HOME=/home/name
# TODO: find a better solution for the permissions problem
chmod 750 $HOME
usermod name -a -G www-data
chgrp www-data $HOME

cd $HOME/Website
source $HOME/Website/config/prod.toml

apt -y install apache2 libmariadb-dev-compat goaccess
apt -y install php$PHP_VERSION-curl libapache2-mod-php$PHP_VERSION \
     php$PHP_VERSION php$PHP_VERSION-cli php$PHP_VERSION-common php$PHP_VERSION-mysql
apt -y install python3 python3-dev python3-virtualenv libapache2-mod-wsgi-py3 python-is-python3
apt -y install mariadb-server
# need gcc libs to build the mysql dependency for django project
apt -y install cron gcc

# need for cattle prod
apt -y install tree

wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
apt update
apt -y install dotnet-sdk-10.0

cp $HOME/Website/echo/echo.service /etc/systemd/system/echo.service
systemctl daemon-reload
systemctl enable echo
systemctl start echo

a2enmod userdir
a2enmod php$PHP_VERSION
a2enmod proxy proxy_http proxy_http2 headers

# optional
apt -y install fortune-mod

TO_PROD=${1:-1}

./cattle_prod.bash $TO_PROD

# copy config
cd $HOME/Website/config
cp ports.conf apache2.conf /etc/apache2/
cp 999-main.conf 002-echo.conf 001-um.conf 000-default.conf /etc/apache2/sites-available/
cd ../
a2ensite 001-um 002-echo 999-main 000-default
apache2ctl restart


if [ $TO_PROD != 0 ]
then # prod
    # certs
    cd $HOME
    git clone https://github.com/acmesh-official/acme.sh.git
    cd ./acme.sh
    ./acme.sh --install -m $MYEMAIL
    alias acme.sh=/root/.acme.sh/acme.sh
    acme.sh --set-default-ca  --server  letsencrypt
    export DH_API_KEY=$DH_API_KEY
    acme.sh --issue --dns dns_dreamhost -d adoodleydo.dev -w $HOME/Website/main \
	-d www.adoodleydo.dev -w $HOME/Website/main \
	-d um.adoodleydo.dev -w $HOME/Website/um \
        --server  letsencrypt
    acme.sh --install-cert -d adoodleydo.dev -d www.adoodleydo.dev -d um.adoodleydo.dev \
        --fullchain-file /etc/apache2/sslfullchain.pem \
        --key-file /etc/apache2/sslkey.key \
        --reloadcmd "apache2ctl restart"
    echo "37 4    * * 4   root    /root/.acme.sh/acme.sh --cron" >> /etc/crontab
    cd $HOME/Website
else # debug
    source $HOME/Website/config/debug.toml
fi

a2enmod ssl

# setup php project
mysql < mood_db_setup.sql
mysql -e "CREATE USER 'php'@'localhost' IDENTIFIED BY '$(cat $HOME/Website/config/mood_db_php_user_pwd.txt)';"
mysql -e "GRANT SELECT, INSERT, UPDATE ON mood.* TO 'php'@'localhost';"
php -e $HOME/Website/main/mood/generateData.php 10

mysql -e "CREATE DATABASE adoodleydo;"
mysql -e "CREATE USER 'adoodleydo_user'@'localhost' IDENTIFIED BY '$ADOODLEYDO_DB_DJANGO_USER_PWD';"
mysql -e "GRANT CREATE, INSERT, INDEX, SELECT, ALTER, UPDATE, DELETE ON adoodleydo.* TO 'adoodleydo_user'@'localhost'"
# rest will be done through django migrations

# setup django project
mkdir -p $HOME/Website/um/public/static/img/art
virtualenv $HOME/Website/um/env
source $HOME/Website/um/env/bin/activate
#python -m ensurepip --upgrade
python -m pip install -r $HOME/Website/um/proj/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
touch $HOME/Website/um/um.log
chmod uo+rw $HOME/Website/um/um.log
apache2ctl restart

mkdir -p $HOME/Website/main/clueless/pkg

chown root /home/name/Website/restart.bash
chgrp root /home/name/Website/restart.bash
chmod 755 /home/name/Website/restart.bash
echo "33 4    * * 4   root    /home/name/Website/restart.bash" >> /etc/crontab
echo "37 4    * * 4   root    /root/.acme.sh/acme.sh --cron" >> /etc/crontab


# setup ssh login with keys only
sed -i 's/^PasswordAuthentication/#PasswordAuthentication/g;
s/^PermitEmptyPasswords/#PermitEmptyPasswords/g;
s/^PubkeyAuthentication/#PubkeyAuthentication/g;
s/^UsePAM/#UsePAM/g;
s/^ChallengeResponseAuthentication/#ChallengeResponseAuthentication/g' '/etc/ssh/sshd_config'

echo 'PasswordAuthentication no
PubkeyAuthentication yes
UsePAM no
PermitEmptyPasswords no
ChallengeResponseAuthentication no' >> '/etc/ssh/sshd_config'
systemctl restart sshd


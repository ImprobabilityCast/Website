apt install apache2 php python3 python3-dev libapache2-mod-wsgi-py3 libmariadb-dev-compat

a2enmod ssl
a2enmod userdir

# optional
apt install fortune

# copy config
cp ~/Website/ports.conf /etc/apache2/
cp ~/Website/main.conf ~/Website/um.conf /etc/apache2/sites-available/
ln -s /etc/apache2/sites-available/um.conf /etc/apache2/sites-enabled/um.conf
ln -s /etc/apache2/sites-available/main.conf /etc/apache2/sites-enabled/main.conf
rm /etc/apache2/sites-enabled/000-default.conf

mysql < mood_db_setup.sql

mysql -e "CREATE DATABASE adoodleydo;"

TO_PROD=${1:-1}

if [ $TO_PROD != 0 ]
then # prod
    mysql -e "CREATE USER 'adoodleydo_user'@'localhost' IDENTIFIED BY '$(cat ~/Website/um/proj/db_pwd.txt)';"
else # debug
    mysql -e "CREATE USER 'adoodleydo_user'@'localhost' IDENTIFIED BY '';"
fi
mysql -e "GRANT CREATE, INSERT, INDEX, SELECT, ALTER, UPDATE, DELETE ON adoodleydo.* TO 'adoodleydo_user'@'localhost'"
# rest will be done through django migrations

#setup django
python -m venv ~/Website/um/env
source ~/Website/um/env/bin/activate
python -m ensurepip --upgrade
python -m pip install -r ~/Website/um/proj/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate


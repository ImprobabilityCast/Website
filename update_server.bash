#!/bin/bash

REPO=/home/name/Website
cd $REPO

git pull

# update django if needed
source $REPO/um/env/bin/activate
cd $REPO/um
python -m pip install -r $REPO/um/proj/requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

# update config if needed
cd $REPO/config
cp ports.conf apache2.conf /etc/apache2/
cp 999-main.conf 001-um.conf 000-default.conf /etc/apache2/sites-available/
cd ../

source ./restart.bash

#!/bin/bash

TO_PROD=${1:-1}

# for file in $(tree -fi --noreport | grep -P '^./((?!env).)*.py$')
# do
#     sed -i 's/import logging/adoodleydo.dev/g' $file
# done

if [ $TO_PROD != 0 ]
then

    # replace all http://127.0.0.1 with adoodleydo.dev
    for file in $(tree -fi -P *.html --noreport | grep -P '^./((?!env).)*.html$')
    do
        sed -i 's/http:\/\/127.0.0.1/https:\/\/adoodleydo.dev/g' $file
    done

    # update settings.py
    sed -i "s/DEBUG = True/DEBUG = False/g;
            s/SESSION_COOKIE_SECURE = False/SESSION_COOKIE_SECURE = True/g;
            s/CSRF_COOKIE_SECURE = False/CSRF_COOKIE_SECURE = True/g;
            s/ALLOWED_HOSTS = \[\]/ALLOWED_HOSTS = \["um.adoodleydo.dev"\]/g;
            s/SECURE_SSL_REDIRECT = False/SECURE_SSL_REDIRECT = True/g;
            s/SECURE_HSTS_SECONDS = 0/SECURE_HSTS_SECONDS = 31536000/g;
            s/'PASSWORD': ''/'PASSWORD': with open(BASE_DIR \/ 'proj\/db_pwd.txt'\) as f: f.read().strip()/g" './proj/settings.py'
else

    # replace all http://127.0.0.1 with adoodleydo.dev
    for file in $(tree -fi -P *.html --noreport | grep -P '^./((?!env).)*.html$')
    do
        sed -i 's/https:\/\/adoodleydo.dev/http:\/\/127.0.0.1/g' $file
    done

    # update settings.py
    sed -i "s/DEBUG = False/DEBUG = True/g;
            s/SESSION_COOKIE_SECURE = True/SESSION_COOKIE_SECURE = False/g;
            s/CSRF_COOKIE_SECURE = True/CSRF_COOKIE_SECURE = False/g;
            s/ALLOWED_HOSTS = \["um.adoodleydo.dev"\]/ALLOWED_HOSTS = \[\]/g;
            s/SECURE_SSL_REDIRECT = True/SECURE_SSL_REDIRECT = False/g;
            s/SECURE_HSTS_SECONDS = 31536000/SECURE_HSTS_SECONDS = 0/g;
            s/'PASSWORD': with open(BASE_DIR \/ 'proj\/db_pwd.txt') as f: f.read().strip()/'PASSWORD': ''/g" './proj/settings.py'

fi

# tell server to update apps
touch 'tmp/restart.txt'

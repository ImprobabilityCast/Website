#!/bin/bash

TO_PROD=${1:-1}


if [ $TO_PROD != 0 ]
then
    # replace all https://127.0.0.1 with adoodleydo.dev
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/https:\/\/127.0.0.1/https:\/\/adoodleydo.dev/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/debug.toml'/config_name = '..\/config\/prod.toml'/g;" "./um/proj/settings.py"

    sed -i "s/^#if sys.executable != INTERP/if sys.executable != INTERP/g" "./um/wsgi.py"

    sed -i "s/#ServerName/ServerName/g;s/SSLCertificate/#SSLCertificate/g;" "./config/main.conf"
    sed -i "s/#ServerName/ServerName/g;s/SSLCertificate/#SSLCertificate/g;" "./config/um.conf"
else

    # replace all adoodleydo.dev with https://127.0.0.1
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/https:\/\/adoodleydo.dev/https:\/\/127.0.0.1/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/prod.toml'/config_name = '..\/config\/debug.toml'/g;" './um/proj/settings.py'

    sed -i "s/^if sys.executable != INTERP/#if sys.executable != INTERP/g" "./um/wsgi.py"

    sed -i "s/ServerName/#ServerName/g;s/#SSLCertificate/SSLCertificate/g;" "./config/main.conf"
    sed -i "s/ServerName/#ServerName/g;s/#SSLCertificate/SSLCertificate/g;" "./config/um.conf"

fi

# tell server to update apps
# touch 'um/tmp/restart.txt'

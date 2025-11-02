#!/bin/bash

TO_PROD=${1:-1}


if [ $TO_PROD != 0 ]
then
    # replace all https://127.0.0.1:444 with um.adoodleydo.dev
    REP_STR='s/http:\/\/127.0.0.1:444/https:\/\/um.adoodleydo.dev/g'
    for file in $(tree -fi -P *.js --noreport './main/js/' | grep -P '^.*\.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'main/index.html'

    # replace all https://127.0.0.1 with adoodleydo.dev
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/https:\/\/127.0.0.1/https:\/\/adoodleydo.dev/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/debug.toml'/config_name = '..\/config\/prod.toml'/g;" "./um/proj/settings.py"

    sed -i "s/^#if sys.executable != INTERP/if sys.executable != INTERP/g" "./um/wsgi.py"

    sed -i "s/^\t#ServerName/\tServerName/g;s/^\tSSLCertificate/\t#SSLCertificate/g;" "./config/main.conf"
    sed -i "s/^\t#ServerName/\tServerName/g;s/^\tSSLCertificate/\t#SSLCertificate/g;" "./config/um.conf"

else
    # replace all um.adoodleydo.dev with https://127.0.0.1:444
    REP_STR='s/https:\/\/um.adoodleydo.dev/http:\/\/127.0.0.1:444/g'
    for file in $(tree -fi -P *.js --noreport './main/js/' | grep -P '^.*\.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'main/index.html'

    # replace all adoodleydo.dev with https://127.0.0.1
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/https:\/\/adoodleydo.dev/https:\/\/127.0.0.1/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/prod.toml'/config_name = '..\/config\/debug.toml'/g;" './um/proj/settings.py'

    sed -i "s/^if sys.executable != INTERP/#if sys.executable != INTERP/g" "./um/wsgi.py"

    sed -i "s/^\tServerName/\t#ServerName/g;s/^\t#SSLCertificate/\tSSLCertificate/g;" "./config/main.conf"
    sed -i "s/^\tServerName/\t#ServerName/g;s/^\t#SSLCertificate/\tSSLCertificate/g;" "./config/um.conf"
fi

# tell server to update apps
# touch 'um/tmp/restart.txt'

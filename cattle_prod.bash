#!/bin/bash

TO_PROD=${1:-1}


if [ $TO_PROD != 0 ]
then
    # replace all 127.0.0.1:444 with um.adoodleydo.dev
    REP_STR='s/127.0.0.1:444/um.adoodleydo.dev/g'
    for file in $(tree -fi -P *.js --noreport './main/js/' | grep -P '^.*\.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'main/index.html'

    # replace all 127.0.0.1 with adoodleydo.dev
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/127.0.0.1/adoodleydo.dev/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/debug.toml'/config_name = '..\/config\/prod.toml'/g;" "./um/proj/settings.py"

    #sed -i "s/^#if sys.executable != INTERP/if sys.executable != INTERP/g" "./um/wsgi.py" # only needed for passenger
    sed -i "s/ssl\/certs\/ssl-cert-snakeoil/apache2\/sslfullchain/g;
        s/ssl\/private\/ssl-cert-snakeoil/apache2\/sslkey/g" "./config/999-main.conf"

    sed -i "s/ssl\/certs\/ssl-cert-snakeoil/apache2\/sslfullchain/g;
        s/ssl\/private\/ssl-cert-snakeoil/apache2\/sslkey/g
        s/VirtualHost \*:444/VirtualHost \*:443/g;" "./config/001-um.conf"

    sed -i "s/^\Redirect/\t#Redirect/g;" "./config/000-default.conf"

else
    # replace all um.adoodleydo.dev with 127.0.0.1:444
    REP_STR='s/um.adoodleydo.dev/127.0.0.1:444/g'
    for file in $(tree -fi -P *.js --noreport './main/js/' | grep -P '^.*\.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'main/index.html'

    # replace all adoodleydo.dev with https://127.0.0.1
    for file in $(tree -fi -I 'public|env|Hello World' -P '*.html|*.js|views.py|*.php|*.conf' --noreport --prune \
            | grep -P '\.html$|\.js$|\.py$|\.php$|\.conf$')
    do
        sed -i 's/adoodleydo.dev/127.0.0.1/g' $file
    done

    # update settings.py
    sed -i "s/config_name = '..\/config\/prod.toml'/config_name = '..\/config\/debug.toml'/g;" './um/proj/settings.py'

    #sed -i "s/^if sys.executable != INTERP/#if sys.executable != INTERP/g" "./um/wsgi.py" # only needed for passenger

    sed -i "s/apache2\/sslfullchain/ssl\/certs\/ssl-cert-snakeoil/g;
        s/apache2\/sslkey/ssl\/private\/ssl-cert-snakeoil/g;" "./config/999-main.conf"
    sed -i "s/apache2\/sslfullchain/ssl\/certs\/ssl-cert-snakeoil/g;
        s/apache2\/sslkey/ssl\/private\/ssl-cert-snakeoil/g;
        s/VirtualHost \*:443/VirtualHost \*:444/g;" "./config/001-um.conf"

    sed -i "s/^\Redirect/\t#Redirect/g;" "./config/000-default.conf"
fi

# tell server to update apps
# touch 'um/tmp/restart.txt'

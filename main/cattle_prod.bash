#!/bin/bash

TO_PROD=${1:-1}

if [ $TO_PROD != 0 ]
then
    # replace all http://127.0.0.1:81 with um.adoodleydo.dev
    REP_STR='s/http:\/\/127.0.0.1:81/https:\/\/um.adoodleydo.dev/g'
    for file in $(tree -fi -P *.js --noreport js | grep -P '^.*.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'index.html'
else
    # replace all http://127.0.0.1:81 with um.adoodleydo.dev
    REP_STR='s/https:\/\/um.adoodleydo.dev/http:\/\/127.0.0.1:81/g'
    for file in $(tree -fi -P *.js --noreport js | grep -P '^.*.js$')
    do
        sed -i $REP_STR $file
    done
    sed -i $REP_STR 'index.html'
fi

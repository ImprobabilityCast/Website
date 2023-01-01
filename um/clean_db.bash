#!/bin/bash

cd $(dirname $0)
source env/bin/activate

python3 manage.py clearsessions
python3 manage.py clean_accounts

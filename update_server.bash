#!/bin/bash

REPO=/home/name/Website
cd $REPO

git pull

source ./update_server_additions.bash

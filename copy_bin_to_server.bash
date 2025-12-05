#!/bin/bash
#
# Usage: $ copy_bin_to_server.bash remote_username key_file_name

REPO=/home/name/Website
SCP_OPTIONS="-P 23 -i $2"
SSH_OPTIONS="-p 23 -i $2"
HOSTY=$1@adoodleyo.dev

echo $REPO
echo $OPTIONS
echo $HOSTY


FILE_PATH=/config/prod.toml
scp $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH $OPTIONS
FILE_PATH=/config/mood_db_php_user_pwd.txt
scp $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH $OPTIONS
FILE_PATH=/update_server.bash
scp $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH $OPTIONS
FILE_PATH=/main/clueless/pkg/
scp $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH $OPTIONS -r


ssh $SSH_OPTIONS $HOSTY $REPO/update_server.bash

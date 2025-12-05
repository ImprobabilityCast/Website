#!/bin/bash
#
# Usage: $ copy_bin_to_server.bash remote_username key_file_name

REPO=/home/name/Website
SCP_OPTIONS="-P 23 -i $2"
SSH_OPTIONS="-p 23 -i $2"
HOSTY=$1@adoodleyo.dev


# FILE_PATH=/config/prod.toml
# scp $SCP_OPTIONS $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH
# FILE_PATH=/config/mood_db_php_user_pwd.txt
# scp $SCP_OPTIONS $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH
FILE_PATH=/update_server.bash
scp $SCP_OPTIONS $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH
FILE_PATH=/main/clueless/pkg/
ssh $SSH_OPTIONS $HOSTY "mkdir -p $REPO$FILE_PATH"
scp $SCP_OPTIONS -r $REPO$FILE_PATH $HOSTY:$REPO$FILE_PATH


ssh $SSH_OPTIONS $HOSTY sudo $REPO/update_server.bash

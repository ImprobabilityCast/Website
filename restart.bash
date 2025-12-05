#!/bin/bash

# force apache to stop completely
systemctl stop apache2
systemctl start apache2
# force django to load
wget https://127.0.0.1:444 --no-check-certificate --spider

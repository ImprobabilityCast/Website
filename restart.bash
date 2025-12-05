#!/bin/bash

# force apache to stop completely
systemctl stop apache2
systemctl start apache2
# force django to load
wget https://um.adoodleydo.dev --no-check-certificate --spider

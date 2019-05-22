#!/bin/sh
cd /usr/src/app
# expect visible.db in /usr/src/app
echo "Scraper started"

while true; do
  echo "Running import"
  node remote-import.js
  echo "Running test-homeservers"
  node test-homeservers.js
  echo "Running parse"
  node parse.js
  echo "Running output-html"
  node output-html.js index-template.html index.html
  echo "using sftp"

  sftp -i /usr/src/app/ssh-key/ssh-key index.html $SFTP_TARGET

  sleep 30
done

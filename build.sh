#!/bin/sh

curr_dir=$(cd `dirname $0`; pwd)
cd $curr_dir

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 13

npm run build:cdn_users
npm run build:cdn_admin
npm run build:dns_users
npm run build:dns_admin
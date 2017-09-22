#!/bin/bash

set -e

# Start in website/ even if run from root directory
cd "$(dirname "$0")"

cd ../../relay-gh-pages
# git checkout -- .
# git clean -dfx
# git fetch
# git rebase
rm -Rf *
cd ../relay/website
node server/generate.js
cp -R build/relay/* ../../relay-gh-pages/
rm -Rf build/
cd ../../relay-gh-pages
# git add --all
# git commit -m "update website"
# git push
# cd ../relay/website

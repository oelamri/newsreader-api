#!/bin/bash

if [ "$RAILS_DEPLOYMENT" == "true" ]; then
  bundle exec rails server -p $PORT
else
  node node/index.js
fi

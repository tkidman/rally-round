#!/usr/bin/env bash

echo "running all clubs"
CLUB=jrc timeout 120s node runner.js
CLUB=jrc-themed timeout 120s node runner.js
CLUB=jrc-historic timeout 120s node runner.js
CLUB=rsc timeout 120s node runner.js
echo "complete"

#!/bin/bash

browserify -t [ babelify --presets [ es2015 react ] ] components/index.jsx -o bundlejs/index.js
browserify -t [ babelify --presets [ es2015 react ] ] components/plannedNetwork.jsx -o bundlejs/plannedNetwork.js
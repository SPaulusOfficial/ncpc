# gulp-atom-downloader

## Usage

1. Add `gulp-atom-downloader` to `devDependencies`
1. Download Atom, get the executable path, and launch Atom:

        var atomPaths = require('gulp-atom-downloader');
    
        atomPaths().then(function(atomPaths) {
          return require('child_process').spawn(atomPaths.atom);
        });

The `atomExePath()` function takes an optional config parameter object.  Defaults:

    config.platform = process.platform;
    config.atomDir = './.atom';
    config.binDir = path.join(config.atomDir, 'bin');

## Build Status

[![Linux Build](https://travis-ci.org/jamesward/gulp-atom-downloader.svg?branch=master)](https://travis-ci.org/jamesward/gulp-atom-downloader)
[![Windows Build](https://ci.appveyor.com/api/projects/status/29om8w658crv5gpi?svg=true)](https://ci.appveyor.com/project/jamesward/gulp-atom-downloader)

## Dev Info

Run the tests:

    ./gulp test

Release:

    git tag v0.0.2
    git push --tags
    npm publish
    # bump the version in `package.json` and `README.md`

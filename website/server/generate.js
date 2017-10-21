/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const buildGraphQLSpec = require('./buildGraphQLSpec');
const fs = require('fs-extra');
const glob = require('glob');
const mkdirp = require('mkdirp');
const request = require('request');
const server = require('./server.js');

// Sadly, our setup fatals when doing multiple concurrent requests
// I don't have the time to dig into why, it's easier to just serialize
// requests.
const queue = (function() {
  let is_executing = false;
  const queue = [];
  function push(fn) {
    queue.push(fn);
    execute();
  }
  function execute() {
    if (is_executing) {
      return;
    }
    if (queue.length === 0) {
      return;
    }
    const fn = queue.shift();
    is_executing = true;
    fn(function() {
      is_executing = false;
      execute();
    });
  }
  return {push: push};
})();

buildGraphQLSpec('build');

glob('src/**/*.*', function(er, files) {
  files.forEach(function(file) {
    let targetFile = file.replace(/^src/, 'build');

    if (file.match(/\.js$/)) {
      targetFile = targetFile.replace(/\.js$/, '.html');
      queue.push(function(cb) {
        request(
          'http://localhost:8079/' + targetFile.replace(/^build\//, ''),
          function(error, response, body) {
            mkdirp.sync(targetFile.replace(new RegExp('/[^/]*$'), ''));
            fs.writeFileSync(targetFile, body);
            cb();
          }
        );
      });
    } else {
      queue.push(function(cb) {
        mkdirp.sync(targetFile.replace(new RegExp('/[^/]*$'), ''));
        fs.copy(file, targetFile, cb);
      });
    }
  });

  queue.push(function(cb) {
    server.close();
    console.log('It is live at: http://facebook.github.io/relay/');
    cb();
  });
});

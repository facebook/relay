/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var buildGraphQLSpec = require('./buildGraphQLSpec');
var request = require('request');
var glob = require('glob');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var server = require('./server.js');
var exec = require('child_process').execSync;

// Sadly, our setup fatals when doing multiple concurrent requests
// I don't have the time to dig into why, it's easier to just serialize
// requests.
var queue = (function() {
  var is_executing = false;
  var queue = [];
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
    var fn = queue.shift();
    is_executing = true;
    fn(function() {
      is_executing = false;
      execute()
    });
  }
  return {push: push};
})();

exec('npm run build', {
  cwd: path.resolve(__dirname, '../../website-prototyping-tools'),
  stdio: 'inherit',
});

buildGraphQLSpec('build');

glob('src/**/*.*', function(er, files) {
  var count = files.length;

  files.forEach(function(file) {
    var targetFile = file.replace(/^src/, 'build');

    if (file.match(/\.js$/)) {
      targetFile = targetFile.replace(/\.js$/, '.html');
      queue.push(function(cb) {
        request('http://localhost:8079/' + targetFile.replace(/^build\//, ''), function(error, response, body) {
          mkdirp.sync(targetFile.replace(new RegExp('/[^/]*$'), ''));
          fs.writeFileSync(targetFile, body);
          cb();
        });
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
    console.log('It is live at: http://facebook.github.io/relay/')
    cb();
  });
});

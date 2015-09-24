/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

"use strict";

var compression = require('compression');
var connect = require('connect');
var convert = require('./convert.js');
var errorHandler = require('errorhandler');
var http = require('http');
var morgan = require('morgan');
var optimist = require('optimist');
var path = require('path');
var reactMiddleware = require('react-page-middleware');
var serveStatic = require('serve-static');
var spawn = require('child_process').spawn;

var argv = optimist.argv;

var PROJECT_ROOT = path.resolve(__dirname, '..');
var FILE_SERVE_ROOT = path.join(PROJECT_ROOT, 'src');

var port = argv.port;
if (argv.$0.indexOf('./server/generate.js') !== -1) {
  // Using a different port so that you can publish the website
  // and keeping the server up at the same time.
  port = 8079;
} else {
  // Build (and watch) the prototyping tools
  spawn('npm', ['start'], {
    cwd: path.resolve(__dirname, '../../website-prototyping-tools'),
    stdio: 'inherit'
  });
}

var buildOptions = {
  projectRoot: PROJECT_ROOT,
  pageRouteRoot: FILE_SERVE_ROOT,
  useBrowserBuiltins: false,
  logTiming: true,
  useSourceMaps: true,
  ignorePaths: function(p) {
    return p.indexOf('__tests__') !== -1;
  },
  serverRender: true,
  dev: argv.dev !== 'false',
  static: true
};

var app = connect()
  .use(serveStatic(FILE_SERVE_ROOT))
  .use(function(req, res, next) {
    // convert all the md files on every request. This is not optimal
    // but fast enough that we don't really need to care right now.
    convert();
    next();
  })
  .use(reactMiddleware.provide(buildOptions))
  .use(morgan('combined'))
  .use(compression())
  .use(errorHandler());

var portToUse = port || 8080;
var server = http.createServer(app);
server.listen(portToUse);
console.log('Open http://localhost:' + portToUse + '/relay/index.html');
module.exports = server;

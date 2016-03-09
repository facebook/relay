/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

"use strict";

const compression = require('compression');
const connect = require('connect');
const convert = require('./convert.js');
const errorHandler = require('errorhandler');
const http = require('http');
const morgan = require('morgan');
const optimist = require('optimist');
const path = require('path');
const reactMiddleware = require('react-page-middleware');
const serveStatic = require('serve-static');
const spawn = require('child_process').spawn;

const argv = optimist.argv;

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FILE_SERVE_ROOT = path.join(PROJECT_ROOT, 'src');

let port = argv.port;
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

const buildOptions = {
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

const app = connect()
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

const portToUse = port || 8080;
const server = http.createServer(app);
server.listen(portToUse);
console.log('Open http://localhost:' + portToUse + '/relay/index.html');
module.exports = server;

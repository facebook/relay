/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const babel = require('gulp-babel');
const babelPluginDEV = require('fbjs-scripts/babel/dev-expression');
const babelPluginModules = require('fbjs-scripts/babel/rewrite-modules');
const babelPluginAutoImporter = require('fbjs-scripts/babel/auto-importer');
const del = require('del');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const header = require('gulp-header');
const objectAssign = require('object-assign');
const runSequence = require('run-sequence');
const webpackStream = require('webpack-stream');

const DEVELOPMENT_HEADER = [
  '/**',
  ' * Relay v<%= version %>',
  ' */',
].join('\n') + '\n';
const PRODUCTION_HEADER = [
  '/**',
  ' * Relay v<%= version %>',
  ' *',
  ' * Copyright (c) 2013-present, Facebook, Inc.',
  ' * All rights reserved.',
  ' *',
  ' * This source code is licensed under the BSD-style license found in the',
  ' * LICENSE file in the root directory of this source tree. An additional grant',
  ' * of patent rights can be found in the PATENTS file in the same directory.',
  ' *',
  ' */',
].join('\n') + '\n';

const babelOpts = {
  nonStandard: true,
  loose: [
    'es6.classes',
  ],
  stage: 1,
  optional: ['runtime'],
  blacklist: ['validation.react'],
  plugins: [
    babelPluginDEV,
    {
      position: 'before',
      transformer: babelPluginAutoImporter,
    },
    {
      position: 'before',
      transformer: babelPluginModules,
    },
  ],
  _moduleMap: objectAssign({}, require('fbjs/module-map'), {
    'React': 'react',
    'ReactDOM': 'react-dom',
    'ReactNative': 'react-native',
    'StaticContainer.react': 'react-static-container',
  }),
};

const buildDist = function(opts) {
  const webpackOpts = {
    debug: opts.debug,
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    output: {
      filename: opts.output,
      libraryTarget: 'umd',
      library: 'Relay',
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production'
        ),
      }),
      new webpackStream.webpack.optimize.OccurenceOrderPlugin(),
      new webpackStream.webpack.optimize.DedupePlugin(),
    ],
  };
  if (!opts.debug) {
    webpackOpts.plugins.push(
      new webpackStream.webpack.optimize.UglifyJsPlugin({
        compress: {
          hoist_vars: true,
          screw_ie8: true,
          warnings: false,
        },
      })
    );
  }
  return webpackStream(webpackOpts, null, function(err, stats) {
    if (err) {
      throw new gulpUtil.PluginError('webpack', err);
    }
    if (stats.compilation.errors.length) {
      throw new gulpUtil.PluginError('webpack', stats.toString());
    }
  });
};

const paths = {
  dist: 'dist',
  entry: 'lib/Relay.js',
  lib: 'lib',
  src: [
    '*src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js',
    '!src/flow/*.js',
  ],
};

gulp.task('clean', function(cb) {
  del([paths.dist, paths.lib], cb);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('dist', ['modules'], function() {
  const distOpts = {
    debug: true,
    output: 'relay.js',
  };
  return gulp.src(paths.entry)
    .pipe(buildDist(distOpts))
    .pipe(derequire())
    .pipe(header(DEVELOPMENT_HEADER, {
      version: process.env.npm_package_version,
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist:min', ['modules'], function() {
  const distOpts = {
    debug: false,
    output: 'relay.min.js',
  };
  return gulp.src(paths.entry)
    .pipe(buildDist(distOpts))
    .pipe(header(PRODUCTION_HEADER, {
      version: process.env.npm_package_version,
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('website:check-version', function(cb) {
  const version = require('./package').version;
  const websiteVersion = require('./website/core/SiteData').version;
  if (websiteVersion !== version) {
    return cb(
      new Error('Website version does not match package.json. Saw ' + websiteVersion + ' but expected ' + version)
    );
  }
  cb();
});

gulp.task('watch', function() {
  gulp.watch(paths.src, ['modules']);
});

gulp.task('default', function(cb) {
  runSequence('clean', 'website:check-version', ['dist', 'dist:min'], cb);
});

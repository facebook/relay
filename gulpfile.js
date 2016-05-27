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
const babelOptions = require('./scripts/getBabelOptions')({
  moduleMap: {
    'babel-runtime/helpers/extends': 'babel-runtime/helpers/extends',
    'babel-runtime/core-js/promise': 'fbjs/lib/Promise',
    'babel-runtime/core-js/json/stringify': 'babel-runtime/core-js/json/stringify',
    'babel-runtime/helpers/classCallCheck': 'babel-runtime/helpers/classCallCheck',
    'babel-runtime/helpers/possibleConstructorReturn': 'babel-runtime/helpers/possibleConstructorReturn',
    'babel-runtime/helpers/inherits': 'babel-runtime/helpers/inherits',
    'babel-runtime/core-js/object/assign': 'babel-runtime/core-js/object/assign',
    'babel-runtime/core-js/object/keys': 'babel-runtime/core-js/object/keys',
    'babel-runtime/core-js/array/from': 'babel-runtime/core-js/array/from',
    'babel-runtime/core-js/object/freeze': 'babel-runtime/core-js/object/freeze',
    'babel-runtime/helpers/defineProperty': 'babel-runtime/helpers/defineProperty',
    'React': 'react',
    'ReactDOM': 'react-dom',
    'ReactNative': 'react-native',
    'StaticContainer.react': 'react-static-container',
  },
  plugins: [
    'transform-runtime',
  ],
});
const del = require('del');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const header = require('gulp-header');
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
  ],
};

gulp.task('clean', function(cb) {
  del([paths.dist, paths.lib], cb);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOptions))
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

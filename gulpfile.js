/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @noformat
 */

'use strict';

const babel = require('gulp-babel');
const babelOptions = require('./scripts/getBabelOptions')({
  ast: false,
  moduleMap: {
    '@babel/generator': '@babel/generator',
    '@babel/types': '@babel/types',
    'babel-core': 'babel-core',
    'babel-generator': 'babel-generator',
    'babel-generator/lib/printer': 'babel-generator/lib/printer',
    'babel-polyfill': 'babel-polyfill',
    'babel-runtime/helpers/asyncToGenerator': 'babel-runtime/helpers/asyncToGenerator',
    'babel-runtime/helpers/classCallCheck': 'babel-runtime/helpers/classCallCheck',
    'babel-runtime/helpers/defineProperty': 'babel-runtime/helpers/defineProperty',
    'babel-runtime/helpers/extends': 'babel-runtime/helpers/extends',
    'babel-runtime/helpers/inherits': 'babel-runtime/helpers/inherits',
    'babel-runtime/helpers/objectWithoutProperties': 'babel-runtime/helpers/objectWithoutProperties',
    'babel-runtime/helpers/possibleConstructorReturn': 'babel-runtime/helpers/possibleConstructorReturn',
    'babel-runtime/helpers/toConsumableArray': 'babel-runtime/helpers/toConsumableArray',
    'babel-traverse': 'babel-traverse',
    'babel-types': 'babel-types',
    'babylon': 'babylon',
    chalk: 'chalk',
    child_process: 'child_process',
    crypto: 'crypto',
    'fast-glob': 'fast-glob',
    'fb-watchman': 'fb-watchman',
    fs: 'fs',
    graphql: 'graphql',
    'graphql-compiler': 'graphql-compiler',
    immutable: 'immutable',
    iterall: 'iterall',
    net: 'net',
    os: 'os',
    path: 'path',
    process: 'process',
    'prop-types': 'prop-types',
    React: 'react',
    'react-lifecycles-compat': 'react-lifecycles-compat',
    'relay-compiler': 'relay-compiler',
    ReactDOM: 'react-dom',
    ReactNative: 'react-native',
    RelayRuntime: 'relay-runtime',
    signedsource: 'signedsource',
    util: 'util',
    yargs: 'yargs',
  },
  plugins: [
    'transform-flow-strip-types',
    ['transform-runtime', {polyfill: false}],
  ],
  postPlugins: [
    'transform-async-to-generator',
    'transform-es2015-modules-commonjs',
  ],
  sourceType: 'script',
});
const del = require('del');
const derequire = require('gulp-derequire');
const es = require('event-stream');
const flatten = require('gulp-flatten');
const fs = require('fs');
const gulp = require('gulp');
const chmod = require('gulp-chmod');
const gulpUtil = require('gulp-util');
const header = require('gulp-header');
const path = require('path');
const runSequence = require('run-sequence');
const webpackStream = require('webpack-stream');

const SCRIPT_HASHBANG = '#!/usr/bin/env node\n';
const DEVELOPMENT_HEADER =
  ['/**', ' * Relay v' + process.env.npm_package_version, ' */'].join('\n') +
  '\n';
const PRODUCTION_HEADER =
  [
    '/**',
    ' * Relay v' + process.env.npm_package_version,
    ' *',
    ' * Copyright (c) 2013-present, Facebook, Inc.',
    ' *',
    ' * This source code is licensed under the MIT license found in the',
    ' * LICENSE file in the root directory of this source tree.',
    ' */',
  ].join('\n') + '\n';

const buildDist = function(filename, opts, isProduction) {
  const webpackOpts = {
    debug: !isProduction,
    externals: [/^[-/a-zA-Z0-9]+$/],
    target: opts.target,
    node: {
      fs: 'empty',
      net: 'empty',
      path: 'empty',
      child_process: 'empty',
      util: 'empty',
    },
    output: {
      filename: filename,
      libraryTarget: opts.libraryTarget,
      library: opts.libraryName,
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
      }),
      new webpackStream.webpack.optimize.OccurenceOrderPlugin(),
      new webpackStream.webpack.optimize.DedupePlugin(),
    ],
  };
  if (isProduction && !opts.noMinify) {
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

// Paths from package-root
const PACKAGES = 'packages';
const DIST = 'dist';

const builds = [
  {
    package: 'babel-plugin-relay',
    exports: {
      index: 'BabelPluginRelay.js',
    },
    bundles: [
      {
        entry: 'BabelPluginRelay.js',
        output: 'babel-plugin-relay',
        libraryName: 'BabelPluginRelay',
        libraryTarget: 'commonjs2',
        target: 'node',
      },
    ],
  },
  {
    package: 'react-relay',
    exports: {
      classic: 'ReactRelayClassicExports.js',
      compat: 'ReactRelayCompatPublic.js',
      index: 'ReactRelayPublic.js',
    },
    bundles: [
      {
        entry: 'ReactRelayClassicExports.js',
        output: 'react-relay-classic',
        libraryName: 'ReactRelayClassic',
        libraryTarget: 'umd',
      },
      {
        entry: 'ReactRelayCompatPublic.js',
        output: 'react-relay-compat',
        libraryName: 'ReactRelayCompat',
        libraryTarget: 'umd',
      },
      {
        entry: 'ReactRelayPublic.js',
        output: 'react-relay',
        libraryName: 'ReactRelay',
        libraryTarget: 'umd',
      },
    ],
  },
  {
    package: 'relay-compiler',
    exports: {
      index: 'RelayCompilerPublic.js',
    },
    bundles: [
      {
        entry: 'RelayCompilerPublic.js',
        output: 'relay-compiler',
        libraryName: 'RelayCompiler',
        libraryTarget: 'commonjs2',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
    bins: [
      {
        entry: 'RelayCompilerBin.js',
        output: 'relay-compiler',
        libraryTarget: 'commonjs2',
        target: 'node',
      },
    ],
  },
  {
    package: 'graphql-compiler',
    exports: {
      index: 'GraphQLCompilerPublic.js',
    },
    bundles: [
      {
        entry: 'GraphQLCompilerPublic.js',
        output: 'graphql-compiler',
        libraryName: 'GraphQLCompiler',
        libraryTarget: 'commonjs2',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
  {
    package: 'relay-runtime',
    exports: {
      index: 'RelayRuntime.js',
    },
    bundles: [
      {
        entry: 'RelayRuntime.js',
        output: 'relay-runtime',
        libraryName: 'RelayRuntime',
        libraryTarget: 'umd',
      },
    ],
  },
  {
    package: 'relay-test-utils',
    exports: {
      index: 'RelayTestUtilsPublic.js',
    },
    bundles: [
      {
        entry: 'RelayTestUtilsPublic.js',
        output: 'relay-test-utils',
        libraryName: 'RelayTestUtils',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
];

gulp.task('clean', function() {
  return del(DIST);
});

gulp.task('modules', function() {
  return es.merge(
    builds.map(build =>
      gulp
        .src([
          '*' + PACKAGES + '/' + build.package + '/**/*.js',
          '!' + PACKAGES + '/**/__tests__/**/*.js',
          '!' + PACKAGES + '/**/__mocks__/**/*.js',
        ])
        .pipe(babel(babelOptions))
        .pipe(flatten())
        .pipe(gulp.dest(path.join(DIST, build.package, 'lib')))
    )
  );
});

gulp.task('copy-files', function() {
  return es.merge(
    builds.map(build =>
      es.merge([
        gulp
          .src([
            'LICENSE',
            '*' + PACKAGES + '/' + build.package + '/*',
            '!' + PACKAGES + '/' + build.package + '/*.graphql',
            '!' + PACKAGES + '/' + build.package + '/**/*.js',
          ])
          .pipe(flatten())
          .pipe(gulp.dest(path.join(DIST, build.package))),
        gulp // Move *.graphql files directly to lib without going through babel
          .src(['*' + PACKAGES + '/' + build.package + '/*.graphql'])
          .pipe(flatten())
          .pipe(gulp.dest(path.join(DIST, build.package, 'lib'))),
      ])
    )
  );
});

gulp.task('exports', ['copy-files', 'modules'], function() {
  builds.map(build =>
    Object.keys(build.exports).map(exportName =>
      fs.writeFileSync(
        path.join(DIST, build.package, exportName + '.js'),
        PRODUCTION_HEADER +
          `\nmodule.exports = require('./lib/${build.exports[exportName]}');`
      )
    )
  );
});

gulp.task('bins', ['modules'], function() {
  const buildsWithBins = builds.filter(build => build.bins);
  return es.merge(
    buildsWithBins.map(build =>
      es.merge(
        build.bins.map(bin =>
          gulp
            .src(path.join(DIST, build.package, 'lib', bin.entry))
            .pipe(buildDist(bin.output, bin, /* isProduction */ false))
            .pipe(header(SCRIPT_HASHBANG + PRODUCTION_HEADER))
            .pipe(chmod(0o755))
            .pipe(gulp.dest(path.join(DIST, build.package, 'bin')))
        )
      )
    )
  );
});

gulp.task('bundles', ['modules'], function() {
  return es.merge(
    builds.map(build =>
      es.merge(
        build.bundles.map(bundle =>
          gulp
            .src(path.join(DIST, build.package, 'lib', bundle.entry))
            .pipe(
              buildDist(
                bundle.output + '.js',
                bundle,
                /* isProduction */ false
              )
            )
            .pipe(derequire())
            .pipe(header(DEVELOPMENT_HEADER))
            .pipe(gulp.dest(path.join(DIST, build.package)))
        )
      )
    )
  );
});

gulp.task('bundles:min', ['modules'], function() {
  return es.merge(
    builds.map(build =>
      es.merge(
        build.bundles.map(bundle =>
          gulp
            .src(path.join(DIST, build.package, 'lib', bundle.entry))
            .pipe(
              buildDist(
                bundle.output + '.min.js',
                bundle,
                /* isProduction */ true
              )
            )
            .pipe(header(PRODUCTION_HEADER))
            .pipe(gulp.dest(path.join(DIST, build.package)))
        )
      )
    )
  );
});

gulp.task('watch', function() {
  gulp.watch(PACKAGES + '/**/*.js', ['exports', 'bundles']);
});

gulp.task('default', function(cb) {
  runSequence('clean', ['exports', 'bins', 'bundles', 'bundles:min'], cb);
});

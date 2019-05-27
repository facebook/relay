/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 */

'use strict';

const babel = require('gulp-babel');
const babelOptions = require('./scripts/getBabelOptions')({
  ast: false,
  moduleMap: {
    '@babel/core': '@babel/core',
    '@babel/parser': '@babel/parser',
    '@babel/polyfill': '@babel/polyfill',
    '@babel/traverse': '@babel/traverse',
    '@babel/types': '@babel/types',
    '@babel/plugin-proposal-nullish-coalescing-operator':
      '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining':
      '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-runtime': '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-flow-strip-types':
      '@babel/plugin-transform-flow-strip-types',
    '@babel/generator': '@babel/generator',
    '@babel/generator/lib/printer': '@babel/generator/lib/printer',
    '@babel/runtime/helpers/assertThisInitialized':
      '@babel/runtime/helpers/assertThisInitialized',
    '@babel/runtime/helpers/asyncToGenerator':
      '@babel/runtime/helpers/asyncToGenerator',
    '@babel/runtime/helpers/classCallCheck':
      '@babel/runtime/helpers/classCallCheck',
    '@babel/runtime/helpers/defineProperty':
      '@babel/runtime/helpers/defineProperty',
    '@babel/runtime/helpers/extends': '@babel/runtime/helpers/extends',
    '@babel/runtime/helpers/inherits': '@babel/runtime/helpers/inherits',
    '@babel/runtime/helpers/inheritsLoose':
      '@babel/runtime/helpers/inheritsLoose',
    '@babel/runtime/helpers/interopRequireDefault':
      '@babel/runtime/helpers/interopRequireDefault',
    '@babel/runtime/helpers/objectSpread':
      '@babel/runtime/helpers/objectSpread',
    '@babel/runtime/helpers/objectWithoutProperties':
      '@babel/runtime/helpers/objectWithoutProperties',
    '@babel/runtime/helpers/objectWithoutPropertiesLoose':
      '@babel/runtime/helpers/objectWithoutPropertiesLoose',
    '@babel/runtime/helpers/possibleConstructorReturn':
      '@babel/runtime/helpers/possibleConstructorReturn',
    '@babel/runtime/helpers/toConsumableArray':
      '@babel/runtime/helpers/toConsumableArray',
    'babel-plugin-macros': 'babel-plugin-macros',
    chalk: 'chalk',
    child_process: 'child_process',
    crypto: 'crypto',
    'fast-glob': 'fast-glob',
    'fb-watchman': 'fb-watchman',
    fs: 'fs',
    graphql: 'graphql',
    immutable: 'immutable',
    net: 'net',
    os: 'os',
    path: 'path',
    process: 'process',
    React: 'react',
    'react-lifecycles-compat': 'react-lifecycles-compat',
    'relay-compiler': 'relay-compiler',
    RelayRuntime: 'relay-runtime',
    'relay-runtime': 'relay-runtime',
    'relay-test-utils': 'relay-test-utils',
    signedsource: 'signedsource',
    util: 'util',
    yargs: 'yargs',
  },
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
  ],
  postPlugins: [
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-modules-commonjs',
  ],
  sourceType: 'script',
});
const del = require('del');
const flatten = require('gulp-flatten');
const fs = require('fs');
const gulp = require('gulp');
const chmod = require('gulp-chmod');
const gulpUtil = require('gulp-util');
const header = require('gulp-header');
const path = require('path');
const webpack = require('webpack');
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
      new webpackStream.webpack.optimize.OccurrenceOrderPlugin(),
    ],
  };
  if (isProduction && !opts.noMinify) {
    // See more chunks configuration here: https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
    webpackOpts.optimization = {
      minimize: true,
    };
  }
  return webpackStream(webpackOpts, webpack, function(err, stats) {
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
      macro: 'BabelPluginRelay.macro.js',
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
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'react-relay',
        libraryName: 'ReactRelay',
        libraryTarget: 'umd',
      },
    ],
  },
  {
    package: 'relay-compiler',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
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
    package: 'relay-runtime',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'relay-runtime',
        libraryName: 'RelayRuntime',
        libraryTarget: 'umd',
      },
    ],
  },
  {
    package: 'relay-test-utils',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'relay-test-utils',
        libraryName: 'RelayTestUtils',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
];

function clean() {
  return del(DIST);
}

const modules = gulp.parallel(
  ...builds.map(
    build =>
      function modulesTask() {
        return gulp
          .src(
            [
              '**/*.js',
              '!**/__tests__/**',
              '!**/__flowtests__/**',
              '!**/__mocks__/**',
              '!**/node_modules/**',
            ],
            {
              cwd: path.join(PACKAGES, build.package),
            }
          )
          .pipe(babel(babelOptions))
          .pipe(flatten())
          .pipe(gulp.dest(path.join(DIST, build.package, 'lib')));
      }
  )
);

const copyFilesTasks = [];
builds.forEach(build => {
  copyFilesTasks.push(
    function copyLicense() {
      return gulp
        .src(['LICENSE'])
        .pipe(gulp.dest(path.join(DIST, build.package)));
    },
    function copyTestschema() {
      return gulp
        .src(['*.graphql'], {
          cwd: path.join(PACKAGES, build.package),
        })
        .pipe(gulp.dest(path.join(DIST, build.package, 'lib')));
    },
    function copyPackageJSON() {
      return gulp
        .src(['package.json'], {
          cwd: path.join(PACKAGES, build.package),
        })
        .pipe(gulp.dest(path.join(DIST, build.package)));
    }
  );
});
const copyFiles = gulp.parallel(copyFilesTasks);

const exportsFiles = gulp.series(
  copyFiles,
  modules,
  gulp.parallel(
    ...builds.map(
      build =>
        function exportsFilesTask(done) {
          Object.keys(build.exports).map(exportName =>
            fs.writeFileSync(
              path.join(DIST, build.package, exportName + '.js'),
              PRODUCTION_HEADER +
                `\nmodule.exports = require('./lib/${
                  build.exports[exportName]
                }');\n`
            )
          );
          done();
        }
    )
  )
);

const binsTasks = [];
builds.forEach(build => {
  if (build.bins) {
    build.bins.forEach(bin => {
      binsTasks.push(function binsTask() {
        return gulp
          .src(path.join(DIST, build.package, 'lib', bin.entry))
          .pipe(buildDist(bin.output, bin, /* isProduction */ false))
          .pipe(header(SCRIPT_HASHBANG + PRODUCTION_HEADER))
          .pipe(chmod(0o755))
          .pipe(gulp.dest(path.join(DIST, build.package, 'bin')));
      });
    });
  }
});
const bins = gulp.series(binsTasks);

const bundlesTasks = [];
builds.forEach(build => {
  build.bundles.forEach(bundle => {
    bundlesTasks.push(function bundleTask() {
      return gulp
        .src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(
          buildDist(bundle.output + '.js', bundle, /* isProduction */ false)
        )
        .pipe(header(DEVELOPMENT_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)));
    });
  });
});
const bundles = gulp.series(bundlesTasks);

const bundlesMinTasks = [];
builds.forEach(build => {
  build.bundles.forEach(bundle => {
    bundlesMinTasks.push(function bundlesMinTask() {
      return gulp
        .src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(
          buildDist(bundle.output + '.min.js', bundle, /* isProduction */ true)
        )
        .pipe(header(PRODUCTION_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)));
    });
  });
});
const bundlesMin = gulp.series(bundlesMinTasks);

const dist = gulp.series(exportsFiles, bins, bundles, bundlesMin);

exports.clean = clean;
exports.default = gulp.series(clean, dist);

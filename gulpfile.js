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
    'babel-runtime/core-js/object/get-own-property-names': 'babel-runtime/core-js/object/get-own-property-names',
    'babel-runtime/core-js/array/from': 'babel-runtime/core-js/array/from',
    'babel-runtime/core-js/object/freeze': 'babel-runtime/core-js/object/freeze',
    'babel-runtime/core-js/object/is-frozen': 'babel-runtime/core-js/object/is-frozen',
    'babel-runtime/core-js/object/values': 'babel-runtime/core-js/object/values',
    'babel-runtime/core-js/set': 'babel-runtime/core-js/set',
    'babel-runtime/core-js/map': 'babel-runtime/core-js/map',
    'babel-runtime/core-js/weak-map': 'babel-runtime/core-js/weak-map',
    'babel-runtime/helpers/defineProperty': 'babel-runtime/helpers/defineProperty',
    'babel-runtime/helpers/asyncToGenerator': 'babel-runtime/helpers/asyncToGenerator',
    'React': 'react',
    'ReactDOM': 'react-dom',
    'ReactNative': 'react-native',
    'RelayRuntime': 'relay-runtime',
    'StaticContainer.react': 'react-static-container',
    'babel-generator': 'babel-generator',
    'babel-traverse': 'babel-traverse',
    'babel-types': 'babel-types',
    'babel-core': 'babel-core',
    'babylon': 'babylon',
    'fb-watchman': 'fb-watchman',
    'graphql': 'graphql',
    'graphql/error': 'graphql/error',
    'graphql/language': 'graphql/language',
    'graphql/language/parser': 'graphql/language/parser',
    'graphql/language/source': 'graphql/language/source',
    'graphql/type': 'graphql/type',
    'graphql/type/definition': 'graphql/type/definition',
    'graphql/type/directives': 'graphql/type/directives',
    'graphql/type/introspection': 'graphql/type/introspection',
    'graphql/type/scalars': 'graphql/type/scalars',
    'graphql/utilities': 'graphql/utilities',
    'graphql/utilities/buildASTSchema': 'graphql/utilities/buildASTSchema',
    'graphql/utilities/buildClientSchema': 'graphql/utilities/buildClientSchema',
    'graphql/validation': 'graphql/validation',
    'graphql/validation/rules/ArgumentsOfCorrectType': 'graphql/validation/rules/ArgumentsOfCorrectType',
    'graphql/validation/rules/DefaultValuesOfCorrectType': 'graphql/validation/rules/DefaultValuesOfCorrectType',
    'graphql/validation/rules/FieldsOnCorrectType': 'graphql/validation/rules/FieldsOnCorrectType',
    'graphql/validation/rules/FragmentsOnCompositeTypes': 'graphql/validation/rules/FragmentsOnCompositeTypes',
    'graphql/validation/rules/KnownArgumentNames': 'graphql/validation/rules/KnownArgumentNames',
    'graphql/validation/rules/KnownDirectives': 'graphql/validation/rules/KnownDirectives',
    'graphql/validation/rules/KnownFragmentNames': 'graphql/validation/rules/KnownFragmentNames',
    'graphql/validation/rules/KnownTypeNames': 'graphql/validation/rules/KnownTypeNames',
    'graphql/validation/rules/LoneAnonymousOperation': 'graphql/validation/rules/LoneAnonymousOperation',
    'graphql/validation/rules/NoFragmentCycles': 'graphql/validation/rules/NoFragmentCycles',
    'graphql/validation/rules/NoUndefinedVariables': 'graphql/validation/rules/NoUndefinedVariables',
    'graphql/validation/rules/NoUnusedFragments': 'graphql/validation/rules/NoUnusedFragments',
    'graphql/validation/rules/NoUnusedVariables': 'graphql/validation/rules/NoUnusedVariables',
    'graphql/validation/rules/OverlappingFieldsCanBeMerged': 'graphql/validation/rules/OverlappingFieldsCanBeMerged',
    'graphql/validation/rules/PossibleFragmentSpreads': 'graphql/validation/rules/PossibleFragmentSpreads',
    'graphql/validation/rules/ProvidedNonNullArguments': 'graphql/validation/rules/ProvidedNonNullArguments',
    'graphql/validation/rules/ScalarLeafs': 'graphql/validation/rules/ScalarLeafs',
    'graphql/validation/rules/UniqueArgumentNames': 'graphql/validation/rules/UniqueArgumentNames',
    'graphql/validation/rules/UniqueDirectivesPerLocation': 'graphql/validation/rules/UniqueDirectivesPerLocation',
    'graphql/validation/rules/UniqueFragmentNames': 'graphql/validation/rules/UniqueFragmentNames',
    'graphql/validation/rules/UniqueInputFieldNames': 'graphql/validation/rules/UniqueInputFieldNames',
    'graphql/validation/rules/UniqueOperationNames': 'graphql/validation/rules/UniqueOperationNames',
    'graphql/validation/rules/UniqueVariableNames': 'graphql/validation/rules/UniqueVariableNames',
    'graphql/validation/rules/VariablesAreInputTypes': 'graphql/validation/rules/VariablesAreInputTypes',
    'graphql/validation/rules/VariablesInAllowedPosition': 'graphql/validation/rules/VariablesInAllowedPosition',
    'graphql/validation/validate': 'graphql/validation/validate',
    'signedsource': 'signedsource',
    'crypto': 'crypto',
    'fs': 'fs',
    'net': 'net',
    'child_process': 'child_process',
    'path': 'path',
    'util': 'util',
    'yargs': 'yargs',
  },
  plugins: [
    'transform-flow-strip-types',
    'transform-runtime',
  ],
  postPlugins: [
    'transform-async-to-generator',
    'transform-es2015-modules-commonjs',
  ],
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
const DEVELOPMENT_HEADER = [
  '/**',
  ' * Relay v' + process.env.npm_package_version,
  ' */',
].join('\n') + '\n';
const PRODUCTION_HEADER = [
  '/**',
  ' * Relay v' + process.env.npm_package_version,
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
];

gulp.task('clean', function() {
  return del(DIST);
});

gulp.task('modules', function() {
  return es.merge(builds.map(build =>
    gulp.src([
      '*' + PACKAGES + '/' + build.package + '/**/*.js',
      // TODO: this is not a great way to share utility functions.
      '*' + PACKAGES + '/react-relay/classic/tools/*.js',
      '*' + PACKAGES + '/react-relay/classic/util/*.js',
      '*' + PACKAGES + '/react-relay/classic/__forks__/interface/*.js',
      '*' + PACKAGES + '/react-relay/classic/interface/*.js',
      '*' + PACKAGES + '/relay-runtime/util/*.js',
      '!' + PACKAGES + '/**/__tests__/**/*.js',
      '!' + PACKAGES + '/**/__mocks__/**/*.js',
    ]).pipe(babel(babelOptions))
      .pipe(flatten())
      .pipe(gulp.dest(path.join(DIST, build.package, 'lib')))
  ));
});

gulp.task('copy-files', function() {
  return es.merge(builds.map(build =>
    gulp.src([
      'LICENSE',
      'PATENTS',
      '*' + PACKAGES + '/' + build.package + '/*',
      '!' + PACKAGES + '/' + build.package + '/**/*.js',
    ]).pipe(flatten())
      .pipe(gulp.dest(path.join(DIST, build.package)))
  ));
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
  return es.merge(buildsWithBins.map(build =>
    es.merge(build.bins.map(bin =>
      gulp.src(path.join(DIST, build.package, 'lib', bin.entry))
        .pipe(buildDist(bin.output, bin, /* isProduction */ false))
        .pipe(header(SCRIPT_HASHBANG + PRODUCTION_HEADER))
        .pipe(chmod(0o755))
        .pipe(gulp.dest(path.join(DIST, build.package, 'bin')))
    ))
  ));
});

gulp.task('bundles', ['modules'], function() {
  return es.merge(builds.map(build =>
    es.merge(build.bundles.map(bundle =>
      gulp.src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(buildDist(bundle.output + '.js', bundle, /* isProduction */ false))
        .pipe(derequire())
        .pipe(header(DEVELOPMENT_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)))
    ))
  ));
});

gulp.task('bundles:min', ['modules'], function() {
  return es.merge(builds.map(build =>
    es.merge(build.bundles.map(bundle =>
      gulp.src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(buildDist(bundle.output + '.min.js', bundle, /* isProduction */ true))
        .pipe(header(PRODUCTION_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)))
    ))
  ));
});

gulp.task('watch', function() {
  gulp.watch(PACKAGES + '/**/*.js', ['exports', 'bundles']);
});

gulp.task('default', function(cb) {
  runSequence('clean', ['exports', 'bins', 'bundles', 'bundles:min'], cb);
});

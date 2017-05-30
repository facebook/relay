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
    'babel-core': 'babel-core',
    'babel-generator': 'babel-generator',
    'babel-polyfill': 'babel-polyfill',
    'babel-runtime/core-js/array/from': 'babel-runtime/core-js/array/from',
    'babel-runtime/core-js/json/stringify': 'babel-runtime/core-js/json/stringify',
    'babel-runtime/core-js/map': 'babel-runtime/core-js/map',
    'babel-runtime/core-js/object/assign': 'babel-runtime/core-js/object/assign',
    'babel-runtime/core-js/object/freeze': 'babel-runtime/core-js/object/freeze',
    'babel-runtime/core-js/object/get-own-property-names': 'babel-runtime/core-js/object/get-own-property-names',
    'babel-runtime/core-js/object/is-frozen': 'babel-runtime/core-js/object/is-frozen',
    'babel-runtime/core-js/object/keys': 'babel-runtime/core-js/object/keys',
    'babel-runtime/core-js/object/values': 'babel-runtime/core-js/object/values',
    'babel-runtime/core-js/promise': 'fbjs/lib/Promise',
    'babel-runtime/core-js/set': 'babel-runtime/core-js/set',
    'babel-runtime/core-js/weak-map': 'babel-runtime/core-js/weak-map',
    'babel-runtime/helpers/asyncToGenerator': 'babel-runtime/helpers/asyncToGenerator',
    'babel-runtime/helpers/classCallCheck': 'babel-runtime/helpers/classCallCheck',
    'babel-runtime/helpers/defineProperty': 'babel-runtime/helpers/defineProperty',
    'babel-runtime/helpers/extends': 'babel-runtime/helpers/extends',
    'babel-runtime/helpers/inherits': 'babel-runtime/helpers/inherits',
    'babel-runtime/helpers/possibleConstructorReturn': 'babel-runtime/helpers/possibleConstructorReturn',
    'babel-runtime/helpers/toConsumableArray': 'babel-runtime/helpers/toConsumableArray',
    'babel-traverse': 'babel-traverse',
    'babel-types': 'babel-types',
    'babylon': 'babylon',
    'child_process': 'child_process',
    'crypto': 'crypto',
    'fb-watchman': 'fb-watchman',
    'fs': 'fs',
    'graphql': 'graphql',
    'net': 'net',
    'path': 'path',
    'prop-types': 'prop-types',
    'React': 'react',
    'ReactDOM': 'react-dom',
    'ReactNative': 'react-native',
    'RelayRuntime': 'relay-runtime',
    'signedsource': 'signedsource',
    'StaticContainer.react': 'react-static-container',
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
const es = require('event-stream');
const flatten = require('gulp-flatten');
const fs = require('fs');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const path = require('path');
const runSequence = require('run-sequence');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const enhancedResolve = require('enhanced-resolve');
const uglify = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');

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

const isExternalModule = function(id, externals) {
  return !!externals.some(e => id.split('/')[0] === e);
};

const buildDist = function(opts) {
  const {
    entry,
    dest,
    format,
    moduleName,
    isProduction,
    noMinify,
    globals,
    banner,
    externals
  } = opts;
  const plugins = [
    {
      resolveId: (importee, importer) => {
        if (!importer) {
          // don't handle entry
          return null;
        }

        if (importee.startsWith('\0')) {
          // from commonjs plugin
          return null;
        }

        if (isExternalModule(importee, externals)) {
          // external, do not resolve
          return null;
        }

        // resolve using node resolve algorithm
        const resolver = enhancedResolve.create.sync({
          mainFields: format === 'umd' ? ['browser', 'main'] : ['main'],
          aliasFields: format === 'umd' ? ['browser'] : []
        });

        return resolver(path.dirname(importer), importee);
      }
    },
    replace({
      'process.env.NODE_ENV': isProduction ?
        JSON.stringify('production') :
        JSON.stringify('development')
    }),
    commonjs(),
  ];

  if (isProduction && !noMinify) {
    plugins.push(
      uglify({
        compress: {
          hoist_vars: true,
          screw_ie8: true,
          warnings: false,
        }
      })
    )
  }

  return rollup.rollup({
    entry,
    plugins,
    external: (id) => {
      // console.log('module', id);
      return isExternalModule(id, externals);
    }
  }).then(function (b) {
    b.write({
      banner,
      format,
      moduleName,
      dest,
      globals
    });
  }).catch(e => {
    throw new gulpUtil.PluginError('rollup', e.toString())
  });
};

// Paths from package-root
const PACKAGES = 'packages';
const DIST = 'dist';

const builds = [
  {
    package: 'babel-plugin-relay',
    bundles: [
      {
        export: 'index',
        entry: 'BabelPluginRelay.js',
        output: 'babel-plugin-relay',
        moduleName: 'BabelPluginRelay',
        format: 'cjs',
        target: 'node',
        externals: [
          'fs',
          'util',
          'graphql'
        ],
      },
    ],
  },
  {
    package: 'react-relay',
    bundles: [
      {
        entry: 'ReactRelayClassicExports.js',
        output: 'react-relay-classic',
        export: 'classic',
        moduleName: 'ReactRelayClassic',
        format: 'umd',
        globals: {
          'promise': 'Promise',
          'isomorphic-fetch': 'fetch',
          'react': 'React',
          'react-dom': 'ReactDOM',
          'relay-runtime': 'RelayRuntime'
        },
        externals: [
          'promise',
          'isomorphic-fetch',
          'react',
          'react-dom',
          'relay-runtime',
        ],
      },
      {
        entry: 'ReactRelayCompatPublic.js',
        output: 'react-relay-compat',
        export: 'compat',
        moduleName: 'ReactRelayCompat',
        format: 'umd',
        globals: {
          'promise': 'Promise',
          'isomorphic-fetch': 'fetch',
          'react': 'React',
          'react-dom': 'ReactDOM',
          'relay-runtime': 'RelayRuntime'
        },
        externals: [
          'promise',
          'isomorphic-fetch',
          'react',
          'react-dom',
          'relay-runtime',
        ],
      },
      {
        entry: 'ReactRelayPublic.js',
        output: 'react-relay',
        export: 'index',
        moduleName: 'ReactRelay',
        format: 'umd',
        globals: {
          'promise': 'Promise',
          'isomorphic-fetch': 'fetch',
          'react': 'React',
          'react-dom': 'ReactDOM',
          'relay-runtime': 'RelayRuntime'
        },
        externals: [
          'promise',
          'isomorphic-fetch',
          'react',
          'react-dom',
          'relay-runtime',
        ],
      },
      {
        entry: 'ReactRelayClassicExports.js',
        output: 'react-relay-classic',
        export: 'classic',
        moduleName: 'ReactRelayClassic',
        format: 'cjs',
        externals: [
          'babel-runtime',
          'fbjs',
          'prop-types',
          'react',
          'react-dom',
          'react-static-container',
          'relay-runtime',
        ],
      },
      {
        entry: 'ReactRelayCompatPublic.js',
        output: 'react-relay-compat',
        export: 'compat',
        moduleName: 'ReactRelayCompat',
        format: 'cjs',
        externals: [
          'babel-runtime',
          'fbjs',
          'prop-types',
          'react',
          'react-dom',
          'react-static-container',
          'relay-runtime',
        ],
      },
      {
        entry: 'ReactRelayPublic.js',
        output: 'react-relay',
        export: 'index',
        moduleName: 'ReactRelay',
        format: 'cjs',
        externals: [
          'babel-runtime',
          'fbjs',
          'prop-types',
          'react',
          'react-dom',
          'react-static-container',
          'relay-runtime',
        ],
      },
    ],
  },
  {
    package: 'relay-compiler',
    bundles: [
      {
        export: 'index',
        entry: 'RelayCompilerPublic.js',
        output: 'relay-compiler',
        moduleName: 'RelayCompiler',
        format: 'cjs',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
        externals: [
          'babel-generator',
          'babel-runtime',
          'babel-traverse',
          'babel-types',
          'babylon',
          'crypto',
          'fb-watchman',
          'fbjs',
          'fs',
          'graphql',
          'immutable',
          'path',
          'relay-runtime',
          'signedsource',
          'util',
          'yargs',
        ],
      },
    ],
    bins: [
      {
        entry: 'RelayCompilerBin.js',
        output: 'relay-compiler',
        format: 'cjs',
        target: 'node',
        externals: [
          'babel-generator',
          'babel-runtime',
          'babel-traverse',
          'babel-types',
          'babylon',
          'crypto',
          'fb-watchman',
          'fbjs',
          'fs',
          'graphql',
          'immutable',
          'path',
          'relay-runtime',
          'signedsource',
          'util',
          'yargs',
        ],
      },
    ],
  },
  {
    package: 'relay-runtime',
    bundles: [
      {
        export: 'index',
        entry: 'RelayRuntime.js',
        output: 'relay-runtime',
        moduleName: 'RelayRuntime',
        format: 'umd',
        globals: {
          'promise': 'Promise',
          'isomorphic-fetch': 'fetch'
        },
        externals: [
          'promise',
          'isomorphic-fetch'
        ],
      },
      {
        export: 'index',
        entry: 'RelayRuntime.js',
        output: 'relay-runtime',
        moduleName: 'RelayRuntime',
        format: 'cjs',
        externals: [
          'babel-runtime',
          'fbjs'
        ],
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
    build.bundles.map(bundle =>
      fs.writeFileSync(
        path.join(DIST, build.package, bundle.export + '.js'),
        PRODUCTION_HEADER +
        `\nif (process.env.NODE_ENV === 'production') {` +
        `\n  module.exports = require('./cjs/${bundle.output}.production.min.js')` +
        `\n} else {` +
        `\n  module.exports = require('./cjs/${bundle.output}.development.js');` +
        `\n}`
      )
    )
  );
});

gulp.task('bins', ['modules'], function() {
  const buildsWithBins = builds.filter(build => build.bins);
  buildsWithBins.map(build =>
    Promise.all(
      build.bins.map(bin => {
        const dest = `./dist/${build.package}/bin/${bin.output}`;
        return buildDist({
          entry: path.resolve(__dirname, DIST, build.package, 'lib', bin.entry),
          dest,
          banner: SCRIPT_HASHBANG + PRODUCTION_HEADER,
          noMinify: bin.noMinify,
          format: bin.format,
          moduleName: bin.moduleName,
          externals: bin.externals,
          isProduction: false
        }).then(() =>
          fs.chmodSync(dest, 0o755)
        )
      })
    )
  );
});

gulp.task('bundles:dev', ['modules'], function() {
  return Promise.all(
    builds.map(build =>
      Promise.all(
        build.bundles.map(bundle =>
          buildDist({
            entry: path.resolve(__dirname, DIST, build.package, 'lib', bundle.entry),
            dest: `./dist/${build.package}/${bundle.format}/${bundle.output}.development.js`,
            banner: DEVELOPMENT_HEADER,
            noMinify: bundle.noMinify,
            format: bundle.format,
            moduleName: bundle.moduleName,
            externals: bundle.externals,
            globals: bundle.globals,
            isProduction: false
          })
        )
      )
    )
  );
});

gulp.task('bundles:prod', ['modules'], function() {
  return Promise.all(
    builds.map(build =>
      Promise.all(
        build.bundles.map(bundle =>
          buildDist({
            entry: path.resolve(__dirname, DIST, build.package, 'lib', bundle.entry),
            dest: `./dist/${build.package}/${bundle.format}/${bundle.output}.production.min.js`,
            banner: PRODUCTION_HEADER,
            noMinify: bundle.noMinify,
            format: bundle.format,
            moduleName: bundle.moduleName,
            externals: bundle.externals,
            globals: bundle.globals,
            isProduction: true
          })
        )
      )
    )
  );
});

gulp.task('bundles', ['bundles:prod', 'bundles:dev']);

gulp.task('cleanup', function() {
  return Promise.all(
    builds.map(build =>
      del(path.resolve(__dirname, DIST, build.package, 'lib'))
    )
  );
});

gulp.task('watch', function() {
  gulp.watch(PACKAGES + '/**/*.js', ['exports', 'bundles']);
});

gulp.task('default', function(cb) {
  runSequence('clean', ['exports', 'bins', 'bundles'], 'cleanup', cb);
});

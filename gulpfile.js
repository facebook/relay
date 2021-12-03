/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const babelOptions = require('./scripts/getBabelOptions')({
  ast: false,
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    [
      '@babel/plugin-transform-runtime',
      {version: require('@babel/runtime/package.json').version},
    ],
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
const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const chmod = require('gulp-chmod');
const header = require('gulp-header');
const rename = require('gulp-rename');
const gulpUtil = require('gulp-util');
const path = require('path');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const RELEASE_COMMIT_SHA = process.env.RELEASE_COMMIT_SHA;
if (RELEASE_COMMIT_SHA && RELEASE_COMMIT_SHA.length !== 40) {
  throw new Error(
    'If the RELEASE_COMMIT_SHA env variable is set, it should be set to the ' +
      '40 character git commit hash.',
  );
}

const VERSION = RELEASE_COMMIT_SHA
  ? `0.0.0-main-${RELEASE_COMMIT_SHA.substr(0, 8)}`
  : process.env.npm_package_version;

const SCRIPT_HASHBANG = '#!/usr/bin/env node\n';
const DEVELOPMENT_HEADER = `/**
 * Relay v${VERSION}
 */
`;
const PRODUCTION_HEADER = `/**
 * Relay v${VERSION}
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

const buildDist = function (filename, opts, isProduction) {
  const webpackOpts = {
    externals: [/^[-/a-zA-Z0-9]+$/, /^@babel\/.+$/],
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
          isProduction ? 'production' : 'development',
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
  return webpackStream(webpackOpts, webpack, function (err, stats) {
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

// Globs for paths in PACKAGES
const INCLUDE_GLOBS = [
  '**/*.js',
  '!**/__tests__/**',
  '!**/__flowtests__/**',
  '!**/__mocks__/**',
  '!**/node_modules/**',
];

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
      hooks: 'hooks.js',
      legacy: 'legacy.js',
      ReactRelayContext: 'ReactRelayContext.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'react-relay',
        libraryName: 'ReactRelay',
        libraryTarget: 'umd',
      },
      {
        entry: 'hooks.js',
        output: 'react-relay-hooks',
        libraryName: 'ReactRelayHooks',
        libraryTarget: 'umd',
      },
      {
        entry: 'legacy.js',
        output: 'react-relay-legacy',
        libraryName: 'ReactRelayLegacy',
        libraryTarget: 'umd',
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
        libraryTarget: 'commonjs2',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
  {
    package: 'relay-config',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'relay-config',
        libraryName: 'RelayConfig',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
  {
    package: 'relay-test-utils-internal',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'relay-test-utils-internal',
        libraryName: 'RelayTestUtilsInternal',
        libraryTarget: 'commonjs2',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
];

const modules = gulp.parallel(
  ...builds.map(
    (build) =>
      function modulesTask() {
        return gulp
          .src(INCLUDE_GLOBS, {
            cwd: path.join(PACKAGES, build.package),
          })
          .pipe(babel(babelOptions))
          .pipe(gulp.dest(path.join(DIST, build.package, 'lib')));
      },
  ),
);

const flowDefs = gulp.parallel(
  ...builds.map(
    (build) =>
      function modulesTask() {
        return gulp
          .src(['**/*.js', '!**/__tests__/**/*.js', '!**/__mocks__/**/*.js'], {
            cwd: PACKAGES + '/' + build.package,
          })
          .pipe(rename({extname: '.js.flow'}))
          .pipe(gulp.dest(path.join(DIST, build.package)));
      },
  ),
);

const copyFilesTasks = [];
builds.forEach((build) => {
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
    },
  );
});
const copyFiles = gulp.parallel(copyFilesTasks);

const exportsFiles = gulp.series(
  copyFiles,
  flowDefs,
  modules,
  gulp.parallel(
    ...builds.map(
      (build) =>
        function exportsFilesTask(done) {
          Object.keys(build.exports).map((exportName) =>
            fs.writeFileSync(
              path.join(DIST, build.package, exportName + '.js'),
              PRODUCTION_HEADER +
                `\nmodule.exports = require('./lib/${build.exports[exportName]}');\n`,
            ),
          );
          done();
        },
    ),
  ),
);

const bundlesTasks = [];
builds.forEach((build) => {
  build.bundles.forEach((bundle) => {
    bundlesTasks.push(function bundleTask() {
      return gulp
        .src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(
          buildDist(bundle.output + '.js', bundle, /* isProduction */ false),
        )
        .pipe(header(DEVELOPMENT_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)));
    });
  });
});
const bundles = gulp.series(bundlesTasks);

const bundlesMinTasks = [];
builds.forEach((build) => {
  build.bundles.forEach((bundle) => {
    bundlesMinTasks.push(function bundlesMinTask() {
      return gulp
        .src(path.join(DIST, build.package, 'lib', bundle.entry))
        .pipe(
          buildDist(bundle.output + '.min.js', bundle, /* isProduction */ true),
        )
        .pipe(header(PRODUCTION_HEADER))
        .pipe(gulp.dest(path.join(DIST, build.package)));
    });
  });
});
const bundlesMin = gulp.series(bundlesMinTasks);

const clean = () => del(DIST);
const dist = gulp.series(exportsFiles, bundles, bundlesMin);
const watch = gulp.series(dist, () =>
  gulp.watch(INCLUDE_GLOBS, {cwd: PACKAGES}, dist),
);

const relayCompiler = gulp.parallel(
  function copyLicense() {
    return gulp
      .src(['LICENSE'])
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
  function copyPackageFiles() {
    return gulp
      .src(['package.json', 'cli.js', 'index.js'], {
        cwd: path.join(PACKAGES, 'relay-compiler'),
      })
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
  function copyCompilerBins() {
    return gulp
      .src('**', {
        cwd: path.join('artifacts'),
      })
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
);

/**
 * Updates the package.json files `/dist/` with a version to release to npm under
 * the main tag.
 */
const setMainVersion = async () => {
  if (!RELEASE_COMMIT_SHA) {
    throw new Error('Expected the RELEASE_COMMIT_SHA env variable to be set.');
  }
  const packages = builds.map((build) => build.package);
  packages.push('relay-compiler');
  packages.forEach((pkg) => {
    const pkgJsonPath = path.join('.', 'dist', pkg, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    packageJson.version = VERSION;
    for (const depKind of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ]) {
      const deps = packageJson[depKind];
      for (const dep in deps) {
        if (packages.includes(dep)) {
          deps[dep] = VERSION;
        }
      }
    }
    fs.writeFileSync(
      pkgJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8',
    );
  });
};

const cleanbuild = gulp.series(clean, dist);

exports.clean = clean;
exports.dist = dist;
exports.watch = watch;
exports.mainrelease = gulp.series(cleanbuild, relayCompiler, setMainVersion);
exports.release = gulp.series(cleanbuild, relayCompiler);
exports.cleanbuild = cleanbuild;
exports.default = cleanbuild;

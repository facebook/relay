/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const babelOptions = require('./scripts/getBabelOptions')({
  ast: false,
  plugins: [
    'babel-plugin-syntax-hermes-parser',
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
const rename = require('gulp-rename');
const jsonSchemaToTypescript = require('json-schema-to-typescript');
const path = require('path');
const stream = require('stream');

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

const PRODUCTION_HEADER = `/**
 * Relay v${VERSION}
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

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
  },
  {
    package: 'react-relay',
    exports: {
      index: 'index.js',
      hooks: 'hooks.js',
      legacy: 'legacy.js',
      ReactRelayContext: 'ReactRelayContext.js',
    },
  },
  {
    package: 'relay-runtime',
    exports: {
      index: 'index.js',
      experimental: 'experimental.js',
    },
  },
  {
    package: 'relay-test-utils',
    exports: {
      index: 'index.js',
    },
  },
  {
    package: 'relay-test-utils-internal',
    exports: {
      index: 'index.js',
    },
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
        libraryTarget: 'commonjs2',
        target: 'node',
        noMinify: true, // Note: uglify can't yet handle modern JS
      },
    ],
  },
];

const relayConfig = gulp.parallel(
  function copyCompilerConfigSchema() {
    return gulp
      .src(['relay-compiler-config-schema.json'], {
        cwd: path.join('compiler/crates/relay-compiler'),
      })
      .pipe(gulp.dest(path.join(DIST, 'relay-config')));
  },
  function copyTypescriptTypes() {
    return gulp
      .src(['index.d.ts'], {
        cwd: path.join(PACKAGES, 'relay-config'),
      })
      .pipe(gulp.dest(path.join(DIST, 'relay-config')));
  },
  function generateConfigTypescriptTypes() {
    return gulp
      .src(['relay-compiler-config-schema.json'], {
        cwd: path.join('compiler/crates/relay-compiler'),
      })
      .pipe(
        new stream.Transform({
          objectMode: true,
          transform(file, _, callback) {
            jsonSchemaToTypescript
              .compile(JSON.parse(file.contents.toString()))
              .then(data => {
                file.contents = Buffer.from(data);
                callback(null, file);
              })
              .catch(error => callback(error, null));
          },
        }),
      )
      .pipe(rename('RelayConfig.d.ts'))
      .pipe(gulp.dest(path.join(DIST, 'relay-config')));
  },
);

const modules = gulp.parallel(
  ...builds.map(
    build =>
      function modulesTask() {
        return gulp
          .src(INCLUDE_GLOBS, {
            cwd: path.join(PACKAGES, build.package),
          })
          .pipe(babel(babelOptions))
          .pipe(gulp.dest(path.join(DIST, build.package, 'lib')));
      },
  ),
  relayConfig,
);

const flowDefs = gulp.parallel(
  ...builds.map(
    build =>
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
builds.forEach(build => {
  copyFilesTasks.push(
    function copyLicense() {
      return gulp
        .src(['LICENSE'])
        .pipe(gulp.dest(path.join(DIST, build.package)));
    },
    function copyReadmeFile() {
      return gulp
        .src(['README.md'], {
          cwd: path.join(PACKAGES, build.package),
        })
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
      build =>
        function exportsFilesTask(done) {
          Object.keys(build.exports).map(exportName =>
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

const clean = () => del(DIST);
const dist = gulp.series(exportsFiles);
const watch = gulp.series(dist, () =>
  gulp.watch(INCLUDE_GLOBS, {cwd: PACKAGES}, dist),
);

const relayCompiler = gulp.parallel(
  function copyLicense() {
    return gulp
      .src(['LICENSE'])
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
  function copyGraphQLExtensions() {
    return gulp
      .src(
        path.join(
          '.',
          'compiler',
          'crates',
          'relay-schema',
          'src',
          'relay-extensions.graphql',
        ),
      )
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
  function copyPackageFiles() {
    return gulp
      .src(['README.md', 'package.json', 'cli.js', 'index.js'], {
        cwd: path.join(PACKAGES, 'relay-compiler'),
      })
      .pipe(gulp.dest(path.join(DIST, 'relay-compiler')));
  },
  function copyCompilerConfigSchema() {
    return gulp
      .src(['relay-compiler-config-schema.json'], {
        cwd: path.join('compiler/crates/relay-compiler'),
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
  const packages = builds.map(build => build.package);
  packages.push('relay-compiler');
  packages.forEach(pkg => {
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

async function setCompilerMainVersion() {
  if (!RELEASE_COMMIT_SHA) {
    throw new Error('Expected the RELEASE_COMMIT_SHA env variable to be set.');
  }
  const currentVersion = require('./package.json').version;
  const compilerCargoFile = path.join(
    '.',
    'compiler',
    'crates',
    'relay-compiler',
    'Cargo.toml',
  );
  const cargo = fs.readFileSync(compilerCargoFile, 'utf8');
  const updatedCargo = cargo.replace(
    `version = "${currentVersion}"`,
    `version = "${VERSION}"`,
  );
  fs.writeFileSync(compilerCargoFile, updatedCargo, 'utf8');
}

const cleanbuild = gulp.series(clean, dist);

exports.clean = clean;
exports.dist = dist;
exports.watch = watch;
exports.mainrelease = gulp.series(cleanbuild, relayCompiler, setMainVersion);
exports.release = gulp.series(cleanbuild, relayCompiler);
exports.cleanbuild = cleanbuild;
exports.default = cleanbuild;
exports.setCompilerMainVersion = setCompilerMainVersion;

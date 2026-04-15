/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Jest transform for the relay e2e test package.
 *
 * Handles both:
 * - TypeScript/TSX files (test code and fixture code) via @babel/plugin-transform-typescript
 * - Flow JS files (relay-runtime and react-relay source) via babel-plugin-syntax-hermes-parser
 */

'use strict';

const {RELAY_ROOT, getMainRepoRoot} = require('./repoRoot');
const babel = require('@babel/core');
const createCacheKeyFunction =
  require('@jest/create-cache-key-function').default;
const fs = require('fs');
const path = require('path');

function findBabelPluginRelay() {
  // Prefer local build from source (tests latest changes)
  const relPath = 'dist/babel-plugin-relay/lib/BabelPluginRelay.js';
  const local = path.join(RELAY_ROOT, relPath);
  if (fs.existsSync(local)) {
    return local;
  }
  const mainRoot = getMainRepoRoot();
  if (mainRoot !== RELAY_ROOT) {
    const mainPath = path.join(mainRoot, relPath);
    if (fs.existsSync(mainPath)) {
      return mainPath;
    }
  }
  // Fall back to npm version from e2e node_modules
  return require.resolve('babel-plugin-relay');
}

// Resolve all plugin paths upfront so Babel doesn't need to resolve them
// relative to each file being transformed (which fails for temp dir files)
const hermesParser = require.resolve('babel-plugin-syntax-hermes-parser');
const flowStrip = require.resolve('@babel/plugin-transform-flow-strip-types');
const tsTransform = require.resolve('@babel/plugin-transform-typescript');
const reactJsx = require.resolve('@babel/plugin-transform-react-jsx');
const modulesCommonjs = require.resolve(
  '@babel/plugin-transform-modules-commonjs',
);
const rewriteModules = path.join(RELAY_ROOT, 'scripts', 'rewrite-modules');

module.exports = {
  process(src, filename) {
    const isTypeScript = /\.tsx?$/.test(filename);
    const isRelaySource = /\/packages\/(relay-runtime|react-relay)\//.test(
      filename,
    );

    const plugins = [];

    if (isTypeScript && !isRelaySource) {
      // TypeScript files: use @babel/plugin-transform-typescript
      // which includes the TS syntax plugin and strips TS types
      plugins.push([tsTransform, {isTSX: true, allowDeclareFields: true}]);
    } else {
      // Flow files (relay source) and plain JS: use hermes parser + flow strip
      plugins.push(hermesParser);
      plugins.push(flowStrip);
    }

    // Transform JSX to jsx-runtime calls (needed for all files with JSX)
    plugins.push([reactJsx, {runtime: 'automatic'}]);

    // Relay babel transform for graphql`` tagged templates
    plugins.push([findBabelPluginRelay(), {eagerEsModules: false}]);

    // Rewrite Haste-style bare module imports used by Relay source
    plugins.push([
      rewriteModules,
      {
        map: {
          areEqual: 'fbjs/lib/areEqual',
          warning: 'fbjs/lib/warning',
        },
      },
    ]);

    // Convert ES modules to CommonJS for Jest
    plugins.push(modulesCommonjs);

    return babel.transformSync(src, {
      filename,
      plugins,
      retainLines: true,
      sourceMaps: 'inline',
    });
  },

  getCacheKey: createCacheKeyFunction([__filename]),
};

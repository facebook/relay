/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

let plugins = ['prettier-plugin-hermes-parser'];
try {
  plugins = require('./.prettier-plugins.fb.js');
} catch {}

module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: false,
  requirePragma: true,
  singleQuote: true,
  trailingComma: 'all',
  parser: 'hermes',
  plugins,
};

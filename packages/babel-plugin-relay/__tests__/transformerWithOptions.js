/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const BabelPluginRelay = require('../BabelPluginRelay');
const babel = require('@babel/core');
const prettier = require('prettier');

function transformerWithOptions(
  options: RelayPluginOptions,
  environment: 'development' | 'production' = 'production',
  filename?: string = '',
): string => string {
  return (text, providedFileName) => {
    const previousEnv = process.env.BABEL_ENV;
    try {
      process.env.BABEL_ENV = environment;
      const code = babel.transform(text, {
        compact: false,
        cwd: '/',
        filename: filename || providedFileName || 'test.js',
        highlightCode: false,
        parserOpts: {plugins: ['jsx']},
        plugins: [[BabelPluginRelay, options]],
      }).code;
      return prettier.format(code, {
        bracketSameLine: true,
        bracketSpacing: false,
        parser: 'flow',
        requirePragma: false,
        singleQuote: true,
        trailingComma: 'all',
      });
    } finally {
      process.env.BABEL_ENV = previousEnv;
    }
  };
}

module.exports = transformerWithOptions;

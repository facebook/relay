/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

module.exports = {
  root: true,
  ignorePatterns: 'out/*',
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      extends: ['airbnb-base', 'airbnb-typescript/base'],
      rules: {
        // The following rules conflict with prettier
        'operator-linebreak': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/object-curly-spacing': 'off',
        '@typescript-eslint/brace-style': 'off',
        'object-curly-newline': 'off',
        'arrow-parens': 'off',

        // Opinionated
        'import/prefer-default-export': 'off',
        'no-await-in-loop': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          {functions: false},
        ],
        'class-methods-use-this': 'off',
        'max-classes-per-file': 'off',
      },
    },
  ],
};

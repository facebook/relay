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

module.exports = {
  root: true,
  // TODO - migrate this onto @react-native-community/eslint-config
  extends: ['fbjs'],
  plugins: ['jest', 'relay', 'react-hooks', 'relay-internal'],
  parser: 'hermes-eslint',
  rules: {
    // Consistency with internal config
    'no-class-assign': 'off',

    // This is very noisy, so disable
    'consistent-return': 'off',

    // Flow declares trip up the no-redeclare rule
    'no-redeclare': 'off',

    // Flow handles these rules
    'no-unreachable': 'off',

    // Prettier and ESLint may disagree on the following rules
    indent: 'off',
    'array-bracket-spacing': 'off',
    'comma-dangle': 'off',
    'max-len': 'off',
    'no-extra-parens': 'off',
    'space-before-function-paren': 'off',
    'ft-flow/object-type-delimiter': 'off',
    'babel/flow-object-type': 'off',

    // Tests do not need to follow relay naming rules
    'relay/graphql-naming': 'off',

    // TODO T31139228: remove or re-enable these once eslint-plugin-flowtype
    // is compatible with babel-eslint >= 8
    'no-undef': 'off',
    'no-unused-vars': [
      1,
      {
        args: 'none',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // This has a different name internally
    'no-label-var': 'off',

    // Relay uses console statements for debugging and compile feedback
    'no-console': [
      'warn',
      {
        allow: [
          'warn',
          'error',
          'debug',
          'time',
          'timeEnd',
          'timeStamp',
          'groupCollapsed',
          'groupEnd',
        ],
      },
    ],

    // Duplicating some errors that are enforced internally
    'prefer-const': 'error',
    'no-trailing-spaces': 'error',

    // These rules are not required with hermes-eslint
    'ft-flow/define-flow-type': 0,
    'ft-flow/use-flow-type': 0,

    // depreciated rules
    'no-spaced-func': 0,

    // Custom rules for our own codebase
    'relay-internal/no-mixed-import-and-require': 'error',
    'relay-internal/sort-imports': 'error',
    // OSS will fail if we enable this even as a warning. We will look at
    // enabling this as part of a separate diff that fixes existing issues.
    'relay-internal/no-for-of-loops': 'off',
  },
};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

const rule = require('../../../lib/rules/no-for-of-loops');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
  },
});

ruleTester.run('no-for-of-loops', rule, {
  valid: [
    // Valid code samples that should never error
    'for (let i = 0; i < 10; i++) {}',
    'for (const i in obj) {}',
    'arr.forEach(() => {});',
  ],
  invalid: [
    // Invalid code samples that trigger the rule to report
    {
      code: 'for (const i of arr) {}',
      errors: [{messageId: 'forOfLoop'}],
    },
    {
      code: `
       for (const missing of cachedSnapshot.missingClientEdges) {
          this._missingClientEdges.push(missing);
        }`,
      errors: [{messageId: 'forOfLoop'}],
    },
  ],
});

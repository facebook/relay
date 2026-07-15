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

const rule = require('../../../lib/rules/esm-compatible-cjs');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 6,
  },
});

ruleTester.run('esm-compatible-cjs', rule, {
  valid: [
    // Shorthand property (identifier value)
    `
      const foo = require('foo');
      module.exports = { foo };
    `,
    // Identifier value with explicit key
    `
      const bar = require('bar');
      module.exports = { foo: bar };
    `,
    // Non-module.exports assignment is ignored
    `
      const obj = { foo: something.bar };
    `,
    // Simple identifier assignment (not member expression) is ignored
    `
      x = { foo: something.bar };
    `,
    // Spread elements are allowed
    `
      module.exports = { ...something };
    `,
  ],
  invalid: [
    // Member expression value (the pattern cjs-module-lexer can't detect)
    {
      code: `
        module.exports = { foo: SomeModule.foo };
      `,
      errors: [{messageId: 'esmCompatibleCjs'}],
    },
    // Call expression value
    {
      code: `
        module.exports = { foo: require('foo').bar };
      `,
      errors: [{messageId: 'esmCompatibleCjs'}],
    },
    // Multiple invalid exports
    {
      code: `
        module.exports = {
          foo: SomeModule.foo,
          bar: SomeModule.bar,
        };
      `,
      errors: [
        {messageId: 'esmCompatibleCjs'},
        {messageId: 'esmCompatibleCjs'},
      ],
    },
  ],
});

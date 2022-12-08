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

const rule = require('../../../lib/rules/no-mixed-import-and-require');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
  },
});

ruleTester.run('no-mixed-import-and-require', rule, {
  valid: [
    `import foo from 'bar';`,
    `import type foo from 'bar';`,
    `
      import typeof foo from 'bar';
      require('foo');
    `,
    `
      import typeof {foo} from 'bar';
      require('foo');
    `,
    `
      import foo from 'bar';
      SomeModule.require('foo');
    `,
    `require('foo');`,
    `
       import type foo from 'bar';
       require('foo');
     `,
  ],
  invalid: [
    {
      code: `
         import foo from 'bar';
         const baz = require('baz');
       `,
      errors: [
        {
          messageId: 'noMixedImportAndRequire',
        },
      ],
    },
  ],
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict
 * @format
 */

'use strict';

const CodeInJSON = require('../CodeInJSON');

test('replaces code in JSON', () => {
  const json = CodeInJSON.postProcess(
    JSON.stringify({
      kind: 'test',
      module: CodeInJSON.mark("require('MyModule')"),
      module2: CodeInJSON.mark("require('MyOtherModule')"),
    }),
  );

  expect(json).toBe(
    [
      '{',
      '"kind":"test",',
      '"module":require(\'MyModule\'),',
      '"module2":require(\'MyOtherModule\')',
      '}',
    ].join(''),
  );
});

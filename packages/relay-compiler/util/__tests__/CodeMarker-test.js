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

// flowlint ambiguous-object-type:error

'use strict';

const CodeMarker = require('../CodeMarker');

test('replaces code in JSON', () => {
  const json = JSON.stringify({
    kind: 'test',
    module: CodeMarker.moduleDependency('MyModule'),
    module2: CodeMarker.moduleDependency('MyOtherModule'),
  });
  const printRequire = moduleName => `require('${moduleName}')`;
  expect(CodeMarker.postProcess(json, printRequire)).toBe(
    [
      '{',
      '"kind":"test",',
      '"module":require(\'MyModule\'),',
      '"module2":require(\'MyOtherModule\')',
      '}',
    ].join(''),
  );

  const printImport = moduleName => `import('${moduleName}')`;
  expect(CodeMarker.postProcess(json, printImport)).toBe(
    [
      '{',
      '"kind":"test",',
      '"module":import(\'MyModule\'),',
      '"module2":import(\'MyOtherModule\')',
      '}',
    ].join(''),
  );
});

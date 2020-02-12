/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const createPrintRequireModuleDependency = require('../createPrintRequireModuleDependency');

describe('createPrintRequireModuleDependency', () => {
  it('outputs the correct dependency path', () => {
    const extension = 'js';
    const moduleName = 'module';
    const printModuleDependency = createPrintRequireModuleDependency(extension);
    const moduleDependency = printModuleDependency(moduleName);

    expect(moduleDependency).toEqual(`require('./${moduleName}.${extension}')`);
  });
});

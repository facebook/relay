/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const deepMergeAssignments = require('../deepMergeAssignments');

describe('deepMergeAssignments', () => {
  it('creates a single simple assignment', () => {
    const assignments = deepMergeAssignments('obj', {simple: 'assignment'});
    expect(assignments).toEqual('obj.simple = "assignment";');
  });

  it('creates a series of nested assignments', () => {
    const assignments = deepMergeAssignments('obj', {
      nested: [{deep: 'assignment'}, {deep: 'assignment'}],
    });
    expect(assignments).toEqual(
      'obj.nested[0].deep = "assignment";\n' +
        'obj.nested[1].deep = "assignment";',
    );
  });
});

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest
  .autoMockOff();

const RelayConcreteNode = require('RelayConcreteNode');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

const cloneRelayHandleSourceField = require('cloneRelayHandleSourceField');
const getRelayStaticHandleKey = require('getRelayStaticHandleKey');

const {
  generateWithTransforms,
  matchers,
} = RelayStaticTestUtils;
const {
  LINKED_FIELD,
  LINKED_HANDLE,
} = RelayConcreteNode;

describe('cloneRelayHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    jest.addMatchers(matchers);
    const input = generateWithTransforms(`
      fragment A on User {
        address @__clientField(handle: "test") {
          street
        }
      }
    `);
    selections = input.A.selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    const sourceField = selections.find(node => node.kind === LINKED_FIELD);
    const clone = cloneRelayHandleSourceField(handleField, selections);

    expect(clone.kind).toBe(LINKED_FIELD);
    expect(clone.name).toBe(getRelayStaticHandleKey('test', null, 'address'));
    expect(clone.selections).toEqual(sourceField.selections);
  });

  it('throws if the source field is not present', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    selections = selections.filter(node => node.kind === LINKED_HANDLE);

    expect(() => cloneRelayHandleSourceField(handleField, selections))
      .toFailInvariant(
        'cloneRelayHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.'
      );
  });
});

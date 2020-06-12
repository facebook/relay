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

'use strict';

const cloneRelayHandleSourceField = require('../cloneRelayHandleSourceField');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {LINKED_FIELD, LINKED_HANDLE} = require('../../util/RelayConcreteNode');
const {generateWithTransforms} = require('relay-test-utils-internal');

describe('cloneRelayHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    const {TestQuery} = generateWithTransforms(`
      query TestQuery {
        me {
          address @__clientField(handle: "test") {
            street
          }
        }
      }
    `);
    // Get the selections on `me`.
    selections = TestQuery.operation.selections[0].selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    const sourceField = selections.find(node => node.kind === LINKED_FIELD);
    const clone = cloneRelayHandleSourceField(handleField, selections, {});

    expect(clone.kind).toBe(LINKED_FIELD);
    expect(clone.name).toBe(getRelayHandleKey('test', null, 'address'));
    expect(clone.selections).toEqual(sourceField.selections);
  });

  it('throws if the source field is not present', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    selections = selections.filter(node => node.kind === LINKED_HANDLE);

    expect(() =>
      cloneRelayHandleSourceField(handleField, selections, {}),
    ).toThrowError(
      'cloneRelayHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.',
    );
  });
});

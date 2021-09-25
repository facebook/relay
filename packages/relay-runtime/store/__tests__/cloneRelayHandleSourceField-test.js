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

const getRelayHandleKey = require('../../util/getRelayHandleKey');
const {LINKED_FIELD, LINKED_HANDLE} = require('../../util/RelayConcreteNode');
const cloneRelayHandleSourceField = require('../cloneRelayHandleSourceField');
const {getRequest, graphql} = require('relay-runtime');

describe('cloneRelayHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    const TestQuery = getRequest(graphql`
      query cloneRelayHandleSourceFieldTestTestQuery {
        me {
          address @__clientField(handle: "test") {
            street
          }
        }
      }
    `);
    // Get the selections on `me`.
    // $FlowFixMe;
    selections = TestQuery.operation.selections[0].selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    const sourceField = selections.find(node => node.kind === LINKED_FIELD);
    const clone = cloneRelayHandleSourceField(
      (handleField: $FlowFixMe),
      selections,
      {},
    );

    expect(clone.kind).toBe(LINKED_FIELD);
    expect(clone.name).toBe(getRelayHandleKey('test', null, 'address'));
    // $FlowFixMe
    expect(clone.selections).toEqual(sourceField.selections);
  });

  it('throws if the source field is not present', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    selections = selections.filter(node => node.kind === LINKED_HANDLE);

    expect(() =>
      cloneRelayHandleSourceField((handleField: $FlowFixMe), selections, {}),
    ).toThrowError(
      'cloneRelayHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.',
    );
  });
});

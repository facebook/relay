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
const {SCALAR_FIELD, SCALAR_HANDLE} = require('../../util/RelayConcreteNode');
const cloneRelayScalarHandleSourceField = require('../cloneRelayScalarHandleSourceField');
const {getRequest, graphql} = require('relay-runtime');

describe('cloneRelayScalarHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    const TestQuery = getRequest(graphql`
      query cloneRelayScalarHandleSourceFieldTestQuery {
        me {
          address {
            street @__clientField(handle: "test")
          }
        }
      }
    `);
    // Get the selections on `me.addresss`.
    // $FlowFixMe
    selections = TestQuery.operation.selections[0].selections[0].selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    const handleField = selections.find(node => node.kind === SCALAR_HANDLE);
    const clone = cloneRelayScalarHandleSourceField(
      (handleField: $FlowFixMe),
      selections,
      {},
    );

    expect(clone.kind).toBe(SCALAR_FIELD);
    expect(clone.name).toBe(getRelayHandleKey('test', null, 'street'));
    expect(clone.storageKey).toBe(getRelayHandleKey('test', null, 'street'));
  });

  it('throws if the source field is not present', () => {
    const handleField = selections.find(node => node.kind === SCALAR_HANDLE);
    selections = selections.filter(node => node.kind === SCALAR_HANDLE);

    expect(() =>
      cloneRelayScalarHandleSourceField(
        (handleField: $FlowFixMe),
        selections,
        {},
      ),
    ).toThrowError(
      'cloneRelayScalarHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.',
    );
  });
});

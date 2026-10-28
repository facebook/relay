/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  NormalizationLinkedField,
  NormalizationLinkedHandle,
} from '../../util/NormalizationNode';

const getRelayHandleKey = require('../../util/getRelayHandleKey');
const {LINKED_FIELD, LINKED_HANDLE} = require('../../util/RelayConcreteNode');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const cloneRelayHandleSourceField = require('../cloneRelayHandleSourceField');
const {graphql} = require('relay-runtime');

describe('cloneRelayHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    const TestQuery = graphql`
      query cloneRelayHandleSourceFieldTestTestQuery {
        me {
          address @__clientField(handle: "test") {
            street
          }
        }
      }
    `;
    // Get the selections on `me`.
    selections = TestQuery.operation.selections[0].selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    // $FlowFixMe[incompatible-use]
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    // $FlowFixMe[incompatible-use]
    const sourceField = selections.find(node => node.kind === LINKED_FIELD);
    const clone = cloneRelayHandleSourceField(
      handleField as $FlowFixMe,
      // $FlowFixMe[incompatible-type]
      selections,
      {},
    );

    expect(clone.kind).toBe(LINKED_FIELD);
    expect(clone.name).toBe(getRelayHandleKey('test', null, 'address'));
    // $FlowFixMe[incompatible-use]
    expect(clone.selections).toEqual(sourceField.selections);
  });

  it('returns the same clone for the same selections and handle key with ENABLE_PERF_STORAGE_KEYS', () => {
    const previousFlag = RelayFeatureFlags.ENABLE_PERF_STORAGE_KEYS;
    RelayFeatureFlags.ENABLE_PERF_STORAGE_KEYS = true;
    try {
      const sourceField: NormalizationLinkedField = {
        kind: 'LinkedField',
        alias: null,
        name: 'friends',
        args: [{kind: 'Variable', name: 'orderby', variableName: 'order'}],
        concreteType: 'FriendsConnection',
        plural: false,
        selections: [],
      };
      const handleField: NormalizationLinkedHandle = {
        kind: 'LinkedHandle',
        alias: null,
        name: 'friends',
        args: [{kind: 'Variable', name: 'orderby', variableName: 'order'}],
        handle: 'connection',
        key: 'UserQuery_friends',
        filters: ['orderby'],
      };
      const fieldSelections = [sourceField, handleField];
      const clone = cloneRelayHandleSourceField(handleField, fieldSelections, {
        order: 'name',
      });
      expect(clone.name).toBe('__UserQuery_friends_connection(orderby:"name")');
      expect(
        cloneRelayHandleSourceField(handleField, fieldSelections, {
          order: 'name',
        }),
      ).toBe(clone);
      const byDate = cloneRelayHandleSourceField(handleField, fieldSelections, {
        order: 'date',
      });
      expect(byDate.name).toBe(
        '__UserQuery_friends_connection(orderby:"date")',
      );
      const fromOtherSelections = cloneRelayHandleSourceField(
        handleField,
        [...fieldSelections],
        {order: 'date'},
      );
      expect(fromOtherSelections).not.toBe(byDate);
      expect(fromOtherSelections).toEqual(byDate);
    } finally {
      RelayFeatureFlags.ENABLE_PERF_STORAGE_KEYS = previousFlag;
    }
  });

  it('throws if the source field is not present', () => {
    // $FlowFixMe[incompatible-use]
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    // $FlowFixMe[incompatible-use]
    selections = selections.filter(node => node.kind === LINKED_HANDLE);

    expect(() =>
      // $FlowFixMe[incompatible-type]
      cloneRelayHandleSourceField(handleField as $FlowFixMe, selections, {}),
    ).toThrowError(
      'cloneRelayHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.',
    );
  });
});

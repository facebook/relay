/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const cloneRelayHandleSourceField = require('../cloneRelayHandleSourceField');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {LINKED_FIELD, LINKED_HANDLE} = require('../../util/RelayConcreteNode');
const {generateWithTransforms, matchers} = require('RelayModernTestUtils');

describe('cloneRelayHandleSourceField()', () => {
  let selections;

  beforeEach(() => {
    expect.extend(matchers);
    const input = generateWithTransforms(
      `
      fragment A on User {
        address @__clientField(handle: "test") {
          street
        }
      }
    `,
    );
    selections = input.A.selections;
  });

  it('returns a clone of the source, with the same name as the handle', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    const sourceField = selections.find(node => node.kind === LINKED_FIELD);
    const clone = cloneRelayHandleSourceField(handleField, selections);

    expect(clone.kind).toBe(LINKED_FIELD);
    expect(clone.name).toBe(getRelayHandleKey('test', null, 'address'));
    expect(clone.selections).toEqual(sourceField.selections);
  });

  it('throws if the source field is not present', () => {
    const handleField = selections.find(node => node.kind === LINKED_HANDLE);
    selections = selections.filter(node => node.kind === LINKED_HANDLE);

    expect(() =>
      cloneRelayHandleSourceField(handleField, selections),
    ).toFailInvariant(
      'cloneRelayHandleSourceField: Expected a corresponding source field ' +
        'for handle `test`.',
    );
  });
});

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

jest
  .dontMock('RelayMutation')
  .dontMock('buildRQL');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');
const fromGraphQL = require('fromGraphQL');

describe('RelayMutation', function() {
  var MockMutation;
  var mockBarPointer;
  var mockFooPointer;

  var {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    var makeMockMutation = () => {
      class MockMutationClass extends Relay.Mutation {}
      MockMutationClass.fragments = {
        bar: () => Relay.QL`
          fragment on Node {
            id,
          }
        `,
        foo: () => Relay.QL`
          fragment on Node {
            id,
          }
        `,
      };
      return MockMutationClass;
    };
    MockMutation = makeMockMutation();

    var mockBarRequiredFragment =
      MockMutation.getFragment('bar').getFragment({});
    var mockFooRequiredFragment =
      MockMutation.getFragment('foo').getFragment({});
    mockBarPointer = getPointer('bar', getNode(mockBarRequiredFragment));
    mockFooPointer = getPointer('foo', getNode(mockFooRequiredFragment));

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('resolves props', () => {
    /* eslint-disable no-new */
    new MockMutation({
      bar: mockBarPointer,
      foo: mockFooPointer,
    });
    /* eslint-enable no-new */
    expect(Relay.Store.read.mock.calls.length).toBe(2);

    var mockBarRequiredFragment = fromGraphQL.Fragment(buildRQL.Fragment(
      MockMutation.fragments.bar, []
    ));
    expect(Relay.Store.read.mock.calls[0]).toEqual(
      [mockBarRequiredFragment, 'bar']
    );
  });

  it('throws if mutation defines invalid `Relay.QL` fragment', () => {
    class BadMutation extends Relay.Mutation {}
    BadMutation.fragments = {
      foo: () => Relay.QL`query{node(id:"123"){id}}`,
    };
    var badFragmentReference = BadMutation.getFragment('foo');
    expect(() => {
      badFragmentReference.getFragment();
    }).toFailInvariant(
      'Relay.QL defined on mutation `BadMutation` named `foo` is not a valid ' +
      'fragment. A typical fragment is defined using: ' +
      'Relay.QL`fragment on Type {...}`'
    );
  });
});

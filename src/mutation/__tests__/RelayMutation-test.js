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

require('configureForRelayOSS');

jest
  .dontMock('RelayMutation');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');

describe('RelayMutation', function() {
  let MockMutation;
  let initialVariables;
  let mockBarPointer;
  let mockFooPointer;
  let mockRoute;

  const {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    initialVariables = {isRelative: false};

    var makeMockMutation = () => {
      class MockMutationClass extends Relay.Mutation {}
      MockMutationClass.fragments = {
        foo: () => Relay.QL`
          fragment on Comment {
            url(relative: $isRelative)
          }
        `,
        bar: () => Relay.QL`
          fragment on Node {
            id,
          }
        `,
      };
      MockMutationClass.initialVariables = initialVariables;
      return MockMutationClass;
    };
    MockMutation = makeMockMutation();

    var mockFooRequiredFragment =
      MockMutation.getFragment('foo').getFragment({});
    var mockBarRequiredFragment =
      MockMutation.getFragment('bar').getFragment({});
    mockFooPointer = getPointer('foo', getNode(mockFooRequiredFragment));
    mockBarPointer = getPointer('bar', getNode(mockBarRequiredFragment));

    // RelayMetaRoute.get(...)
    mockRoute = {name: '$RelayMutation_MockMutationClass'};

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('resolves props', () => {
    /* eslint-disable no-new */
    new MockMutation({
      bar: mockBarPointer,
      foo: mockFooPointer,
    });
    /* eslint-enable no-new */
    const fooFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockMutation.fragments.foo, initialVariables),
      mockRoute,
      initialVariables
    );
    const barFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockMutation.fragments.bar, initialVariables),
      mockRoute,
      initialVariables
    );
    expect(Relay.Store.read.mock.calls).toEqual([
      [/* fragment */fooFragment, /* dataID */'foo'],
      [/* fragment */barFragment, /* dataID */'bar'],
    ]);
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

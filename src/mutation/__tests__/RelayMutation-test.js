/**
 * Copyright 2013-2015, Facebook, Inc.
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
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');
const fromGraphQL = require('fromGraphQL');

describe('RelayMutation', function() {
  beforeEach(function() {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('resolves props', () => {
    class MockMutation extends Relay.Mutation {
      static fragments = {
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
    }

    const mockBarFragment = fromGraphQL.Fragment(buildRQL.Fragment(
      MockMutation.fragments.bar, []
    ));
    const mockFooFragment = fromGraphQL.Fragment(buildRQL.Fragment(
      MockMutation.fragments.foo, []
    ));
    const mockBarPointer = RelayTestUtils.getPointer('bar', mockBarFragment);
    const mockFooPointer = RelayTestUtils.getPointer('foo', mockFooFragment);

    const unresolvedProps = {
      bar: mockBarPointer,
      foo: mockFooPointer,
    };
    const resolvedProps = {
      bar: {},
      foo: {},
    };

    const storeData = new RelayStoreData();
    storeData.read = jest.genMockFunction();
    storeData.read.mockImplementation(({}, dataID) => resolvedProps[dataID]);

    const mockMutation = new MockMutation(unresolvedProps);
    const result = MockMutation.resolveProps(storeData, mockMutation);

    expect(storeData.read.mock.calls).toEqual([
      [mockBarFragment, 'bar'],
      [mockFooFragment, 'foo'],
    ]);

    expect(Object.keys(result)).toEqual(['bar', 'foo']);
    expect(result.bar).toBe(resolvedProps.bar);
    expect(result.foo).toBe(resolvedProps.foo);
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

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
const RelayContext = require('RelayContext');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');
const fromGraphQL = require('fromGraphQL');

describe('RelayMutation', function() {
  let mockBarFragment;
  let mockFooFragment;
  let mockMutation;
  let relayContext;

  beforeEach(function() {
    jest.resetModuleRegistry();

    relayContext = new RelayContext();
    relayContext.read = jest.genMockFunction();

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

    mockBarFragment = fromGraphQL.Fragment(buildRQL.Fragment(
      MockMutation.fragments.bar, []
    ));
    mockFooFragment = fromGraphQL.Fragment(buildRQL.Fragment(
      MockMutation.fragments.foo, []
    ));

    const mockBarPointer = RelayTestUtils.getPointer('bar', mockBarFragment);
    const mockFooPointer = RelayTestUtils.getPointer('foo', mockFooFragment);

    mockMutation = new MockMutation({
      bar: mockBarPointer,
      foo: mockFooPointer,
    });

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if used in different Relay contexts', () => {
    mockMutation.bindContext(relayContext);
    expect(() => {
      mockMutation.bindContext({});
    }).toFailInvariant(
      'MockMutation: Mutation instance cannot be used ' +
      'in different Relay contexts.'
    );
  });

  it('can be reused in the same Relay context', () => {
    mockMutation.bindContext(relayContext);
    expect(() => {
      mockMutation.bindContext(relayContext);
    }).not.toThrow();
  });

  it('does not resolve props before binding Relay context', () => {
    expect(mockMutation.props).toBeUndefined();
  });

  it('resolves props only once', () => {
    mockMutation.bindContext(relayContext);
    mockMutation.bindContext(relayContext);
    expect(relayContext.read.mock.calls).toEqual([
      [mockBarFragment, 'bar'],
      [mockFooFragment, 'foo'],
    ]);
  });

  it('resolves props after binding Relay context', () => {
    const resolvedProps = {
      bar: {},
      foo: {},
    };

    relayContext.read.mockImplementation(({}, dataID) => resolvedProps[dataID]);

    mockMutation.bindContext(relayContext);

    expect(relayContext.read.mock.calls).toEqual([
      [mockBarFragment, 'bar'],
      [mockFooFragment, 'foo'],
    ]);

    expect(mockMutation.props).toEqual(resolvedProps);
    expect(mockMutation.props.bar).toBe(resolvedProps.bar);
    expect(mockMutation.props.foo).toBe(resolvedProps.foo);
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

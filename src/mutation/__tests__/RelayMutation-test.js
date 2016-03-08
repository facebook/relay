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
const RelayContext = require('RelayContext');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');

describe('RelayMutation', function() {
  let mockBarFragment;
  let mockFooFragment;
  let mockMutation;
  let relayContext;

  const {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    relayContext = new RelayContext();
    relayContext.read = jest.genMockFunction();

    const initialVariables = {isRelative: false};

    const makeMockMutation = () => {
      class MockMutationClass extends Relay.Mutation {
        didResolveProps = jest.genMockFunction();
      }
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
    const MockMutation = makeMockMutation();

    const mockFooRequiredFragment =
      MockMutation.getFragment('foo').getFragment({});
    const mockBarRequiredFragment =
      MockMutation.getFragment('bar').getFragment({});
    const mockFooPointer = getPointer('foo', getNode(mockFooRequiredFragment));
    const mockBarPointer = getPointer('bar', getNode(mockBarRequiredFragment));

    // RelayMetaRoute.get(...)
    const mockRoute = {name: '$RelayMutation_MockMutationClass'};

    mockMutation = new MockMutation({
      bar: mockBarPointer,
      foo: mockFooPointer,
    });
    /* eslint-enable no-new */
    mockFooFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockMutation.fragments.foo, initialVariables),
      mockRoute,
      initialVariables
    );
    mockBarFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockMutation.fragments.bar, initialVariables),
      mockRoute,
      initialVariables
    );

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if used in different Relay contexts', () => {
    mockMutation.bindContext(relayContext);
    expect(() => {
      mockMutation.bindContext(new RelayContext());
    }).toFailInvariant(
      'MockMutationClass: Mutation instance cannot be used ' +
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
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
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
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
    ]);

    expect(mockMutation.props).toEqual(resolvedProps);
    expect(mockMutation.props.bar).toBe(resolvedProps.bar);
    expect(mockMutation.props.foo).toBe(resolvedProps.foo);
  });

  it('calls `didResolveProps` after resolving props', () => {
    const resolvedProps = {
      bar: {},
      foo: {},
    };

    relayContext.read.mockImplementation(({}, dataID) => resolvedProps[dataID]);

    mockMutation.didResolveProps.mockImplementation(function() {
      expect(this.props).toEqual(resolvedProps);
      expect(this.props.bar).toBe(resolvedProps.bar);
      expect(this.props.foo).toBe(resolvedProps.foo);
    });

    expect(mockMutation.didResolveProps).not.toBeCalled();

    mockMutation.bindContext(relayContext);

    expect(mockMutation.didResolveProps).toBeCalled();
  });

  it('calls `didResolveProps` only once', () => {
    mockMutation.bindContext(relayContext);
    mockMutation.bindContext(relayContext);

    expect(mockMutation.didResolveProps.mock.calls.length).toBe(1);
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

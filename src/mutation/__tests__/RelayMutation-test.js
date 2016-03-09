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
const RelayEnvironment = require('RelayEnvironment');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');

describe('RelayMutation', function() {
  let mockBarFragment;
  let mockFooFragment;
  let mockMutation;
  let environment;

  const {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    environment = new RelayEnvironment();
    environment.read = jest.genMockFunction();

    const initialVariables = {isRelative: false};

    const makeMockMutation = () => {
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
    mockMutation.bindContext(environment);
    expect(() => {
      mockMutation.bindContext(new RelayEnvironment());
    }).toFailInvariant(
      'MockMutationClass: Mutation instance cannot be used ' +
      'in different Relay contexts.'
    );
  });

  it('can be reused in the same Relay context', () => {
    mockMutation.bindContext(environment);
    expect(() => {
      mockMutation.bindContext(environment);
    }).not.toThrow();
  });

  it('does not resolve props before binding Relay context', () => {
    expect(mockMutation.props).toBeUndefined();
  });

  it('resolves props only once', () => {
    mockMutation.bindContext(environment);
    mockMutation.bindContext(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
    ]);
  });

  it('resolves props after binding Relay context', () => {
    const resolvedProps = {
      bar: {},
      foo: {},
    };
    environment.read.mockImplementation((_, dataID) => resolvedProps[dataID]);
    mockMutation.bindContext(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
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
    const badFragmentReference = BadMutation.getFragment('foo');
    expect(() => {
      badFragmentReference.getFragment();
    }).toFailInvariant(
      'Relay.QL defined on mutation `BadMutation` named `foo` is not a valid ' +
      'fragment. A typical fragment is defined using: ' +
      'Relay.QL`fragment on Type {...}`'
    );
  });
});

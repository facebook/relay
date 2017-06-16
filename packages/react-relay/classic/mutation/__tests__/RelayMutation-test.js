/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

jest.mock('warning');
jest.unmock('RelayMutation');

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

  function applyUpdate(mutation) {
    /* eslint-disable no-shadow */
    const RelayEnvironment = require.requireActual('RelayEnvironment');
    const environment = new RelayEnvironment();
    environment.applyUpdate(mutation);
    /* eslint-enable no-shadow */
  }

  beforeEach(function() {
    jest.resetModules();

    environment = new RelayEnvironment();
    environment.read = jest.fn();

    const initialVariables = {isRelative: false};
    const makeMockMutation = () => {
      class MockMutationClass extends Relay.Mutation {
        static initialVariables = initialVariables;
        static fragments = {
          foo: () => Relay.QL`
            fragment on Comment {
              url(relative: $isRelative)
            }
          `,
          bar: () => Relay.QL`
            fragment on Node {
              id
            }
          `,
        };

        getConfigs() {
          return [];
        }
      }
      return MockMutationClass;
    };
    const MockMutation = makeMockMutation();

    const mockFooRequiredFragment = MockMutation.getFragment('foo').getFragment(
      {},
    );
    const mockBarRequiredFragment = MockMutation.getFragment('bar').getFragment(
      {},
    );
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
      initialVariables,
    );
    mockBarFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockMutation.fragments.bar, initialVariables),
      mockRoute,
      initialVariables,
    );

    expect.extend(RelayTestUtils.matchers);
  });

  it('throws if used in different Relay environments', () => {
    mockMutation.bindEnvironment(environment);
    expect(() => {
      mockMutation.bindEnvironment(new RelayEnvironment());
    }).toFailInvariant(
      'MockMutationClass: Mutation instance cannot be used ' +
        'in different Relay environments.',
    );
  });

  it('can be reused in the same Relay environment', () => {
    mockMutation.bindEnvironment(environment);
    expect(() => {
      mockMutation.bindEnvironment(environment);
    }).not.toThrow();
  });

  it('does not resolve props before binding Relay environment', () => {
    expect(mockMutation.props).toBeUndefined();
  });

  it('resolves props only once', () => {
    mockMutation.bindEnvironment(environment);
    mockMutation.bindEnvironment(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */ mockFooFragment, /* dataID */ 'foo'],
      [/* fragment */ mockBarFragment, /* dataID */ 'bar'],
    ]);
  });

  it('resolves props after binding Relay environment', () => {
    const resolvedProps = {
      bar: {},
      foo: {},
    };
    environment.read.mockImplementation((_, dataID) => resolvedProps[dataID]);
    mockMutation.bindEnvironment(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */ mockFooFragment, /* dataID */ 'foo'],
      [/* fragment */ mockBarFragment, /* dataID */ 'bar'],
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
        'Relay.QL`fragment on Type {...}`',
    );
  });

  it('validates mutation configs when applied', () => {
    class MisconfiguredMutation extends Relay.Mutation {
      getConfigs() {
        return [
          {
            type: 'FIELDS_CHANGE',
            fieldIDS: ['4'],
          },
        ];
      }
    }

    // Can't validate at construction time because we haven't resolved props
    // yet, and the config may depend on those.
    expect(() => new MisconfiguredMutation({})).not.toThrow();

    expect(() => applyUpdate(new MisconfiguredMutation({}))).toFailInvariant(
      'validateMutationConfig: Unexpected key `fieldIDS` in ' +
        '`FIELDS_CHANGE` config for `MisconfiguredMutation`; did you mean ' +
        '`fieldIDs`?',
    );
  });

  it('complains if mutation configs are not provided', () => {
    class UnconfiguredMutation extends Relay.Mutation {}

    // Can't validate at construction time because we haven't resolved props
    // yet, and the config may depend on those.
    expect(() => new UnconfiguredMutation({})).not.toThrow();

    expect(() => applyUpdate(new UnconfiguredMutation({}))).toThrowError(
      'UnconfiguredMutation: Expected abstract method `getConfigs` to be ' +
        'implemented.',
    );
  });
});

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
  .unmock('RelaySubscription');

const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');

describe('RelaySubscription', () => {
  let mockBarFragment;
  let mockFooFragment;
  let mockSubscription;
  let environment;

  const {getNode, getPointer} = RelayTestUtils;

  function applyUpdate(mutation) {
    /* eslint-disable no-shadow */
    const RelayEnvironment = require.requireActual('RelayEnvironment');
    const environment = new RelayEnvironment();
    environment.applyUpdate(mutation);
    /* eslint-enable no-shadow */
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    environment = new RelayEnvironment();
    environment.read = jest.fn();

    const initialVariables = {isRelative: false};
    const makeMockSubscription = () => {
      class MockSubscriptionClass extends Relay.Subscription {
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
      return MockSubscriptionClass;
    };
    const MockSubscription = makeMockSubscription();

    const mockFooRequiredFragment =
      MockSubscription.getFragment('foo').getFragment({});
    const mockBarRequiredFragment =
      MockSubscription.getFragment('bar').getFragment({});
    const mockFooPointer = getPointer('foo', getNode(mockFooRequiredFragment));
    const mockBarPointer = getPointer('bar', getNode(mockBarRequiredFragment));

    // RelayMetaRoute.get(...)
    const mockRoute = {name: '$RelaySubscription_MockSubscriptionClass'};

    mockSubscription = new MockSubscription({
      bar: mockBarPointer,
      foo: mockFooPointer,
    });
    /* eslint-enable no-new */
    mockFooFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockSubscription.fragments.foo, initialVariables),
      mockRoute,
      initialVariables
    );
    mockBarFragment = RelayQuery.Fragment.create(
      buildRQL.Fragment(MockSubscription.fragments.bar, initialVariables),
      mockRoute,
      initialVariables
    );

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if used in different Relay environments', () => {
    mockSubscription.bindEnvironment(environment);
    expect(() => {
      mockSubscription.bindEnvironment(new RelayEnvironment());
    }).toFailInvariant(
      'MockSubscriptionClass: Subscription instance cannot be used ' +
      'in different Relay environments.'
    );
  });

  it('can be reused in the same Relay environment', () => {
    mockSubscription.bindEnvironment(environment);
    expect(() => {
      mockSubscription.bindEnvironment(environment);
    }).not.toThrow();
  });

  it('does not resolve props before binding Relay environment', () => {
    expect(mockSubscription.props).toBeUndefined();
  });

  it('resolves props only once', () => {
    mockSubscription.bindEnvironment(environment);
    mockSubscription.bindEnvironment(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
    ]);
  });

  it('resolves props after binding Relay environment', () => {
    const resolvedProps = {
      bar: {},
      foo: {},
    };
    environment.read.mockImplementation((_, dataID) => resolvedProps[dataID]);
    mockSubscription.bindEnvironment(environment);
    expect(environment.read.mock.calls).toEqual([
      [/* fragment */mockFooFragment, /* dataID */'foo'],
      [/* fragment */mockBarFragment, /* dataID */'bar'],
    ]);
    expect(mockSubscription.props).toEqual(resolvedProps);
    expect(mockSubscription.props.bar).toBe(resolvedProps.bar);
    expect(mockSubscription.props.foo).toBe(resolvedProps.foo);
  });

  it('throws if subscription defines invalid `Relay.QL` fragment', () => {
    class BadSubscription extends Relay.Subscription {}
    BadSubscription.fragments = {
      foo: () => Relay.QL`query{node(id:"123"){id}}`,
    };
    const badFragmentReference = BadSubscription.getFragment('foo');
    expect(() => {
      badFragmentReference.getFragment();
    }).toFailInvariant(
      'Relay.QL defined on subscription `BadSubscription` named `foo` is not a valid ' +
      'fragment. A typical fragment is defined using: ' +
      'Relay.QL`fragment on Type {...}`'
    );
  });

  it('validates subscription configs when applied', () => {
    class MisconfiguredSubscription extends Relay.Subscription {
      getConfigs() {
        return [{
          type: 'FIELDS_CHANGE',
          fieldIDS: ['4'],
        }];
      }
    }

    // Can't validate at construction time because we haven't resolved props
    // yet, and the config may depend on those.
    expect(() => new MisconfiguredSubscription({})).not.toThrow();

    expect(() => applyUpdate(new MisconfiguredSubscription({})))
      .toFailInvariant(
        'validateMutationConfig: Unexpected key `fieldIDS` in ' +
        '`FIELDS_CHANGE` config for `MisconfiguredSubscription`; did you mean ' +
        '`fieldIDs`?'
      );
  });
});

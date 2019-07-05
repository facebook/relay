/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernSelector = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const invariant = require('invariant');

const {generateAndCompile, matchers} = require('relay-test-utils-internal');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

// Regression test
describe('query with undeclared, unused fragment argument', () => {
  let environment;
  let fetch;
  let fragment;
  let innerFragment;
  let operation;
  let query;
  let source;
  let store;
  let subject;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(matchers);
    ({
      QueryWithUnusedFragmentArgumentDefinition: query,
      Profile: fragment,
      ProfilePhotoWrapper: innerFragment,
    } = generateAndCompile(`
        query QueryWithUnusedFragmentArgumentDefinition($id: ID!) {
          node(id: $id) {
            ...Profile
          }
        }

        fragment Profile on User {
          id
          name
          ...ProfilePhotoWrapper @arguments(size: $size)
        }

        fragment ProfilePhotoWrapper on User @argumentDefinitions(size: {type: "Int"}) {
          __typename
          ...ProfilePhoto @uncheckedArguments_DEPRECATED(size: $size)
        }

        fragment ProfilePhoto on User {
          profilePicture(size: [100]) {
            uri
          }
        }
      `));
    operation = createOperationDescriptor(query, {id: '4'});
    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        subject = sink;
      }),
    );
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create((fetch: $FlowFixMe)),
      store,
    });
  });

  it('reads results with the undeclared variable set to undefined', () => {
    environment.execute({operation}).subscribe({});
    subject.next({
      data: {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Zuck',
          profilePicture: {
            uri: 'https://facebook.com/zuck.jpg',
          },
        },
      },
    });
    subject.complete();
    const snapshot = environment.lookup(operation.fragment, operation);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      node: {
        __fragmentOwner: operation,
        __fragments: {
          Profile: {},
        },
        __id: '4',
      },
    });
    const fragmentSelector = RelayModernSelector.getSelector(
      operation.variables,
      fragment,
      (snapshot.data: $FlowFixMe).node,
      operation,
    );
    invariant(
      fragmentSelector != null && !Array.isArray(fragmentSelector),
      'Expected a singular selector.',
    );
    const fragmentSnapshot = environment.lookup(
      fragmentSelector.selector,
      fragmentSelector.owner,
    );
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      __id: '4',
      __fragmentOwner: operation,
      __fragments: {
        ProfilePhotoWrapper: {size: undefined},
      },
      id: '4',
      name: 'Zuck',
    });
    const innerSelector = RelayModernSelector.getSelector(
      operation.variables,
      innerFragment,
      (fragmentSnapshot.data: $FlowFixMe),
      operation,
    );
    invariant(
      innerSelector != null && !Array.isArray(innerSelector),
      'Expected a singular selector.',
    );
    const innerSnapshot = environment.lookup(
      innerSelector.selector,
      innerSelector.owner,
    );
    expect(innerSnapshot.isMissingData).toBe(false);
    expect(innerSnapshot.data).toEqual({
      __id: '4',
      __fragmentOwner: operation,
      __fragments: {
        ProfilePhoto: {size: undefined},
      },
      __typename: 'User',
    });
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernSelector = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const invariant = require('invariant');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {generateAndCompile} = require('relay-test-utils-internal');

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
    const snapshot = environment.lookup(operation.fragment);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      node: {
        __fragmentOwner: operation.request,

        __fragments: {
          Profile: {},
        },

        __id: '4',
      },
    });
    const fragmentSelector = RelayModernSelector.getSingularSelector(
      fragment,
      (snapshot.data: $FlowFixMe).node,
    );
    invariant(fragmentSelector != null, 'Expected a singular selector.');
    const fragmentSnapshot = environment.lookup(fragmentSelector);
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      __id: '4',
      __fragmentOwner: operation.request,

      __fragments: {
        ProfilePhotoWrapper: {size: undefined},
      },

      id: '4',
      name: 'Zuck',
    });
    const innerSelector = RelayModernSelector.getSingularSelector(
      innerFragment,
      (fragmentSnapshot.data: $FlowFixMe),
    );
    invariant(innerSelector != null, 'Expected a singular selector.');
    const innerSnapshot = environment.lookup(innerSelector);
    expect(innerSnapshot.isMissingData).toBe(false);
    expect(innerSnapshot.data).toEqual({
      __id: '4',
      __fragmentOwner: operation.request,

      __fragments: {
        ProfilePhoto: {size: undefined},
      },

      __typename: 'User',
    });
  });
});

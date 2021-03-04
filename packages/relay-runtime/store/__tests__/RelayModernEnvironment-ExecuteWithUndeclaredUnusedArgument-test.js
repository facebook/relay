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

const {graphql, getFragment, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');

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

    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestQueryWithUnusedFragmentArgumentDefinitionQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile
        }
      }
    `);

    fragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile on User {
        id
        name
        ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper
          @arguments(size: $size)
      }
    `);

    innerFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper on User
        @argumentDefinitions(size: {type: "Int"}) {
        __typename
        ...RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto
          @uncheckedArguments_DEPRECATED(size: $size)
      }
    `);

    graphql`
      fragment RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto on User {
        profilePicture(size: [100]) {
          uri
        }
      }
    `;
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
          RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfile: {},
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
        RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhotoWrapper: {
          size: undefined,
        },
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
        RelayModernEnvironmentExecuteWithUndeclaredUnusedArgumentTestProfilePhoto: {
          size: undefined,
        },
      },

      __typename: 'User',
    });
  });
});

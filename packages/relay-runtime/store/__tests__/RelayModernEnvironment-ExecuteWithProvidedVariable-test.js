/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';
import type {Sink} from '../../network/RelayObservable';
import type {ReaderFragment} from '../../util/ReaderNode';
import type {OperationDescriptor, Snapshot} from '../RelayStoreTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernSelector = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const invariant = require('invariant');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

function getEnvironment(
  operation: OperationDescriptor,
): RelayModernEnvironment {
  let subject;
  const fetch = jest.fn(
    (_query: $FlowFixMe, _variables: $FlowFixMe, _cacheConfig: $FlowFixMe) =>
      RelayObservable.create(
        (
          sink: Sink<{
            data: {
              node: {
                __typename: string,
                alternate_name: string,
                id: string,
                name: string,
                profilePicture: {uri: string},
                profile_picture: {uri: string},
                username: string,
              },
            },
          }>,
        ) => {
          subject = sink;
        },
      ),
  );
  const source = RelayRecordSource.create();
  const store = new RelayModernStore(source);
  const environment = new RelayModernEnvironment({
    network: RelayNetwork.create(fetch as $FlowFixMe),
    store,
  });
  environment.execute({operation}).subscribe({});
  invariant(subject != null, 'expected subject to be initialized');
  subject.next({
    data: {
      node: {
        __typename: 'User',
        alternate_name: 'testAlternateName',
        id: '1',
        name: 'testName',
        profile_picture: {
          uri: 'https://facebook.com/test_profile_picture.jpg',
        },
        profilePicture: {
          uri: 'https://facebook.com/test_profilePicture.jpg',
        },
        username: 'testUsername',
      },
    },
  });
  subject.complete();
  return environment;
}

function getFragmentSnapshot(
  environment: RelayModernEnvironment,
  querySnapshot: Snapshot,
  fragment: ReaderFragment,
): Snapshot {
  const fragmentSelector = RelayModernSelector.getSingularSelector(
    fragment,
    (querySnapshot.data as $FlowFixMe).node,
  );
  invariant(fragmentSelector != null, 'Expected a singular selector.');
  const fragmentSnapshot = environment.lookup(fragmentSelector);
  return fragmentSnapshot;
}

describe('query with fragments that use provided variables', () => {
  let environment;
  let fragment1;
  let fragment2;
  let fragment3;
  let operation;
  let queryUserArgSingleFragment;
  let queryUserArgManyFragments;

  beforeAll(() => {
    queryUserArgSingleFragment = graphql`
      query RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgSingleFragmentQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1
            @dangerously_unaliased_fixme
        }
      }
    `;

    queryUserArgManyFragments = graphql`
      query RelayModernEnvironmentExecuteWithProvidedVariableTest_UserArgManyFragmentsQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2
            @dangerously_unaliased_fixme
          ...RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3
            @dangerously_unaliased_fixme
        }
      }
    `;

    fragment1 = graphql`
      fragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1 on User
      @argumentDefinitions(
        includeName: {
          type: "Boolean!"
          provider: "./RelayProvider_returnsTrue.relayprovider"
        }
        skipUsername: {
          type: "Boolean!"
          provider: "./RelayProvider_returnsTrue.relayprovider"
        }
      ) {
        id
        name @include(if: $includeName)
        username @skip(if: $skipUsername)
        profilePicture {
          uri
        }
      }
    `;

    fragment2 = graphql`
      fragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2 on User
      @argumentDefinitions(
        includeName: {
          type: "Boolean!"
          provider: "./RelayProvider_returnsTrue.relayprovider"
        }
        # should be able to define two arguments that use the same provider
        includeAlternateName: {
          type: "Boolean!"
          provider: "./RelayProvider_returnsTrue.relayprovider"
        }
      ) {
        name @include(if: $includeName)
        alternate_name @include(if: $includeAlternateName)
      }
    `;

    fragment3 = graphql`
      fragment RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3 on User
      @argumentDefinitions(
        profilePictureScale: {
          type: "Float!"
          provider: "./RelayProvider_pictureScale.relayprovider"
        }
      ) {
        profile_picture(scale: $profilePictureScale) {
          uri
        }
      }
    `;
  });

  it('reads the right results from a query with one fragment spread', () => {
    operation = createOperationDescriptor(queryUserArgSingleFragment, {
      id: '1',
    });
    environment = getEnvironment(operation);
    const snapshot = environment.lookup(operation.fragment);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      node: {
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1: {},
        },
        __id: '1',
      },
    });
    const fragmentSnapshot = getFragmentSnapshot(
      environment,
      snapshot,
      fragment1,
    );
    expect(fragmentSnapshot.isMissingData).toBe(false);
    expect(fragmentSnapshot.data).toEqual({
      id: '1',
      name: 'testName',
      profilePicture: {
        uri: 'https://facebook.com/test_profilePicture.jpg',
      },
    });
  });

  it('reads the right results from a query with many fragment spreads', () => {
    operation = createOperationDescriptor(queryUserArgManyFragments, {
      id: '1',
    });
    environment = getEnvironment(operation);
    const snapshot = environment.lookup(operation.fragment);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      node: {
        __fragmentOwner: operation.request,
        __fragments: {
          RelayModernEnvironmentExecuteWithProvidedVariableTest_profile1: {},
          RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2: {},
          RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3: {},
        },
        __id: '1',
      },
    });
    const fragment1Snapshot = getFragmentSnapshot(
      environment,
      snapshot,
      fragment1,
    );
    expect(fragment1Snapshot.isMissingData).toBe(false);
    expect(fragment1Snapshot.data).toEqual({
      id: '1',
      name: 'testName',
      profilePicture: {
        uri: 'https://facebook.com/test_profilePicture.jpg',
      },
    });

    const fragment2Snapshot = getFragmentSnapshot(
      environment,
      snapshot,
      fragment2,
    );
    expect(fragment2Snapshot.isMissingData).toBe(false);
    expect(fragment2Snapshot.data).toEqual({
      alternate_name: 'testAlternateName',
      name: 'testName',
    });

    const fragment3Snapshot = getFragmentSnapshot(
      environment,
      snapshot,
      fragment3,
    );
    expect(fragment3Snapshot.isMissingData).toBe(false);
    expect(fragment3Snapshot.data).toEqual({
      profile_picture: {
        uri: 'https://facebook.com/test_profile_picture.jpg',
      },
    });
  });
});

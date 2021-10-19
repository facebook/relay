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

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'Conditional selections',
  environmentType => {
    let ConditionalQuery;
    let ConditionalFragment;
    let Query;
    let Fragment;
    let environment;
    let selector;

    describe(environmentType, () => {
      beforeEach(() => {
        ConditionalQuery = getRequest(graphql`
          query RelayModernEnvironmentConditionalSelectionsTestConditionalQuery(
            $condition: Boolean!
          ) {
            ...RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment
          }
        `);
        ConditionalFragment = getFragment(graphql`
          fragment RelayModernEnvironmentConditionalSelectionsTestQueryConditionalFragment on Query {
            ... @include(if: $condition) {
              viewer {
                actor {
                  name
                }
              }
            }
            ... @skip(if: $condition) {
              me {
                name
              }
            }
          }
        `);
        // A version of the same query/fragment where all selections are fetched unconditionally
        Query = getRequest(graphql`
          query RelayModernEnvironmentConditionalSelectionsTestUnconditionalQuery {
            ...RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment
          }
        `);
        Fragment = getFragment(graphql`
          fragment RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment on Query {
            viewer {
              actor {
                name
              }
            }
            me {
              name
            }
          }
        `);

        const source = RelayRecordSource.create();
        const store = new RelayModernStore(source, {
          gcReleaseBufferSize: 0,
        });
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(jest.fn()),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(jest.fn()),
                store,
              });

        const operation = createOperationDescriptor(Query, {});
        const snapshot = environment.lookup(operation.fragment);
        selector = nullthrows(getSingularSelector(Fragment, snapshot.data));
      });

      // Commit the given payload, immediately running GC to prune any data
      // that wouldn't be retained by the query
      // eslint-disable-next-line no-shadow
      function commitPayload(operation, payload) {
        environment.retain(operation);
        environment.commitPayload(operation, payload);
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
      }

      it('normalizes and reads data when the condition is true', () => {
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: true,
        });
        commitPayload(operation, {
          viewer: {
            actor: {
              id: '0',
              __typename: 'User',
              name: 'Alice',
            },
          },
        });
        // Check that the correct data was written into the store
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          viewer: {
            actor: {
              name: 'Alice',
            },
          },
          me: undefined,
        });
        // Check that the correct data was retained
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: expect.anything(),
        });

        // Check that reader reads the correct selections
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSelector = nullthrows(
          getSingularSelector(ConditionalFragment, querySnapshot.data),
        );
        const fragmentSnapshot = environment.lookup(fragmentSelector);
        expect(fragmentSnapshot.data).toEqual({
          viewer: {
            actor: {
              name: 'Alice',
            },
          },
          // no 'me' field
        });
      });

      it('normalizes and reads data when the condition is false', () => {
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: false,
        });
        commitPayload(operation, {
          me: {
            id: '1',
            name: 'Bob',
          },
        });
        // Check that the correct data was written into the store
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          viewer: undefined,
          me: {
            name: 'Bob',
          },
        });
        // Check that the correct data was retained
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: expect.anything(),
        });

        // Check that reader reads the correct selections
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSelector = nullthrows(
          getSingularSelector(ConditionalFragment, querySnapshot.data),
        );
        const fragmentSnapshot = environment.lookup(fragmentSelector);
        expect(fragmentSnapshot.data).toEqual({
          // no 'viewer' field
          me: {
            name: 'Bob',
          },
        });
      });

      it('normalizes and reads data when the condition is null', () => {
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: null,
        });
        commitPayload(operation, {
          me: {
            id: '1',
            name: 'Bob',
          },
        });
        // Check that the correct data was written into the store
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          viewer: undefined,
          me: {
            name: 'Bob',
          },
        });
        // Check that the correct data was retained
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: expect.anything(),
        });

        // Check that reader reads the correct selections
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSelector = nullthrows(
          getSingularSelector(ConditionalFragment, querySnapshot.data),
        );
        const fragmentSnapshot = environment.lookup(fragmentSelector);
        expect(fragmentSnapshot.data).toEqual({
          // no 'viewer' field
          me: {
            name: 'Bob',
          },
        });
      });

      it('normalizes and reads data when the condition is unset', () => {
        const operation = createOperationDescriptor(ConditionalQuery, {
          /* condition is unset */
        });
        commitPayload(operation, {
          me: {
            id: '1',
            name: 'Bob',
          },
        });
        // Check that the correct data was written into the store
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          viewer: undefined,
          me: {
            name: 'Bob',
          },
        });
        // Check that the correct data was retained
        expect(environment.check(operation)).toEqual({
          status: 'available',
          fetchTime: expect.anything(),
        });

        // Check that reader reads the correct selections
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSelector = nullthrows(
          getSingularSelector(ConditionalFragment, querySnapshot.data),
        );
        const fragmentSnapshot = environment.lookup(fragmentSelector);
        expect(fragmentSnapshot.data).toEqual({
          // no 'viewer' field
          me: {
            name: 'Bob',
          },
        });
      });

      it('checks missing data when the condition is true', () => {
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `viewer: viewer`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: true,
        });
        commitPayload(operation, {
          /* intentionally missing data */
        });
        // DataChecker should consider this missing since the @include(if: true) fields should be evaluated
        // and are missing
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      it('checks missing data when the condition is false', () => {
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `me: me`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: false,
        });
        commitPayload(operation, {
          /* intentionally missing data */
        });
        // DataChecker should consider this missing since the @skip(if: false) fields should be evaluated
        // and are missing
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      it('checks missing data when the condition is null', () => {
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `me: me`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        const operation = createOperationDescriptor(ConditionalQuery, {
          condition: null,
        });
        commitPayload(operation, {
          /* intentionally missing data */
        });
        // DataChecker should consider this missing since the @skip(if: null) fields should be evaluated
        // and are missing
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      it('checks missing data when the condition is unset', () => {
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `me: me`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        const operation = createOperationDescriptor(ConditionalQuery, {
          /* condition is unset */
        });
        commitPayload(operation, {
          /* intentionally missing data */
        });
        // DataChecker should consider this missing since the @skip(if: undefined) fields should be evaluated
        // and are missing
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });
    });
  },
);

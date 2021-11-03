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
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {RelayFeatureFlags} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  '@connection',
  environmentType => {
    let callbacks;
    let dataSource;
    let environment;
    let fragment;
    let operation;
    let query;

    describe(environmentType, () => {
      beforeEach(() => {
        RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;

        query = getRequest(graphql`
          query RelayModernEnvironmentConnectionAndRequiredTestFeedbackQuery(
            $id: ID!
          ) {
            node(id: $id) {
              ...RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment
            }
          }
        `);
        fragment = getFragment(graphql`
          fragment RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment on Feedback
          @argumentDefinitions(
            count: {type: "Int", defaultValue: 2}
            cursor: {type: "ID"}
          ) {
            id
            comments(after: $cursor, first: $count, orderby: "date")
              @connection(
                key: "RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment_comments"
                filters: ["orderby"]
              )
              @required(action: LOG) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `);
        const variables = {
          id: '<feedbackid>',
        };
        operation = createOperationDescriptor(query, variables);

        const complete = jest.fn();
        const error = jest.fn();
        const next = jest.fn();
        callbacks = {complete, error, next};
        const fetch = jest.fn((_query, _variables, _cacheConfig) => {
          return RelayObservable.create(sink => {
            dataSource = sink;
          });
        });
        const source = RelayRecordSource.create();
        const store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                store,
              });
      });

      it('When a field is @required and a @connection _and_ null, it bubbles null up to its parent', () => {
        const operationSnapshot = environment.lookup(operation.fragment);
        const operationCallback = jest.fn();
        environment.subscribe(operationSnapshot, operationCallback);

        environment.execute({operation}).subscribe(callbacks);
        const payload = {
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: null,
            },
          },
        };
        dataSource.next(payload);
        jest.runAllTimers();

        const nextOperationSnapshot = operationCallback.mock.calls[0][0];
        const selector = nullthrows(
          getSingularSelector(fragment, nextOperationSnapshot.data?.node),
        );
        const snapshot = environment.lookup(selector);
        expect(snapshot.missingRequiredFields).toEqual({
          action: 'LOG',
          fields: [
            {
              owner:
                'RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment',
              path: 'comments',
            },
          ],
        });
        expect(snapshot.data).toEqual(null);
      });
    });
  },
);

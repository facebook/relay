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

// flowlint ambiguous-object-type:error

'use strict';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {RelayFeatureFlags} = require('relay-runtime');
const {disallowWarnings, expectToWarn} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'executeMutation() with Flight field',
  environmentType => {
    let callbacks;
    let complete;
    let environment;
    let error;
    let fetch;
    let innerQueryOperation;
    let innerQueryVariables;
    let next;
    let operation;
    let operationLoader;
    let queryOperation;
    let queryVariables;
    let reactFlightPayloadDeserializer;
    let RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery;
    let RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery;
    let RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation;
    let source;
    let store;
    let storyID;
    let subject;
    let variables;

    describe(environmentType, () => {
      beforeEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

        storyID = 'story-id';

        RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation =
          getRequest(graphql`
            mutation RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation(
              $input: StoryUpdateInput!
              $count: Int!
            ) {
              storyUpdate(input: $input) {
                story {
                  id
                  body {
                    text
                  }
                  flightComponent(condition: true, count: $count, id: "x")
                }
              }
            }
          `);

        RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery =
          getRequest(graphql`
            query RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery(
              $id: ID!
              $count: Int!
            ) {
              node(id: $id) {
                ... on Story {
                  flightComponent(condition: true, count: $count, id: "x")
                }
              }
            }
          `);

        RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery =
          getRequest(graphql`
            query RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery(
              $id: ID!
            ) {
              node(id: $id) {
                ... on User {
                  name
                }
              }
            }
          `);
        variables = {
          input: {
            clientMutationId: '0',
            body: {
              text: 'Hello world!',
            },
          },
          count: 5,
        };
        queryVariables = {
          id: storyID,
          count: 5,
        };
        innerQueryVariables = {
          id: '2',
        };

        reactFlightPayloadDeserializer = jest.fn(payload => {
          return {
            readRoot() {
              return payload;
            },
          };
        });
        complete = jest.fn();
        error = jest.fn();
        next = jest.fn();
        callbacks = {complete, error, next};
        fetch = (_query, _variables, _cacheConfig) => {
          return RelayObservable.create(sink => {
            subject = sink;
          });
        };
        operationLoader = {
          load: jest.fn(() =>
            Promise.resolve(
              RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery,
            ),
          ),
          get: jest.fn(
            () =>
              RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery,
          ),
        };
        source = RelayRecordSource.create();
        store = new RelayModernStore(source, {operationLoader});
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
          operationLoader,
          reactFlightPayloadDeserializer,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                operationLoader,
                store,
                reactFlightPayloadDeserializer,
              });

        operation = createOperationDescriptor(
          RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation,
          variables,
        );
        queryOperation = createOperationDescriptor(
          RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery,
          queryVariables,
        );
        innerQueryOperation = createOperationDescriptor(
          RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery,
          innerQueryVariables,
        );

        environment.execute({operation: queryOperation}).subscribe({});
        subject.next({
          data: {
            node: {
              id: storyID,
              __typename: 'Story',
              flightComponent: {
                status: 'SUCCESS',
                tree: [
                  {
                    type: 'div',
                    key: null,
                    ref: null,
                    props: {foo: 1},
                  },
                ],
                queries: [
                  {
                    id: 'b0dbe24703062b69e6b1d0c38c4f69d2',
                    module: {__dr: 'RelayFlightExampleQuery.graphql'},
                    response: {
                      data: {
                        node: {
                          id: '2',
                          name: 'Lauren',
                          __typename: 'User',
                        },
                      },
                      extensions: [],
                    },
                    variables: {
                      id: '2',
                    },
                  },
                ],
                errors: [],
                fragments: [],
              },
            },
          },
        });
        jest.runAllTimers();
      });
      afterEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
      });

      describe('when successful', () => {
        it('updates Flight fields that were previously queried for', () => {
          // precondition - FlightQuery
          const snapshot = environment.lookup(queryOperation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);
          // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
          expect(snapshot.data.node.flightComponent.readRoot()).toEqual([
            {key: null, props: {foo: 1}, ref: null, type: 'div'},
          ]);

          // precondition - InnerQuery
          const innerSnapshot = environment.lookup(
            innerQueryOperation.fragment,
          );
          const innerCallback = jest.fn();
          environment.subscribe(innerSnapshot, innerCallback);
          expect(innerSnapshot.data).toEqual({node: {name: 'Lauren'}});

          environment.executeMutation({operation}).subscribe(callbacks);
          callback.mockClear();
          subject.next({
            data: {
              storyUpdate: {
                story: {
                  id: storyID,
                  body: {
                    text: 'Hello world!',
                  },
                  __typename: 'Story',
                  flightComponent: {
                    status: 'SUCCESS',
                    tree: [
                      {
                        type: 'div',
                        key: null,
                        ref: null,
                        props: {foo: 2, bar: 'abc', baz: [1, 2, 3]}, // updated
                      },
                    ],
                    queries: [
                      {
                        id: 'b0dbe24703062b69e6b1d0c38c4f69d2',
                        module: {__dr: 'RelayFlightExampleQuery.graphql'},
                        response: {
                          data: {
                            node: {
                              id: '2',
                              name: 'Lauren Tan',
                              __typename: 'User',
                            },
                          },
                          extensions: [],
                        },
                        variables: {
                          id: '2',
                        },
                      },
                    ],
                    errors: [],
                    fragments: [],
                  },
                },
              },
            },
          });
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(callback).toHaveBeenCalledTimes(1);
          expect(
            // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
            callback.mock.calls[0][0].data.node.flightComponent.readRoot(),
          ).toEqual([
            {
              key: null,
              props: {foo: 2, bar: 'abc', baz: [1, 2, 3]},
              ref: null,
              type: 'div',
            },
          ]);

          // This verifies that data for client components included in the payload are
          // also updated as a result of the mutation.
          expect(innerCallback).toHaveBeenCalledTimes(1);
          expect(innerCallback).toHaveBeenLastCalledWith(
            expect.objectContaining({
              data: {
                node: {
                  name: 'Lauren Tan',
                },
              },
            }),
          );
        });
      });

      describe('when server errors are encountered', () => {
        describe('and ReactFlightServerErrorHandler is specified', () => {
          let reactFlightServerErrorHandler;
          beforeEach(() => {
            reactFlightServerErrorHandler = jest.fn((status, errors) => {
              const err = new Error(`${status}: ${errors[0].message}`);
              err.stack = errors[0].stack;
              throw err;
            });
            const multiActorEnvironment = new MultiActorEnvironment({
              createNetworkForActor: _actorID => RelayNetwork.create(fetch),
              createStoreForActor: _actorID => store,
              operationLoader,
              reactFlightPayloadDeserializer,
              reactFlightServerErrorHandler,
            });
            environment =
              environmentType === 'MultiActorEnvironment'
                ? multiActorEnvironment.forActor(
                    getActorIdentifier('actor:1234'),
                  )
                : new RelayModernEnvironment({
                    network: RelayNetwork.create(fetch),
                    operationLoader,
                    store,
                    reactFlightPayloadDeserializer,
                    reactFlightServerErrorHandler,
                  });
          });
          it('calls ReactFlightServerErrorHandler', () => {
            // precondition - FlightQuery
            const snapshot = environment.lookup(queryOperation.fragment);
            const callback = jest.fn();
            environment.subscribe(snapshot, callback);
            // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
            expect(snapshot.data.node.flightComponent.readRoot()).toEqual([
              {key: null, props: {foo: 1}, ref: null, type: 'div'},
            ]);

            // precondition - InnerQuery
            const innerSnapshot = environment.lookup(
              innerQueryOperation.fragment,
            );
            const innerCallback = jest.fn();
            environment.subscribe(innerSnapshot, innerCallback);
            expect(innerSnapshot.data).toEqual({node: {name: 'Lauren'}});

            environment.executeMutation({operation}).subscribe(callbacks);
            callback.mockClear();
            subject.next({
              data: {
                storyUpdate: {
                  story: {
                    id: storyID,
                    body: {
                      text: 'Hello world!',
                    },
                    __typename: 'Story',
                    flightComponent: {
                      status: 'FAIL_JS_ERROR',
                      tree: [],
                      queries: [],
                      errors: [
                        {
                          message: 'Something threw an error on the server',
                          stack: 'Error\n    at <anonymous>:1:1',
                        },
                      ],
                      fragments: [],
                    },
                  },
                },
              },
            });
            subject.complete();

            expect(complete).not.toBeCalled();
            expect(error).toBeCalled();
            expect(callback).toHaveBeenCalledTimes(0);
            expect(reactFlightServerErrorHandler).toHaveBeenCalledWith(
              'FAIL_JS_ERROR',
              expect.arrayContaining([
                expect.objectContaining({
                  message: 'Something threw an error on the server',
                  stack: 'Error\n    at <anonymous>:1:1',
                }),
              ]),
            );
          });
        });
        describe('and no ReactFlightServerErrorHandler is specified', () => {
          it('warns', () => {
            // precondition - FlightQuery
            const snapshot = environment.lookup(queryOperation.fragment);
            const callback = jest.fn();
            environment.subscribe(snapshot, callback);
            // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
            expect(snapshot.data.node.flightComponent.readRoot()).toEqual([
              {key: null, props: {foo: 1}, ref: null, type: 'div'},
            ]);

            // precondition - InnerQuery
            const innerSnapshot = environment.lookup(
              innerQueryOperation.fragment,
            );
            const innerCallback = jest.fn();
            environment.subscribe(innerSnapshot, innerCallback);
            expect(innerSnapshot.data).toEqual({node: {name: 'Lauren'}});

            environment.executeMutation({operation}).subscribe(callbacks);
            callback.mockClear();
            expectToWarn(
              `RelayResponseNormalizer: Received server errors for field \`flightComponent\`.

Something threw an error on the server
Error
    at <anonymous>:1:1`,
              () => {
                subject.next({
                  data: {
                    storyUpdate: {
                      story: {
                        id: storyID,
                        body: {
                          text: 'Hello world!',
                        },
                        __typename: 'Story',
                        flightComponent: {
                          status: 'FAIL_JS_ERROR',
                          tree: [],
                          queries: [],
                          errors: [
                            {
                              message: 'Something threw an error on the server',
                              stack: 'Error\n    at <anonymous>:1:1',
                            },
                          ],
                          fragments: [],
                        },
                      },
                    },
                  },
                });
              },
            );
            subject.complete();

            expect(complete).toBeCalled();
            expect(error).not.toBeCalled();
            expect(callback).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('when the row protocol is malformed', () => {
        it('warns when the row protocol is null', () => {
          // precondition - FlightQuery
          const snapshot = environment.lookup(queryOperation.fragment);
          const callback = jest.fn();
          environment.subscribe(snapshot, callback);
          // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
          expect(snapshot.data.node.flightComponent.readRoot()).toEqual([
            {key: null, props: {foo: 1}, ref: null, type: 'div'},
          ]);

          // precondition - InnerQuery
          const innerSnapshot = environment.lookup(
            innerQueryOperation.fragment,
          );
          const innerCallback = jest.fn();
          environment.subscribe(innerSnapshot, innerCallback);
          expect(innerSnapshot.data).toEqual({node: {name: 'Lauren'}});

          environment.executeMutation({operation}).subscribe(callbacks);
          callback.mockClear();
          expectToWarn(
            'RelayResponseNormalizer: Expected `tree` not to be null. This typically indicates that a fatal server error prevented any Server Component rows from being written.',
            () => {
              subject.next({
                data: {
                  storyUpdate: {
                    story: {
                      id: storyID,
                      body: {
                        text: 'Hello world!',
                      },
                      __typename: 'Story',
                      flightComponent: {
                        status: 'UNEXPECTED_ERROR',
                        tree: null,
                        queries: [],
                        errors: [],
                        fragments: [],
                      },
                    },
                  },
                },
              });
            },
          );
          subject.complete();

          expect(complete).toBeCalled();
          expect(error).not.toBeCalled();
          expect(innerCallback).toHaveBeenCalledTimes(0);
          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            node: {flightComponent: null},
          });
          expect(callback.mock.calls[0][0].isMissingData).toEqual(false);

          // Server Component is read out as null
          const latestSnapshot = environment.lookup(queryOperation.fragment);
          expect(latestSnapshot.isMissingData).toEqual(false);
          expect(latestSnapshot.data).toEqual({
            node: {
              flightComponent: null,
            },
          });
        });
      });
    });
  },
);

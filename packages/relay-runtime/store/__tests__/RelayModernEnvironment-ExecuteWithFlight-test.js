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
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';

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
  'execute() with Flight field',
  environmentType => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let FlightQuery;
    let innerOperation;
    let InnerQuery;
    let next;
    let operation;
    let operationLoader;
    let reactFlightPayloadDeserializer;
    let source;
    let store;

    describe(environmentType, () => {
      beforeEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

        FlightQuery = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithFlightTestFlightQuery(
            $id: ID!
            $count: Int!
          ) {
            node(id: $id) {
              ... on Story {
                flightComponent(condition: true, count: $count, id: $id)
              }
            }
          }
        `);

        InnerQuery = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithFlightTestInnerQuery(
            $id: ID!
          ) {
            node(id: $id) {
              ... on User {
                name
              }
            }
          }
        `);

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
        fetch = (
          _query: RequestParameters,
          _variables: Variables,
          _cacheConfig: CacheConfig,
        ) => {
          return RelayObservable.create(sink => {
            dataSource = sink;
          });
        };
        operationLoader = {
          load: jest.fn(() => Promise.resolve(InnerQuery)),
          get: jest.fn(() => InnerQuery),
        };
        source = RelayRecordSource.create();
        // DataChecker receives its operationLoader from the store, not the
        // environment. So we have to pass it here as well.
        store = new RelayModernStore(source, {
          operationLoader,
          gcReleaseBufferSize: 0,
        });
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

        operation = createOperationDescriptor(FlightQuery, {
          count: 10,
          id: '1',
        });
        innerOperation = createOperationDescriptor(InnerQuery, {id: '2'});
      });
      afterEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
      });

      it('loads the Flight field and normalizes/publishes the field payload', () => {
        environment.retain(operation);
        environment.execute({operation}).subscribe(callbacks);
        const payload = {
          data: {
            node: {
              id: '1',
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
        };
        dataSource.next(payload);
        jest.runAllTimers();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(reactFlightPayloadDeserializer).toBeCalledTimes(1);

        store.scheduleGC();
        jest.runAllTimers();

        expect(environment.lookup(innerOperation.fragment).data).toEqual({
          node: {
            name: 'Lauren',
          },
        });
        expect(
          environment
            .lookup(operation.fragment)
            // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
            .data.node.flightComponent.readRoot(),
        ).toEqual([{key: null, props: {foo: 1}, ref: null, type: 'div'}]);
      });

      it('updates the Flight field on refetch', () => {
        environment.retain(operation);
        environment.execute({operation}).subscribe(callbacks);
        const initialPayload = {
          data: {
            node: {
              id: '1',
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
        };
        const nextPayload = {
          data: {
            node: {
              id: '1',
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
        };
        dataSource.next(initialPayload);
        jest.runAllTimers();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(reactFlightPayloadDeserializer).toBeCalledTimes(1);

        store.scheduleGC(); // Invoke gc to verify that data is retained
        jest.runAllTimers();

        expect(environment.lookup(innerOperation.fragment).data).toEqual({
          node: {
            name: 'Lauren',
          },
        });

        dataSource.next(nextPayload);
        jest.runAllTimers();

        expect(next).toBeCalledTimes(2);
        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(reactFlightPayloadDeserializer).toBeCalledTimes(2);
        expect(
          environment
            .lookup(operation.fragment)
            // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
            .data.node.flightComponent.readRoot(),
        ).toEqual([
          {
            key: null,
            props: {foo: 2, bar: 'abc', baz: [1, 2, 3]},
            ref: null,
            type: 'div',
          },
        ]);
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
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                node: {
                  id: '1',
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
            };
            dataSource.next(payload);
            jest.runAllTimers();

            expect(next).toBeCalledTimes(0);
            expect(complete).toBeCalledTimes(0);
            expect(error).toBeCalledTimes(1);
            expect(reactFlightPayloadDeserializer).toBeCalledTimes(0);
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

        describe('no ReactFlightServerErrorHandler is specified', () => {
          it('warns', () => {
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                node: {
                  id: '1',
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
            };
            expectToWarn(
              `RelayResponseNormalizer: Received server errors for field \`flightComponent\`.

Something threw an error on the server
Error
    at <anonymous>:1:1`,
              () => {
                dataSource.next(payload);
              },
            );
            jest.runAllTimers();

            expect(next).toBeCalledTimes(1);
            expect(complete).toBeCalledTimes(0);
            expect(error).toBeCalledTimes(0);
            expect(reactFlightPayloadDeserializer).toBeCalledTimes(1);
          });
        });
      });

      describe('when checking availability', () => {
        it('returns available if all data exists in the environment', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
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
          };
          dataSource.next(payload);
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({
            status: 'available',
            fetchTime: null,
          });
          expect(environment.check(innerOperation)).toEqual({
            status: 'available',
            fetchTime: null,
          });
        });

        it('returns missing if `tree` is null in the payload', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'Story',
                flightComponent: {
                  status: 'SUCCESS',
                  tree: null,
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
          };

          expectToWarn(
            'RelayResponseNormalizer: Expected `tree` not to be null. This typically indicates that a fatal server error prevented any Server Component rows from being written.',
            () => {
              dataSource.next(payload);
            },
          );
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
          expect(environment.check(innerOperation)).toEqual({
            status: 'missing',
          });
        });

        it('returns missing if `queries` is null in the payload', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
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
                  queries: null,
                  errors: [],
                  fragments: [],
                },
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
          expect(environment.check(innerOperation)).toEqual({
            status: 'missing',
          });
        });

        it('returns missing if the inner query is missing data', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
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
                            // name: 'Lauren',
                            __typename: 'User',
                          },
                        },
                        extensions: [],
                      },
                      variables: {
                        id: '3',
                      },
                    },
                  ],
                  errors: [],
                  fragments: [],
                },
              },
            },
          };
          expectToWarn(
            'RelayResponseNormalizer: Payload did not contain a value for field `name: name`. Check that you are parsing with the same query that was used to fetch the payload.',
            () => {
              dataSource.next(payload);
            },
          );
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
          expect(environment.check(innerOperation)).toEqual({
            status: 'missing',
          });
        });

        it('returns missing if the response is undefined', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'Story',
                flightComponent: undefined,
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();

          expect(next).toBeCalledTimes(0);
          expect(complete).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(1);
          expect(error).toHaveBeenLastCalledWith(
            expect.objectContaining({
              message: expect.stringMatching(
                /Payload did not contain a value for field/,
              ),
            }),
          );
          expect(reactFlightPayloadDeserializer).toBeCalledTimes(0);

          const snapshot = environment.lookup(operation.fragment);
          expect(snapshot.data).toMatchInlineSnapshot(`
        Object {
          "node": undefined,
        }
      `);
          expect(snapshot.isMissingData).toEqual(true);
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
        });

        it('returns available if the response is null', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'Story',
                flightComponent: null,
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();

          expect(next).toBeCalledTimes(1);
          expect(complete).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(0);
          expect(reactFlightPayloadDeserializer).toBeCalledTimes(0);

          const snapshot = environment.lookup(operation.fragment);
          expect(snapshot.data).toMatchInlineSnapshot(`
        Object {
          "node": Object {
            "flightComponent": null,
          },
        }
      `);
          expect(snapshot.isMissingData).toEqual(false);
          expect(environment.check(operation)).toEqual({
            status: 'available',
            fetchTime: null,
          });
        });
      });

      describe('when the response is malformed', () => {
        it('warns if the row protocol is null', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
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
          };
          expectToWarn(
            'RelayResponseNormalizer: Expected `tree` not to be null. This typically indicates that a fatal server error prevented any Server Component rows from being written.',
            () => {
              dataSource.next(payload);
            },
          );
          jest.runAllTimers();

          expect(next).toBeCalledTimes(1);
          expect(complete).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(0);
          expect(reactFlightPayloadDeserializer).toBeCalledTimes(0);

          // Server Component is read out as null
          const snapshot = environment.lookup(operation.fragment);
          expect(snapshot.isMissingData).toEqual(false);
          expect(snapshot.data).toEqual({
            node: {
              flightComponent: null,
            },
          });
        });
      });
    });
  },
);

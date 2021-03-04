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
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const warning = require('warning');

const {graphql, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {RelayFeatureFlags} = require('relay-runtime');

describe('execute() with Flight field', () => {
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

  beforeEach(() => {
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.resetModules();

    // Note: This must come after `jest.resetModules()`.
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
      query RelayModernEnvironmentExecuteWithFlightTestInnerQuery($id: ID!) {
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
    fetch = (_query, _variables, _cacheConfig) => {
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
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      operationLoader,
      store,
      reactFlightPayloadDeserializer,
    });
    operation = createOperationDescriptor(FlightQuery, {count: 10, id: '1'});
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
    beforeEach(() => {
      jest.mock('warning');
    });

    describe('and ReactFlightServerErrorHandler is specified', () => {
      let reactFlightServerErrorHandler;
      beforeEach(() => {
        reactFlightServerErrorHandler = jest.fn((status, errors) => {
          const err = new Error(`${status}: ${errors[0].message}`);
          err.stack = errors[0].stack;
          throw err;
        });
        environment = new RelayModernEnvironment({
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
        expect(warning).toHaveBeenCalledWith(
          false,
          expect.stringContaining(
            'RelayResponseNormalizer: Received server errors for field `%s`.',
          ),
          'flightComponent',
          expect.stringContaining('Something threw an error on the server'),
          expect.stringContaining('Error\n    at <anonymous>:1:1'),
        );
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
  });

  describe('when the row protocol is malformed', () => {
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
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
      expect(reactFlightPayloadDeserializer).toBeCalledTimes(0);
      expect(warning).toHaveBeenCalledWith(
        false,
        expect.stringContaining(
          'RelayResponseNormalizer: Expected `tree` not to be null.',
        ),
      );
    });
  });
});

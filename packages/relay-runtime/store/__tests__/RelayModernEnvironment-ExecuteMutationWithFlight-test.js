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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {RelayFeatureFlags} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('executeMutation() with Flight field', () => {
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

  beforeEach(() => {
    jest.resetModules();

    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

    storyID = 'story-id';

    ({
      RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation,
      RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery,
      RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery,
    } = generateAndCompile(`
      mutation RelayModernEnvironmentExecuteMutationWithFlightTest_UpdateStoryMutation(
        $input: StoryUpdateInput!,
        $count: Int!
      ) {
        storyUpdate(input: $input) {
          story {
            id
            body {
              text
            }
            flightComponent(condition: true, count: $count)
          }
        }
      }

      query RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery(
        $id: ID!,
        $count: Int!
      ) {
        node(id: $id) {
          ... on Story {
            flightComponent(condition: true, count: $count)
          }
        }
      }

      query RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on User {
            name
          }
        }
      }

      extend type Story {
        flightComponent(
          condition: Boolean!
          count: Int!
        ): ReactFlightComponent
          @react_flight_component(name: "FlightComponent.server")
      }
    `));
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
        () => RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery,
      ),
    };
    source = RelayRecordSource.create();
    store = new RelayModernStore(source, {operationLoader});
    environment = new RelayModernEnvironment({
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
          },
        },
      },
    });
    jest.runAllTimers();
  });

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
    const innerSnapshot = environment.lookup(innerQueryOperation.fragment);
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

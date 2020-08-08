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

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {RelayFeatureFlags} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

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
    jest.resetModules();

    // Note: This must come after `jest.resetModules()`.
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

    ({InnerQuery, FlightQuery} = generateAndCompile(`
      query FlightQuery($id: ID!, $count: Int!) {
        node(id: $id) {
          ... on Story {
            flightComponent(condition: true, count: $count, id: $id)
          }
        }
      }

      query InnerQuery($id: ID!) {
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
          id: ID!
        ): ReactFlightComponent
          @react_flight_component(name: "FlightComponent.server")
      }
      `));

    reactFlightPayloadDeserializer = jest.fn(() => {
      return {
        readRoot() {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'div',
            key: null,
            ref: null,
            props: {foo: 1},
          };
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
    store = new RelayModernStore(source);
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

  it('loads the Flight field and normalizes the field payload', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
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
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(next).toBeCalledTimes(1);
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(reactFlightPayloadDeserializer).toBeCalledTimes(1);
    expect(environment.lookup(innerOperation.fragment).data).toEqual({
      node: {
        name: 'Lauren',
      },
    });
    expect(source.toJSON()).toMatchInlineSnapshot(`
      Object {
        "1": Object {
          "__id": "1",
          "__typename": "Story",
          "flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})": Object {
            "__ref": "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})",
          },
          "id": "1",
        },
        "2": Object {
          "__id": "2",
          "__typename": "User",
          "id": "2",
          "name": "Lauren",
        },
        "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})": Object {
          "__id": "client:1:flight(component:\\"FlightComponent.server\\",props:{\\"condition\\":true,\\"count\\":10,\\"id\\":\\"1\\"})",
          "__typename": "ReactFlightComponent",
          "queries": Array [
            Object {
              "module": Object {
                "__dr": "RelayFlightExampleQuery.graphql",
              },
              "variables": Object {
                "id": "2",
              },
            },
          ],
          "tree": Object {
            "readRoot": [Function],
          },
        },
        "client:root": Object {
          "__id": "client:root",
          "__typename": "__Root",
          "node(id:\\"1\\")": Object {
            "__ref": "1",
          },
          "node(id:\\"2\\")": Object {
            "__ref": "2",
          },
        },
      }
    `);
  });
});

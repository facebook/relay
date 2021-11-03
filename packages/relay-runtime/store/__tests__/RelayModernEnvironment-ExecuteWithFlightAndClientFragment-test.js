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
  'execute() with Flight field and client fragment',
  environmentType => {
    let callbacks;
    let ClientFragment;
    let ClientNormalizationFragment;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let FlightQuery;
    let next;
    let operation;
    let operationLoader;
    let reactFlightPayloadDeserializer;
    let resolveFragment;
    let source;
    let store;

    describe(environmentType, () => {
      beforeEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;

        FlightQuery = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestFlightQuery(
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

        ClientNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$normalization.graphql');
        ClientFragment = getFragment(graphql`
          fragment RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment on Story {
            name
            body {
              text
            }
          }
        `);
        // Query that indirectly executed as a result of selecting the
        // `flightComponent` field.
        graphql`
          query RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery(
            $id: ID!
          ) {
            node(id: $id) {
              ...RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment
                @relay_client_component
            }
          }
        `;

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
          load: jest.fn(moduleName => {
            return new Promise(resolve => {
              resolveFragment = resolve;
            });
          }),
          get: jest.fn(),
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
      });
      afterEach(() => {
        RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
      });

      it('loads the Flight field and normalizes/publishes the field payload', () => {
        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
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
                queries: [],
                errors: [],
                fragments: [
                  {
                    module: {
                      __dr: 'RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$normalization.graphql',
                    },
                    __id: '3',
                    __typename: 'Story',
                    response: {
                      data: {
                        id: '3',
                        __typename: 'Story',
                        name: 'React Server Components: The Musical',
                        body: {
                          text: 'Presenting a new musical from the director of Cats (2019)!',
                        },
                      },
                    },
                    variables: {
                      id: '3',
                    },
                  },
                ],
              },
            },
          },
          extensions: {
            is_final: true,
          },
        });
        dataSource.complete();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(reactFlightPayloadDeserializer).toBeCalledTimes(1);

        const querySnapshot = environment.lookup(operation.fragment);
        expect(
          // $FlowFixMe[incompatible-use] readRoot() to verify that it updated
          querySnapshot.data.node?.flightComponent.readRoot(),
        ).toEqual([{key: null, props: {foo: 1}, ref: null, type: 'div'}]);

        // This is the fragment ref we expect to be sent via the Server
        // Component as a prop to the Client Component
        const fragmentRef = {
          __id: '3',
          __fragments: {[ClientFragment.name]: {}},
          __fragmentOwner: operation.request,
        };
        const selector = nullthrows(
          getSingularSelector(ClientFragment, fragmentRef),
        );
        const initialFragmentSnapshot = environment.lookup(selector);
        // Expect isMissingData initially as we have yet to receive the fragment's
        // SplitNormalization AST
        expect(initialFragmentSnapshot.isMissingData).toBe(true);

        resolveFragment(ClientNormalizationFragment);
        jest.runAllTimers();

        const fragmentSnapshot = environment.lookup(selector);
        expect(fragmentSnapshot.isMissingData).toBe(false);
        expect(fragmentSnapshot.data).toEqual({
          name: 'React Server Components: The Musical',
          body: {
            text: 'Presenting a new musical from the director of Cats (2019)!',
          },
        });
      });
    });
  },
);

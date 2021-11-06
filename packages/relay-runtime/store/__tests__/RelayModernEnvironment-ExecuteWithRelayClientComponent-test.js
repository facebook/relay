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
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() with @relay_client_component', () => {
  let callbacks;
  let ClientFragment;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let network;
  let next;
  let operation;
  let operationLoader;
  let Query;
  let shouldProcessClientComponents;
  let source;
  let store;

  beforeEach(() => {
    ClientFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment on Story {
        name
        body {
          text
        }
      }
    `);
    Query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment
            @relay_client_component
        }
      }
    `);

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = (_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    };
    network = RelayNetwork.create(fetch);
    source = RelayRecordSource.create();
    operationLoader = {
      load: jest.fn(),
      get: jest.fn(),
    };
    operation = createOperationDescriptor(Query, {id: '1'});
  });
  afterEach(() => {
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
  });

  describe('when the query contains @relay_client_component spreads', () => {
    describe('and client component processing is enabled', () => {
      beforeEach(() => {
        shouldProcessClientComponents = true;
        store = new RelayModernStore(source, {
          operationLoader,
          shouldProcessClientComponents,
          gcReleaseBufferSize: 0,
        });
        environment = new RelayModernEnvironment({
          network,
          operationLoader,
          store,
          shouldProcessClientComponents,
        });
      });
      it('executes and reads back results', () => {
        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            node: {
              id: '1',
              __typename: 'Story',
              name: 'React Server Components: The Musical',
              body: {
                text: 'Presenting a new musical from the director of Cats (2019)!',
              },
            },
          },
          extensions: {
            is_final: true,
          },
        });
        dataSource.complete();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(1);
        expect(error).toBeCalledTimes(0);

        const querySnapshot = environment.lookup(operation.fragment);
        expect(querySnapshot.data).toEqual({
          node: {
            __id: '1',
            __fragments: {
              [ClientFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });

        // fragment data is present
        const selector = nullthrows(
          getSingularSelector(
            ClientFragment,
            (querySnapshot.data?.node: $FlowFixMe),
          ),
        );
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          name: 'React Server Components: The Musical',
          body: {
            text: 'Presenting a new musical from the director of Cats (2019)!',
          },
        });
        expect(snapshot.isMissingData).toBe(false);

        // available before a GC
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // available after GC if the query is retained
        const retain = environment.retain(operation);
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // missing after being freed plus a GC run
        retain.dispose();
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      it('handles missing fragment data', () => {
        environment.execute({operation}).subscribe(callbacks);
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `name: name`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `body: body`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        dataSource.next({
          data: {
            node: {
              id: '1',
              __typename: 'Story',
            },
          },
          extensions: {
            is_final: true,
          },
        });
        dataSource.complete();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(1);
        expect(error).toBeCalledTimes(0);

        const querySnapshot = environment.lookup(operation.fragment);
        expect(querySnapshot.data).toEqual({
          node: {
            __id: '1',
            __fragments: {
              [ClientFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });

        // fragment data is missing
        const selector = nullthrows(
          getSingularSelector(
            ClientFragment,
            (querySnapshot.data?.node: $FlowFixMe),
          ),
        );
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          name: undefined,
          body: undefined,
        });
        expect(snapshot.isMissingData).toBe(true);
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });
    });

    describe('and client component processing is disabled', () => {
      beforeEach(() => {
        shouldProcessClientComponents = false;
        store = new RelayModernStore(source, {
          operationLoader,
          shouldProcessClientComponents,
          gcReleaseBufferSize: 0,
        });
        environment = new RelayModernEnvironment({
          network,
          operationLoader,
          store,
          shouldProcessClientComponents,
        });
      });
      it('executes and reads back results', () => {
        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            node: {
              id: '1',
              __typename: 'Story',
            },
          },
        });
        dataSource.complete();

        expect(next).toBeCalledTimes(1);
        expect(complete).toBeCalledTimes(1);
        expect(error).toBeCalledTimes(0);

        const querySnapshot = environment.lookup(operation.fragment);
        expect(querySnapshot.data).toEqual({
          node: {
            __id: '1',
            __fragments: {
              [ClientFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });

        // fragment data is not present
        const selector = nullthrows(
          getSingularSelector(
            ClientFragment,
            (querySnapshot.data?.node: $FlowFixMe),
          ),
        );
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual({
          body: undefined,
          name: undefined,
        });
        expect(snapshot.isMissingData).toBe(true);

        // fragment data is missing (intentionally), because this is a server
        // query, and we never need client fragment data. the operation should
        // still be considered available before a GC
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // available after GC if the query is retained
        const retain = environment.retain(operation);
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // missing after being freed plus a GC run
        retain.dispose();
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });
    });
  });
});

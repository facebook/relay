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
import type {
  LogRequestInfoFunction,
  UploadableMap,
} from '../../../relay-runtime/network/RelayNetworkTypes';
import type {RequestParameters} from '../../../relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from '../../../relay-runtime/util/RelayRuntimeTypes';
import type {PreloadableConcreteRequest} from '../EntryPointTypes.flow';
import type {
  loadQueryStoreBehaviorTestQuery,
  loadQueryStoreBehaviorTestQuery$data,
  loadQueryStoreBehaviorTestQuery$variables,
} from './__generated__/loadQueryStoreBehaviorTestQuery.graphql';
import type {GraphQLSingularResponse} from 'relay-runtime/network/RelayNetworkTypes';
import type {Sink} from 'relay-runtime/network/RelayObservable';
import type {Query} from 'relay-runtime/util/RelayRuntimeTypes';

const {loadQuery} = require('../loadQuery');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  createMockEnvironment,
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

const query = graphql`
  query loadQueryStoreBehaviorTestQuery($id: ID!) {
    node(id: $id) {
      name
      id
    }
  }
`;

// Only queries with an ID are preloadable
const ID = '12345';
(query.params as $FlowFixMe).id = ID;

const preloadableConcreteRequest: PreloadableConcreteRequest<loadQueryStoreBehaviorTestQuery> =
  {
    kind: 'PreloadableConcreteRequest',
    params: query.params,
  };

const response: GraphQLSingularResponse = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zuck',
    },
  },
  extensions: {
    is_final: true,
  },
};

const updatedResponse: GraphQLSingularResponse = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Mark',
    },
  },
  extensions: {
    is_final: true,
  },
};

const variables = {id: '4'};
let sink;
let fetch;
let environment;
let store;
let operation;
let resolvedModule: ?Query<
  loadQueryStoreBehaviorTestQuery$variables,
  loadQueryStoreBehaviorTestQuery$data,
>;
let writeDataToStore;

beforeEach(() => {
  operation = createOperationDescriptor(query, variables);
  fetch = jest.fn(
    (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
      _uploadables: ?UploadableMap,
      _logRequestInfo: ?LogRequestInfoFunction,
    ) => {
      const observableCreate = Observable.create(
        (_sink: Sink<GraphQLSingularResponse>) => {
          sink = _sink;
        },
      );
      return observableCreate;
    },
  );
  environment = createMockEnvironment({network: Network.create(fetch)});
  store = environment.getStore();

  jest.clearAllTimers();
  jest.useFakeTimers();
  resolvedModule = query;

  jest
    .spyOn(PreloadableQueryRegistry, 'get')
    .mockImplementation(() => resolvedModule);

  writeDataToStore = () => {
    loadQuery(environment, preloadableConcreteRequest, variables);
    sink.next(response);
    sink.complete();
    PreloadableQueryRegistry.set(ID, query);
    expect(store.check(operation).status).toBe('available');
    const snapshot: $FlowFixMe = store.lookup(operation.fragment);
    expect(snapshot?.data?.node?.name).toEqual('Zuck');
  };
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('when passed a PreloadableConcreteRequest', () => {
  describe('when the data is not available in the store', () => {
    describe('when the query AST is not available synchronously', () => {
      beforeEach(() => {
        resolvedModule = undefined;
      });
      it('should write the data to the store after the query AST and network response are available', () => {
        expect(store.check(operation).status).toBe('missing');
        loadQuery(environment, preloadableConcreteRequest, variables);
        expect(fetch).toHaveBeenCalled();
        expect(store.check(operation).status).toBe('missing');
        PreloadableQueryRegistry.set(ID, query);
        expect(store.check(operation).status).toBe('missing');
        sink.next(response);
        expect(store.check(operation).status).toBe('available');
      });

      it('should write the data to the store after the network response and query AST are available', () => {
        expect(store.check(operation).status).toBe('missing');
        loadQuery(environment, preloadableConcreteRequest, variables);
        expect(store.check(operation).status).toBe('missing');
        sink.next(response);
        expect(store.check(operation).status).toBe('missing');
        PreloadableQueryRegistry.set(ID, query);
        expect(store.check(operation).status).toBe('available');
      });

      it('should not write the data to the store if dispose is called before the query AST and network response are available', () => {
        expect(store.check(operation).status).toBe('missing');
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
        );
        expect(store.check(operation).status).toBe('missing');
        dispose();
        PreloadableQueryRegistry.set(ID, query);
        sink.next(response);
        expect(store.check(operation).status).toBe('missing');
      });

      it('should not write the data to the store if dispose is called before the network response and query AST are available', () => {
        expect(store.check(operation).status).toBe('missing');
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
        );
        expect(store.check(operation).status).toBe('missing');
        dispose();
        sink.next(response);
        PreloadableQueryRegistry.set(ID, query);
        expect(store.check(operation).status).toBe('missing');
      });

      it('should not write the data to the store if dispose is called after the query AST is available, but before the network response is available', () => {
        expect(store.check(operation).status).toBe('missing');
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
        );
        expect(store.check(operation).status).toBe('missing');
        PreloadableQueryRegistry.set(ID, query);
        dispose();
        sink.next(response);
        expect(store.check(operation).status).toBe('missing');
      });

      it('should not write the data to the store if dispose is called after the network response is available, but before the query AST is available', () => {
        expect(store.check(operation).status).toBe('missing');
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
        );
        expect(store.check(operation).status).toBe('missing');
        sink.next(response);
        dispose();
        PreloadableQueryRegistry.set(ID, query);
        expect(store.check(operation).status).toBe('missing');
      });
    });

    describe('when the query AST is available synchronously', () => {
      it('should write data to the store when the network response is available', () => {
        expect(store.check(operation).status).toBe('missing');
        loadQuery(environment, preloadableConcreteRequest, variables);
        sink.next(response);
        expect(store.check(operation).status).toBe('available');
      });

      it('should not write data to the store if dispose is called before the network response is available', () => {
        expect(store.check(operation).status).toBe('missing');
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
        );
        dispose();
        sink.next(response);
        expect(store.check(operation).status).toBe('missing');
      });
    });
  });

  describe("when data is already available in the store, but the fetch policy is 'network-only'", () => {
    beforeEach(() => writeDataToStore());
    describe('when the query AST is available synchronously', () => {
      it('should write updated data to the store when the network response is available', () => {
        loadQuery(environment, preloadableConcreteRequest, variables, {
          fetchPolicy: 'network-only',
        });

        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Mark');
      });

      it('should not write updated data to the store if dispose is called before the network response is available', () => {
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'network-only',
          },
        );

        dispose();
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
      });
    });
    describe('when the query AST is not available synchronously', () => {
      beforeEach(() => {
        resolvedModule = undefined;
      });
      it('should write updated data to the store when the network response and query AST are available', () => {
        loadQuery(environment, preloadableConcreteRequest, variables, {
          fetchPolicy: 'network-only',
        });

        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);

        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Mark');
      });
      it('should write updated data to the store when the query AST and network response are available', () => {
        loadQuery(environment, preloadableConcreteRequest, variables, {
          fetchPolicy: 'network-only',
        });

        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);

        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Mark');
      });

      it('should not write updated data to the store if dispose is called before the network response and query AST are available', () => {
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'network-only',
          },
        );

        dispose();
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
      });

      it('should not write updated data to the store if dispose is called before the query AST and network response are available', () => {
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'network-only',
          },
        );

        dispose();
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
      });

      it('should not write updated data to the store if dispose is called after the query AST is available and before the network response is available', () => {
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'network-only',
          },
        );

        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        dispose();
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
      });

      it('should not write updated data to the store if dispose is called after ·the network repsonse is available and before the query AST is available', () => {
        const {dispose} = loadQuery(
          environment,
          preloadableConcreteRequest,
          variables,
          {
            fetchPolicy: 'network-only',
          },
        );

        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        dispose();
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
      });
    });
  });
});

describe('when passed a query AST', () => {
  describe('when data is unavailable in the store', () => {
    it('should write data to the store when the network response is available', () => {
      expect(store.check(operation).status).toBe('missing');
      loadQuery(environment, query, variables);
      sink.next(response);
      expect(store.check(operation).status).toBe('available');
    });

    it('should not write data to the store if dispose is called before the network response is available', () => {
      expect(store.check(operation).status).toBe('missing');
      const {dispose} = loadQuery(environment, query, variables);
      dispose();
      sink.next(response);
      expect(store.check(operation).status).toBe('missing');
    });
  });
  describe("when data is available in the store, but the fetch policy is 'network-only'", () => {
    beforeEach(() => writeDataToStore());
    it('should write updated data to the store when the network response is available', () => {
      loadQuery(environment, query, variables, {
        fetchPolicy: 'network-only',
      });

      expect(
        (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
      ).toEqual('Zuck');
      sink.next(updatedResponse);
      expect(
        (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
      ).toEqual('Mark');
    });

    it('should not write updated data to the store if dispose is called before the network response is available', () => {
      const {dispose} = loadQuery(environment, query, variables, {
        fetchPolicy: 'network-only',
      });

      dispose();
      sink.next(updatedResponse);
      expect(
        (store.lookup(operation.fragment) as $FlowFixMe)?.data?.node?.name,
      ).toEqual('Zuck');
    });
  });
});

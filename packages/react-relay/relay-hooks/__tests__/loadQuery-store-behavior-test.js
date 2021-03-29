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

const {loadQuery} = require('../loadQuery');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

const query = getRequest(graphql`
  query loadQueryStoreBehaviorTestQuery($id: ID!) {
    node(id: $id) {
      name
      id
    }
  }
`);

// Only queries with an ID are preloadable
const ID = '12345';
(query.params: $FlowFixMe).id = ID;

const preloadableConcreteRequest = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

const response = {
  data: {
    node: {
      __typename: 'User',
      name: 'Zuck',
      id: '4',
    },
  },
  extensions: {
    is_final: true,
  },
};

const updatedResponse = {
  data: {
    node: {
      __typename: 'User',
      name: 'Mark',
      id: '4',
    },
  },
  extensions: {
    is_final: true,
  },
};

const variables = {id: '4'};
let sink;
let observable;
let fetch;
let environment;
let store;
let operation;
let resolvedModule;
let writeDataToStore;

beforeEach(() => {
  operation = createOperationDescriptor(query, variables);
  observable = undefined;
  fetch = jest.fn((_query, _variables, _cacheConfig) => {
    observable = Observable.create(_sink => {
      sink = _sink;
    });
    return observable;
  });
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);

        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Mark');
      });
      it('should write updated data to the store when the query AST and network response are available', () => {
        loadQuery(environment, preloadableConcreteRequest, variables, {
          fetchPolicy: 'network-only',
        });

        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);

        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        dispose();
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        sink.next(updatedResponse);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        dispose();
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
        ).toEqual('Zuck');
        PreloadableQueryRegistry.set(ID, query);
        expect(
          (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
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
        (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
      ).toEqual('Zuck');
      sink.next(updatedResponse);
      expect(
        (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
      ).toEqual('Mark');
    });

    it('should not write updated data to the store if dispose is called before the network response is available', () => {
      const {dispose} = loadQuery(environment, query, variables, {
        fetchPolicy: 'network-only',
      });

      dispose();
      sink.next(updatedResponse);
      expect(
        (store.lookup(operation.fragment): $FlowFixMe)?.data?.node?.name,
      ).toEqual('Zuck');
    });
  });
});

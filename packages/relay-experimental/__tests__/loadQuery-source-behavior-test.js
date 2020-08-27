/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {loadQuery} = require('../loadQuery');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
  createOperationDescriptor,
} = require('relay-runtime');
const {
  generateAndCompile,
  createMockEnvironment,
} = require('relay-test-utils-internal');

import type {
  LoadQueryOptions,
  PreloadableConcreteRequest,
} from '../EntryPointTypes.flow';
import type {
  ConcreteRequest,
  OperationType,
  GraphQLTaggedNode,
} from 'relay-runtime';

const query: ConcreteRequest = generateAndCompile(`
  query TestQuery($id: ID!) {
    node(id: $id) {
      id
    }
  }
`).TestQuery;

const preloadableConcreteRequest = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

const response = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
    },
  },
  extensions: {
    is_final: true,
  },
};

const networkError = new Error('A wild, uncaught error appeared');

// Only queries with an ID are preloadable
const ID = '12345';
(query.params: $FlowFixMe).id = ID;

const variables = {id: '4'};

let callLoadQuery;
let environment;
let fetch;
let writeDataToStore;
let sink;
let next;
let error;

beforeEach(() => {
  PreloadableQueryRegistry.clear();

  fetch = jest.fn((_query, _variables, _cacheConfig) => {
    return Observable.create(_sink => {
      sink = _sink;
    });
  });

  environment = createMockEnvironment({network: Network.create(fetch)});
  const store = environment.getStore();
  const operation = createOperationDescriptor(query, variables);

  writeDataToStore = () => {
    loadQuery(environment, preloadableConcreteRequest, variables);
    sink.next(response);
    sink.complete();
    PreloadableQueryRegistry.set(ID, query);
    expect(store.check(operation).status).toBe('available');
    // N.B. we are not testing the case where data is written to the store
    // from other sources after loadQuery is complete, so clearing the
    // PreloadableQueryRegistry is a sane thing to do.
    PreloadableQueryRegistry.clear();
  };

  callLoadQuery = <TQuery: OperationType>(
    queryAstOrRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
    options?: LoadQueryOptions,
  ) => {
    const loadedQuery = loadQuery(
      environment,
      queryAstOrRequest,
      variables,
      options,
    );
    expect(fetch).toHaveBeenCalled();

    next = jest.fn();
    error = jest.fn();
    if (loadedQuery.source) {
      loadedQuery.source.subscribe({
        next,
        error,
      });
    }

    return loadedQuery;
  };
});

describe('when passed a PreloadableConcreteRequest', () => {
  describe('when the query AST is available synchronously', () => {
    it('should pass network responses onto source', () => {
      PreloadableQueryRegistry.set(ID, query);
      callLoadQuery(preloadableConcreteRequest);

      expect(next).not.toHaveBeenCalled();
      sink.next(response);
      expect(next).toHaveBeenCalledWith(response);
    });

    it('should dedupe network request if called multiple times', () => {
      PreloadableQueryRegistry.set(ID, query);
      callLoadQuery(preloadableConcreteRequest);
      callLoadQuery(preloadableConcreteRequest);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should pass network errors onto source', () => {
      PreloadableQueryRegistry.set(ID, query);
      callLoadQuery(preloadableConcreteRequest);

      expect(error).not.toHaveBeenCalled();
      sink.error(networkError);
      expect(error).toHaveBeenCalledWith(networkError);
    });

    describe('when dispose is called before the network response is available', () => {
      it('should not pass network responses onto source', () => {
        PreloadableQueryRegistry.set(ID, query);
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.next(response);
        expect(next).not.toHaveBeenCalled();
      });
      it('should not pass network errors onto source', () => {
        PreloadableQueryRegistry.set(ID, query);
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the query is unavailable synchronously', () => {
    it('should dedupe operation execution if called multiple times', () => {
      callLoadQuery(preloadableConcreteRequest);
      callLoadQuery(preloadableConcreteRequest);

      // Note: before we have the operation module is available
      // we can't reliably dedupe network requests, since the
      // request identifier is based on the variables the
      // operation expects, and not just the variables passed as
      // input.
      expect(fetch).toHaveBeenCalledTimes(2);

      PreloadableQueryRegistry.set(ID, query);
      // We only process the network request once.
      expect(environment.executeWithSource).toBeCalledTimes(1);
    });

    describe('when the query AST is available before the network response', () => {
      it('should pass network responses onto source', () => {
        callLoadQuery(preloadableConcreteRequest);

        expect(next).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(next).not.toHaveBeenCalled();
        sink.next(response);
        expect(next).toHaveBeenCalledWith(response);
      });
      it('should pass network errors onto source', () => {
        callLoadQuery(preloadableConcreteRequest);

        expect(error).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(error).not.toHaveBeenCalled();
        sink.error(networkError);
        expect(error).toHaveBeenCalledWith(networkError);
      });
    });

    describe('when the network response is available before the query AST', () => {
      it('should pass network responses onto source', () => {
        callLoadQuery(preloadableConcreteRequest);

        expect(next).not.toHaveBeenCalled();
        sink.next(response);
        expect(next).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(next).toHaveBeenCalledWith(response);
      });
      it('should pass network errors onto source', () => {
        callLoadQuery(preloadableConcreteRequest);

        expect(error).not.toHaveBeenCalled();
        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(error).toHaveBeenCalledWith(networkError);
      });
    });

    describe('when dispose is called before the query AST and network response are available', () => {
      it('should not pass network responses onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.next(response);
        expect(next).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(next).not.toHaveBeenCalled();
      });
      it('should not pass network errors onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(error).not.toHaveBeenCalled();
      });
    });
    describe('when dispose is called before the network response and query AST are available', () => {
      it('should not pass network responses onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.next(response);
        expect(next).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(next).not.toHaveBeenCalled();
      });
      it('should not pass network errors onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        dispose();
        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(error).not.toHaveBeenCalled();
      });
    });
    describe('when dispose is called after the network response and before the query AST are available', () => {
      it('should not pass network responses onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        sink.next(response);
        expect(next).not.toHaveBeenCalled();
        dispose();
        expect(next).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(next).not.toHaveBeenCalled();
      });
      it('should not pass network errors onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
        dispose();
        expect(error).not.toHaveBeenCalled();
        PreloadableQueryRegistry.set(ID, query);
        expect(error).not.toHaveBeenCalled();
      });
    });
    describe('when dispose is called after the query AST and before the network response are available', () => {
      it('should not pass network responses onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        PreloadableQueryRegistry.set(ID, query);
        expect(next).not.toHaveBeenCalled();
        dispose();
        sink.next(response);
        expect(next).not.toHaveBeenCalled();
      });
      it('should not pass network errors onto source', () => {
        const {dispose} = callLoadQuery(preloadableConcreteRequest);

        PreloadableQueryRegistry.set(ID, query);
        expect(error).not.toHaveBeenCalled();
        dispose();
        sink.error(networkError);
        expect(error).not.toHaveBeenCalled();
      });
    });
  });
});

describe('when passed a query AST', () => {
  it('should pass network responses onto source', () => {
    callLoadQuery(query);

    expect(next).not.toHaveBeenCalled();
    sink.next(response);
    expect(next).toHaveBeenCalledWith(response);
  });

  it('should pass network errors onto source', () => {
    callLoadQuery(query);

    expect(error).not.toHaveBeenCalled();
    sink.error(networkError);
    expect(error).toHaveBeenCalledWith(networkError);
  });

  describe('when dispose is called before the network response is available', () => {
    it('should not pass network responses onto source', () => {
      const {dispose} = callLoadQuery(query);

      dispose();
      sink.next(response);
      expect(next).not.toHaveBeenCalled();
    });
    it('should not pass network errors onto source', () => {
      const {dispose} = callLoadQuery(query);

      dispose();
      sink.error(networkError);
      expect(error).not.toHaveBeenCalled();
    });
  });
});

describe("with the query fulfillable from the store and fetchPolicy === 'network-only'", () => {
  it('should pass network responses onto source', () => {
    writeDataToStore();
    PreloadableQueryRegistry.set(ID, query);
    callLoadQuery(preloadableConcreteRequest, {fetchPolicy: 'network-only'});

    expect(next).not.toHaveBeenCalled();
    sink.next(response);
    expect(next).toHaveBeenCalledWith(response);
  });

  it('should pass network errors onto source', () => {
    writeDataToStore();
    PreloadableQueryRegistry.set(ID, query);
    callLoadQuery(preloadableConcreteRequest, {fetchPolicy: 'network-only'});

    expect(error).not.toHaveBeenCalled();
    sink.error(networkError);
    expect(error).toHaveBeenCalledWith(networkError);
  });

  describe('when dispose is called before the network response is available', () => {
    it('should not pass network responses onto source', () => {
      writeDataToStore();
      PreloadableQueryRegistry.set(ID, query);
      const {dispose} = callLoadQuery(preloadableConcreteRequest, {
        fetchPolicy: 'network-only',
      });

      dispose();
      sink.next(response);
      expect(next).not.toHaveBeenCalled();
    });
    it('should not pass network errors onto source', () => {
      writeDataToStore();
      PreloadableQueryRegistry.set(ID, query);
      const {dispose} = callLoadQuery(preloadableConcreteRequest, {
        fetchPolicy: 'network-only',
      });

      dispose();
      sink.error(networkError);
      expect(error).not.toHaveBeenCalled();
    });
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const loadEntryPoint = require('../loadEntryPoint');
const {createMockEnvironment} = require('relay-test-utils-internal');

class FakeJSResource<T> {
  _resolve: (T => mixed) | null;
  _resource: T | null;
  getModuleId: () => string;
  getModuleIfRequired: () => T | null;
  load: () => Promise<T>;
  resolve: T => void;

  constructor(resource: T | null) {
    this._resolve = null;
    this._resource = resource;

    this.getModuleId = jest.fn(() => 'TheModuleID');
    this.getModuleIfRequired = jest.fn(() => this._resource);
    this.load = jest.fn(() => {
      return new Promise(resolve => {
        this._resolve = resolve;
      });
    });
    this.resolve = nextResource => {
      this._resource = nextResource;
      const resolve = this._resolve;
      if (resolve) {
        this._resolve = null;
        resolve(nextResource);
      }
    };
  }
}

test('it should preload entry point with queries', () => {
  const env = createMockEnvironment();
  const networkSpy = jest.spyOn(env.getNetwork(), 'execute');
  const entryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myTestQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'my-persisted-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const preloadedEntryPoint = loadEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
  expect(networkSpy).toBeCalledTimes(1);
  expect(preloadedEntryPoint.queries.myTestQuery.name).toBe('MyPreloadedQuery');
  expect(preloadedEntryPoint.queries.myTestQuery.variables).toEqual({
    id: 'my-id',
  });
  expect(preloadedEntryPoint.entryPoints).toEqual({});
});

describe('with respect to loadQuery', () => {
  let mockLoadedQuery;
  const loadQuery = jest.fn().mockImplementation(() => {
    return mockLoadedQuery;
  });
  beforeEach(() => {
    jest.mock('../loadQuery', () => ({loadQuery}));
    mockLoadedQuery = {
      dispose: jest.fn(),
    };
  });
  afterEach(() => {
    jest.unmock('../loadQuery');
  });
  it('it should call loadQuery for each query', () => {
    const myTestQuery = {
      parameters: {
        kind: 'PreloadableConcreteRequest',
        params: {
          operationKind: 'query',
          name: 'MyPreloadedQuery',
          id: 'my-persisted-query-id',
          text: null,
          metadata: {},
        },
      },
      variables: {},
    };
    const myTestQuery2 = {
      parameters: {
        kind: 'PreloadableConcreteRequest',
        params: {
          operationKind: 'query',
          name: 'MyPreloadedQuery',
          id: 'my-persisted-query-id',
          text: null,
          metadata: {},
        },
      },
      variables: {},
    };
    const env = createMockEnvironment();
    const entryPoint = {
      getPreloadProps(params) {
        return {
          queries: {
            myTestQuery,
            myTestQuery2,
          },
        };
      },
      root: (new FakeJSResource(null): $FlowFixMe),
    };

    loadEntryPoint(
      {
        getEnvironment: () => env,
      },
      entryPoint,
      {},
    );

    expect(loadQuery).toHaveBeenCalledTimes(2);
    expect(loadQuery.mock.calls[0][0]).toEqual(env);
    expect(loadQuery.mock.calls[0][1]).toEqual(myTestQuery.parameters);
    expect(loadQuery.mock.calls[0][2]).toEqual(myTestQuery.variables);
    expect(loadQuery.mock.calls[1][0]).toEqual(env);
    expect(loadQuery.mock.calls[1][1]).toEqual(myTestQuery2.parameters);
    expect(loadQuery.mock.calls[1][2]).toEqual(myTestQuery2.variables);
  });

  it('it should return a dispose callback that calls loadQuery(...).dispose', () => {
    const env = createMockEnvironment();
    const entryPoint = {
      getPreloadProps(params) {
        return {
          queries: {
            myTestQuery: {
              parameters: {
                kind: 'PreloadableConcreteRequest',
                params: {
                  operationKind: 'query',
                  name: 'MyPreloadedQuery',
                  id: 'my-persisted-query-id',
                  text: null,
                  metadata: {},
                },
              },
              variables: {},
            },
          },
        };
      },
      root: (new FakeJSResource(null): $FlowFixMe),
    };

    const preloadedEntryPoint = loadEntryPoint(
      {
        getEnvironment: () => env,
      },
      entryPoint,
      {},
    );

    expect(typeof preloadedEntryPoint.dispose).toBe('function');
    expect(mockLoadedQuery.dispose).not.toHaveBeenCalled();
    expect(preloadedEntryPoint.isDisposed).toBe(false);
    preloadedEntryPoint.dispose();
    expect(mockLoadedQuery.dispose).toHaveBeenCalledTimes(1);
    expect(preloadedEntryPoint.isDisposed).toBe(true);
  });
});

test('it should preload entry point with nested entry points', () => {
  const env = createMockEnvironment();
  const networkSpy = jest.spyOn(env.getNetwork(), 'execute');
  const nestedEntryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myNestedQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyNestedQuery',
                id: 'my-persisted-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const entryPoint = {
    getPreloadProps(params) {
      return {
        entryPoints: {
          myNestedEntryPoint: {
            entryPoint: nestedEntryPoint,
            entryPointParams: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const preloadedEntryPoint = loadEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
  expect(nestedEntryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  expect(nestedEntryPoint.root.load).toBeCalledTimes(1);
  expect(networkSpy).toBeCalledTimes(1);
  expect(
    preloadedEntryPoint.entryPoints.myNestedEntryPoint.queries.myNestedQuery
      .name,
  ).toBe('MyNestedQuery');
  expect(
    preloadedEntryPoint.entryPoints.myNestedEntryPoint.queries.myNestedQuery
      .variables,
  ).toEqual({
    id: 'my-id',
  });
  expect(preloadedEntryPoint.queries).toEqual({});
});

test('it should preload entry point with both queries and nested entry points', () => {
  const env = createMockEnvironment();
  const networkSpy = jest.spyOn(env.getNetwork(), 'execute');
  const nestedEntryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myNestedQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyNestedQuery',
                id: 'nested-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const entryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myTestQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'root-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
        entryPoints: {
          myNestedEntryPoint: {
            entryPoint: nestedEntryPoint,
            entryPointParams: {
              id: 'nested-' + params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const preloadedEntryPoint = loadEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  expect(networkSpy).toBeCalledTimes(2);
  expect(nestedEntryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  expect(nestedEntryPoint.root.load).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(entryPoint.root.load).toBeCalledTimes(1);
  expect(preloadedEntryPoint.queries.myTestQuery.name).toBe('MyPreloadedQuery');
  expect(preloadedEntryPoint.queries.myTestQuery.variables).toEqual({
    id: 'my-id',
  });
  expect(
    preloadedEntryPoint.entryPoints.myNestedEntryPoint.queries.myNestedQuery
      .name,
  ).toBe('MyNestedQuery');
  expect(
    preloadedEntryPoint.entryPoints.myNestedEntryPoint.queries.myNestedQuery
      .variables,
  ).toEqual({
    id: 'nested-my-id',
  });
});

test('it should dispose nested entry points', () => {
  const env = createMockEnvironment();
  const nestedEntryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myNestedQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyNestedQuery',
                id: 'nested-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const entryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myTestQuery: {
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'root-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
        entryPoints: {
          myNestedEntryPoint: {
            entryPoint: nestedEntryPoint,
            entryPointParams: {
              id: 'nested-' + params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const preloadedEntryPoint = loadEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {},
  );
  const nestedEntryPointDisposeSpy = jest.spyOn(
    preloadedEntryPoint.entryPoints.myNestedEntryPoint,
    'dispose',
  );
  expect(typeof preloadedEntryPoint.dispose).toBe('function');
  expect(nestedEntryPointDisposeSpy).not.toHaveBeenCalled();
  expect(preloadedEntryPoint.isDisposed).toBe(false);
  preloadedEntryPoint.dispose();
  expect(nestedEntryPointDisposeSpy).toHaveBeenCalledTimes(1);
  expect(preloadedEntryPoint.isDisposed).toBe(true);
});

test('with `getEnvironment` function', () => {
  const env = createMockEnvironment();
  const networkSpy = jest.spyOn(env.getNetwork(), 'execute');
  const entryPoint = {
    getPreloadProps(params) {
      return {
        queries: {
          myTestQuery: {
            environmentProviderOptions: {
              actorID: '4',
            },
            parameters: {
              kind: 'PreloadableConcreteRequest',
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'root-query-id',
                text: null,
                metadata: {},
              },
            },
            variables: {
              id: params.id,
            },
          },
        },
      };
    },
    root: (new FakeJSResource(null): $FlowFixMe),
  };
  const getEnvironment = jest.fn(() => env);
  const preloadedEntryPoint = loadEntryPoint(
    {
      getEnvironment,
    },
    entryPoint,
    {id: 'my-id'},
  );
  expect(getEnvironment).toBeCalledWith({
    actorID: '4',
  });
  expect(networkSpy).toBeCalledTimes(1);
  expect(preloadedEntryPoint.queries.myTestQuery.name).toBe('MyPreloadedQuery');
  expect(preloadedEntryPoint.queries.myTestQuery.variables).toEqual({
    id: 'my-id',
  });
  expect(preloadedEntryPoint.entryPoints).toEqual({});
});

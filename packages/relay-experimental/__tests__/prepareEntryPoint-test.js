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

jest.mock('fbjs/lib/ExecutionEnvironment', () => ({
  canUseDOM: true,
}));

const prepareEntryPoint = require('../prepareEntryPoint');
const {createMockEnvironment} = require('relay-test-utils-internal');

class FakeJSResource<T> {
  _resolve: (T => mixed) | null;
  _resource: T | null;
  getModuleIfRequired: () => T | null;
  load: () => Promise<T>;
  resolve: T => void;

  constructor(resource: T | null) {
    this._resolve = null;
    this._resource = resource;

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
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'my-persisted-query-id',
                text: null,
                metadata: {},
              },
              queryResource: {
                getModuleIfRequired() {
                  return null;
                },
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
  const preloadedEntryPoint = prepareEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  expect(entryPoint.root.load).toBeCalledTimes(1);
  expect(networkSpy).toBeCalledTimes(1);
  expect(preloadedEntryPoint.queries.myTestQuery.name).toBe('MyPreloadedQuery');
  expect(preloadedEntryPoint.queries.myTestQuery.variables).toEqual({
    id: 'my-id',
  });
  expect(preloadedEntryPoint.entryPoints).toEqual({});
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
              params: {
                operationKind: 'query',
                name: 'MyNestedQuery',
                id: 'my-persisted-query-id',
                text: null,
                metadata: {},
              },
              queryResource: {
                getModuleIfRequired() {
                  return null;
                },
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
  const preloadedEntryPoint = prepareEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
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
              params: {
                operationKind: 'query',
                name: 'MyNestedQuery',
                id: 'nested-query-id',
                text: null,
                metadata: {},
              },
              queryResource: {
                getModuleIfRequired() {
                  return null;
                },
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
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'root-query-id',
                text: null,
                metadata: {},
              },
              queryResource: {
                getModuleIfRequired() {
                  return null;
                },
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
  const preloadedEntryPoint = prepareEntryPoint(
    {
      getEnvironment: () => env,
    },
    entryPoint,
    {id: 'my-id'},
  );
  expect(networkSpy).toBeCalledTimes(2);
  expect(nestedEntryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
  expect(nestedEntryPoint.root.load).toBeCalledTimes(1);
  expect(entryPoint.root.getModuleIfRequired).toBeCalledTimes(1);
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
              params: {
                operationKind: 'query',
                name: 'MyPreloadedQuery',
                id: 'root-query-id',
                text: null,
                metadata: {},
              },
              queryResource: {
                getModuleIfRequired() {
                  return null;
                },
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
  const preloadedEntryPoint = prepareEntryPoint(
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

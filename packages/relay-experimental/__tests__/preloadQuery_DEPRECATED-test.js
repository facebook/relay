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

jest.mock('../ExecutionEnvironment', () => ({
  isServer: false,
}));

const preloadQuery_DEPRECATED = require('../preloadQuery_DEPRECATED');
const PreloadableQueryRegistry = require('../PreloadableQueryRegistry');

const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

const query = generateAndCompile(`
  query TestQuery($id: ID!) {
    node(id: $id) {
      id
    }
  }
`).TestQuery;

// Only queries with an ID are preloadable
query.params.id = '12345';

const params = {
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

let check;
let environment;
let fetch;
let sink;
let variables;
let operation;

beforeEach(() => {
  fetch = jest.fn((_query, _variables, _cacheConfig) => {
    return Observable.create(_sink => {
      sink = _sink;
    });
  });
  environment = new Environment({
    store: new Store(new RecordSource(), {
      gcReleaseBufferSize: 1,
    }),
    network: Network.create(fetch),
  });
  const environmentCheck = environment.check;
  check = jest.fn((...args) => environmentCheck.apply(environment, args));
  (environment: $FlowFixMe).check = check;
  variables = {id: '4'};
  operation = createOperationDescriptor(query, variables);
  PreloadableQueryRegistry.clear();
});

function createObserver() {
  const events = [];
  const observer = {
    complete: () => events.push('complete'),
    error: error => events.push('error', error),
    next: resp => events.push('next', resp),
  };
  return [events, observer];
}

describe('store-or-network', () => {
  it('fetches from network if data is available but query is not', () => {
    // load data in store
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
    check.mockClear();

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'network',
      cacheTime: null,
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('fetches from network if data is not available but query is', () => {
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'network',
      cacheTime: null,
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('fetches from network if data is not available with concrete query', () => {
    const preloaded = preloadQuery_DEPRECATED(environment, query, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'network',
      cacheTime: null,
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('returns a cached entry wo refetching if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables);
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables);
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    if (preloaded2.source) {
      preloaded2.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual([
      'next',
      response,
      'next',
      response,
      'complete',
      'complete',
    ]);
  });

  it('fetches from network if data/query are still missing and cache entry is consumed', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables);
    fetch.mockClear();
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery_DEPRECATED(environment, params, variables);
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('resolves from cache if data and query are available', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'cache',
      cacheTime: null,
    });
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache with cacheTime if data and query are available and operation is retained', () => {
    environment.retain(operation);
    const fetchTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime,
    });
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'cache',
      cacheTime: fetchTime,
    });
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache with cacheTime if data and query are available and operation is in the release buffer', () => {
    const disposable = environment.retain(operation);
    disposable.dispose();
    const fetchTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime,
    });
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'cache',
      cacheTime: fetchTime,
    });
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache if data is available with a concrete query', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
    check.mockClear();

    const preloaded = preloadQuery_DEPRECATED(environment, query, variables);
    expect(preloaded.source).toBe(null);
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'cache',
      cacheTime: null,
    });
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache if data & query become available after previously fetching', () => {
    preloadQuery_DEPRECATED(environment, params, variables);
    fetch.mockClear();

    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
    expect(preloaded.status).toEqual({
      cacheConfig: {force: true},
      source: 'cache',
      cacheTime: null,
    });
  });

  it('fetches from network (without resolving from cache) if the query has become stale', () => {
    environment.commitPayload(operation, response.data);
    environment.commitUpdate(store => {
      store.invalidateStore();
    });
    expect(environment.check(operation)).toEqual({status: 'stale'});
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('resolves from cache and rechecks if data/query are available but cache entry has expired', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
    check.mockClear();
    PreloadableQueryRegistry.set(query.params.id, query);

    preloadQuery_DEPRECATED(environment, params, variables);
    check.mockClear();
    jest.runAllTimers();

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(check).toBeCalledTimes(1); //  rechecked after a timeout
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });
});

describe('store-and-network', () => {
  it('fetches from network even if query/data are available', () => {
    environment.commitPayload(operation, response.data);
    PreloadableQueryRegistry.set(query.params.id, query);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('does not fetch again if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    if (preloaded2.source) {
      preloaded2.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual([
      'next',
      response,
      'next',
      response,
      'complete',
      'complete',
    ]);
  });

  it('fetches from network if data/query are still missing and cache entry is consumed', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    fetch.mockClear();
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });
});

describe('network-only', () => {
  it('fetches from network even if query/data are available', () => {
    environment.commitPayload(operation, response.data);
    PreloadableQueryRegistry.set(query.params.id, query);
    expect(environment.check(operation)).toEqual({
      status: 'available',
      fetchTime: null,
    });

    const preloaded = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('does not fetch again if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    if (preloaded2.source) {
      preloaded2.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual([
      'next',
      response,
      'next',
      response,
      'complete',
      'complete',
    ]);
  });

  it('fetches from network if data/query are still missing and cache entry is consumed', () => {
    const preloaded1 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    fetch.mockClear();
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
    const preloaded2 = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery_DEPRECATED(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({force: true});
  });
});

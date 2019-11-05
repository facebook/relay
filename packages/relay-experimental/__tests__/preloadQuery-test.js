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

'use strict';

jest.mock('fbjs/lib/ExecutionEnvironment', () => ({
  canUseDOM: true,
}));

const preloadQuery = require('../preloadQuery');

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
const params = {
  params: query.params,
  queryResource: ({
    getModuleIfRequired: () => {
      return null;
    },
  }: $FlowFixMe),
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
    store: new Store(new RecordSource()),
    network: Network.create(fetch),
  });
  const environmentCheck = environment.check;
  check = jest.fn((...args) => environmentCheck.apply(environment, args));
  (environment: $FlowFixMe).check = check;
  variables = {id: '4'};
  operation = createOperationDescriptor(query, variables);
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
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();

    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('fetches from network if data is not available but query is', () => {
    params.queryResource.getModuleIfRequired = () => query;

    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('fetches from network if data is not available with concrete query', () => {
    const preloaded = preloadQuery(environment, query, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('returns a cached entry wo refetching if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery(environment, params, variables);
    const preloaded2 = preloadQuery(environment, params, variables);
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
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
    const preloaded1 = preloadQuery(environment, params, variables);
    fetch.mockClear();
    const [events, observer] = createObserver();
    if (preloaded1.source) {
      preloaded1.source.subscribe({...observer});
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
    const preloaded2 = preloadQuery(environment, params, variables);
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery(environment, params, variables);
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('resolves from cache if data and query are available', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();
    params.queryResource.getModuleIfRequired = () => query;

    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache if data is available with a concrete query', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();

    const preloaded = preloadQuery(environment, query, variables);
    expect(preloaded.source).toBe(null);
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache if data & query become available after previously fetching', () => {
    preloadQuery(environment, params, variables);
    fetch.mockClear();

    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();
    params.queryResource.getModuleIfRequired = () => query;

    const preloaded = preloadQuery(environment, params, variables);
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache wo re-check()-ing if the entry is still cached', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();
    params.queryResource.getModuleIfRequired = () => query;

    preloadQuery(environment, params, variables);
    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(check).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });

  it('resolves from cache and rechecks if data/query are available but cache entry has expired', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    check.mockClear();
    params.queryResource.getModuleIfRequired = () => query;

    preloadQuery(environment, params, variables);
    check.mockClear();
    jest.runAllTimers();

    const preloaded = preloadQuery(environment, params, variables);
    expect(preloaded.source).toBe(null);
    expect(check).toBeCalledTimes(1); //  rechecked after a timeout
    expect(fetch).toBeCalledTimes(0);
    expect(preloaded.source).toBe(null);
  });
});

describe('store-and-network', () => {
  it('fetches from network even if query/data are available', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    params.queryResource.getModuleIfRequired = () => query;

    const preloaded = preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('does not fetch again if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    const preloaded2 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
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
    const preloaded1 = preloadQuery(environment, params, variables, {
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
    const preloaded2 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery(environment, params, variables, {
      fetchPolicy: 'store-and-network',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });
});

describe('network-only', () => {
  it('fetches from network even if query/data are available', () => {
    environment.commitPayload(operation, response.data);
    expect(environment.check(operation.root)).toBe(true);
    params.queryResource.getModuleIfRequired = () => query;

    const preloaded = preloadQuery(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});

    const [events, observer] = createObserver();
    if (preloaded.source) {
      preloaded.source.subscribe(observer);
    }
    sink.next(response);
    sink.complete();
    expect(events).toEqual(['next', response, 'complete']);
  });

  it('does not fetch again if a previous fetch is pending', () => {
    const preloaded1 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    const preloaded2 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
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
    const preloaded1 = preloadQuery(environment, params, variables, {
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
    const preloaded2 = preloadQuery(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded2.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });

  it('fetches from network if data/query are still missing and cache entry has expired', () => {
    preloadQuery(environment, params, variables, {fetchPolicy: 'network-only'});
    fetch.mockClear();
    sink.next(response);
    sink.complete();
    jest.runAllTimers();
    const preloaded = preloadQuery(environment, params, variables, {
      fetchPolicy: 'network-only',
    });
    expect(preloaded.source).toEqual(expect.any(Observable));
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(query.params);
    expect(fetch.mock.calls[0][1]).toEqual(variables);
    expect(fetch.mock.calls[0][2]).toEqual({});
  });
});

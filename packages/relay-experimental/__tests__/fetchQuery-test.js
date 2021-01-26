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

const fetchQuery = require('../fetchQuery');

const {
  createOperationDescriptor,
  getRequest,
  RelayFeatureFlags,
} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

const response = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
    },
  },
};

describe('fetchQuery', () => {
  let query;
  let variables;
  let environment;
  let retained = [];
  beforeEach(() => {
    retained = [];
    environment = createMockEnvironment();
    environment.retain.mockImplementation(obj => {
      const idx = retained.push(obj);
      return {
        dispose: () => {
          retained = retained.filter((o, ii) => ii === idx);
        },
      };
    });
    variables = {id: '4'};
    query = generateAndCompile(
      `query TestQuery($id: ID!) {
          node(id: $id) {
            id
          }
        }
      `,
    ).TestQuery;
  });

  it('fetches request and does not retain data', () => {
    let calledObserver = false;
    const observer = {
      complete: () => {
        calledObserver = true;
        expect(retained.length).toEqual(0);
      },
    };
    const subscription = fetchQuery(environment, query, variables).subscribe(
      observer,
    );
    environment.mock.nextValue(query, response);
    environment.mock.complete(query);
    subscription.unsubscribe();
    expect(calledObserver).toEqual(true);
    expect(retained.length).toEqual(0);
  });

  it('provides data snapshot on next', () => {
    let calledNext = false;
    const observer = {
      next: data => {
        calledNext = true;
        expect(retained.length).toEqual(0);
        expect(data).toEqual({
          node: {
            id: '4',
          },
        });
      },
    };
    fetchQuery(environment, query, variables).subscribe(observer);
    environment.mock.nextValue(query, response);
    expect(calledNext).toEqual(true);
    environment.mock.complete(query);
    expect(retained.length).toEqual(0);
  });

  it('unsubscribes when request is disposed', () => {
    let calledNext = false;
    let calledUnsubscribe = false;
    const observer = {
      next: () => {
        calledNext = true;
        expect(retained.length).toEqual(0);
      },
      unsubscribe: () => {
        calledUnsubscribe = true;
      },
    };
    const subscription = fetchQuery(environment, query, variables).subscribe(
      observer,
    );
    environment.mock.nextValue(query, response);
    subscription.unsubscribe();
    expect(calledNext).toEqual(true);
    expect(calledUnsubscribe).toEqual(true);
  });

  it('handles error correctly', () => {
    let calledError = false;
    const observer = {
      error: error => {
        calledError = true;
        expect(error.message).toEqual('Oops');
        expect(retained.length).toEqual(0);
      },
    };
    const subscription = fetchQuery(environment, query, variables).subscribe(
      observer,
    );
    environment.mock.reject(query, new Error('Oops'));
    expect(calledError).toEqual(true);
    expect(retained.length).toEqual(0);
    subscription.unsubscribe();
  });

  describe('.toPromise()', () => {
    it('fetches request and does not retain query data', async () => {
      const promise = fetchQuery(environment, query, variables).toPromise();
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(true);
      environment.mock.nextValue(query, response);
      const data = await promise;
      expect(data).toEqual({
        node: {
          id: '4',
        },
      });
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(true);
      expect(retained.length).toEqual(0);

      environment.mock.complete(query);
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(false);
      expect(retained.length).toEqual(0);
    });

    it('rejects when error occurs', async () => {
      const promise = fetchQuery(environment, query, variables).toPromise();
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(true);
      environment.mock.reject(query, new Error('Oops'));
      try {
        await promise;
      } catch (error) {
        expect(error.message).toEqual('Oops');
      }
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(false);
      expect(retained.length).toEqual(0);
    });
  });

  describe('store-or-network fetchPolicy', () => {
    it('fetches data if not cached yet', async () => {
      const promise = fetchQuery(environment, query, variables, {
        fetchPolicy: 'store-or-network',
      }).toPromise();
      // Needs to load data from network
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(true);
      environment.mock.nextValue(query, response);
      const data = await promise;
      expect(data).toEqual({
        node: {
          id: '4',
        },
      });
    });
    it('reads from store if cached already', async () => {
      // Populate the store
      const queryNode = getRequest(query);
      const operation = createOperationDescriptor(queryNode, variables);
      environment.getStore().retain(operation);
      environment.commitPayload(operation, response.data);

      // Fetch after data is in store
      const promise = fetchQuery(environment, query, variables, {
        fetchPolicy: 'store-or-network',
      }).toPromise();
      // Shouldn't be loading because the data is already cached
      expect(
        environment.mock.isLoading(query, variables, {force: true}),
      ).toEqual(false);
      const data = await promise;
      expect(data).toEqual({
        node: {
          id: '4',
        },
      });
    });
  });
});

describe('fetchQuery with missing @required value', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
  });
  afterEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });
  it('provides data snapshot on next', () => {
    const requiredFieldLogger = jest.fn();
    const environment = createMockEnvironment({
      requiredFieldLogger,
    });
    const query = generateAndCompile(
      `query TestQuery {
          me {
            name @required(action: LOG)
          }
        }
      `,
    ).TestQuery;

    const observer = {next: jest.fn()};
    const subscription = fetchQuery(environment, query, {}).subscribe(observer);
    expect(observer.next).not.toHaveBeenCalled();

    environment.mock.nextValue(query, {
      data: {
        me: {
          name: null,
        },
      },
    });
    subscription.unsubscribe();
    expect(observer.next).toHaveBeenCalledWith({me: null});
    expect(requiredFieldLogger).toHaveBeenCalledWith({
      fieldPath: 'me.name',
      kind: 'missing_field.log',
      owner: 'TestQuery',
    });
  });

  it('throws on resolution', () => {
    const requiredFieldLogger = jest.fn();
    const environment = createMockEnvironment({requiredFieldLogger});
    const query = generateAndCompile(
      `query TestQuery {
          me {
            name @required(action: THROW)
          }
        }
      `,
    ).TestQuery;

    const observer = {next: jest.fn(), error: jest.fn()};
    const subscription = fetchQuery(environment, query, {}).subscribe(observer);
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();

    environment.mock.nextValue(query, {data: {me: {name: null}}});
    subscription.unsubscribe();
    expect(requiredFieldLogger).toHaveBeenCalledWith({
      fieldPath: 'me.name',
      kind: 'missing_field.throw',
      owner: 'TestQuery',
    });
    expect(observer.error).toHaveBeenCalledWith(
      Error("Relay: Missing @required value at path 'me.name' in 'TestQuery'."),
    );
    expect(observer.next).not.toHaveBeenCalled();
  });

  it('does not report missing required values in fragments', () => {
    const environment = createMockEnvironment({});
    const query = generateAndCompile(
      `query TestQuery {
          me {
            ...TestFragment
          }
        }
        fragment TestFragment on User {
          name @required(action: THROW)
        }
      `,
    ).TestQuery;

    const observer = {next: jest.fn(), error: jest.fn()};
    const subscription = fetchQuery(environment, query, {}).subscribe(observer);
    environment.mock.nextValue(query, {data: {me: {name: null}}});

    subscription.unsubscribe();

    expect(observer.error).not.toHaveBeenCalled();
  });
});

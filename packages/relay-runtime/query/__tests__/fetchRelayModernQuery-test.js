/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {createMockEnvironment, generateAndCompile} = require('relay-test-utils');

const fetchRelayModernQuery = require('../fetchRelayModernQuery');

const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');

describe('fetchRelayModernQuery', () => {
  let cacheConfig;
  let environment;
  let operation;
  let query;
  let variables;

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment();
    ({ActorQuery: query} = generateAndCompile(`
      query ActorQuery($fetchSize: Boolean!) {
        me {
          name
          profilePicture(size: 42) @include(if: $fetchSize) {
            uri
          }
        }
      }
    `));
    variables = {fetchSize: false};
    operation = createOperationDescriptor(query, variables);
  });

  it('fetches the query', () => {
    cacheConfig = {force: true};
    fetchRelayModernQuery(environment, query, variables, cacheConfig);
    expect(environment.execute.mock.calls.length).toBe(1);
    const args = environment.execute.mock.calls[0][0];
    expect(args).toEqual({operation, cacheConfig});
    expect(args.cacheConfig).toBe(cacheConfig);
  });

  it('resolves with the query results after first value', async () => {
    const promise = fetchRelayModernQuery(environment, query, variables);
    environment.mock.nextValue(query, {
      data: {
        me: {
          id: '842472',
          name: 'Joe',
        },
      },
    });
    expect(await promise).toEqual({
      me: {
        name: 'Joe',
      },
    });
  });

  it('rejects with query errors', async () => {
    const promise = fetchRelayModernQuery(environment, query, variables);
    const error = new Error('wtf');
    environment.mock.reject(query, error);
    expect(await promise.catch(err => err)).toBe(error);
  });
});

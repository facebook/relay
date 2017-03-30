/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff();

const fetchRelayStaticQuery = require('fetchRelayStaticQuery');
const {createMockEnvironment} = require('RelayStaticMockEnvironment');
const RelayStaticTestUtils = require('RelayStaticTestUtils');
const {createOperationSelector} = require('RelayStaticOperationSelector');

describe('fetchRelayStaticQuery', () => {
  const {generateAndCompile} = RelayStaticTestUtils;
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
    operation = createOperationSelector(query, variables);
  });

  it('fetches the query', () => {
    cacheConfig = {force: true};
    fetchRelayStaticQuery(
      environment,
      query,
      variables,
      cacheConfig,
    );
    expect(environment.sendQuery.mock.calls.length).toBe(1);
    const args = environment.sendQuery.mock.calls[0][0];
    expect(args).toEqual({
      cacheConfig,
      onCompleted: jasmine.any(Function),
      onError: jasmine.any(Function),
      operation,
    });
    expect(args.cacheConfig).toBe(cacheConfig);
  });

  it('resolves with the query results', () => {
    let results;
    fetchRelayStaticQuery(environment, query, variables).then(data => {
      results = data;
    });
    environment.mock.resolve(query, {
      data: {
        me: {
          id: '842472',
          name: 'Joe',
        },
      },
    });
    jest.runAllTimers();
    expect(results).toEqual({
      me: {
        name: 'Joe',
      },
    });
  });

  it('rejects with query errors', () => {
    const error = new Error('wtf');
    fetchRelayStaticQuery(environment, query, variables).catch(err => {
      expect(err).toBe(error);
    });

    environment.mock.reject(query, error);
    jest.runAllTimers();
  });
});

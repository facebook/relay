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
  GraphQLResponse,
  OperationAvailabilityConfig,
} from '../../network/RelayNetworkTypes';

const RelayObservable = require('../../network/RelayObservable');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() provides operation availability to the network layer', () => {
  let availabilityConfig: ?OperationAvailabilityConfig;
  let callbacks;
  let complete;
  let environment;
  let error;
  let next;
  let operation;
  let query;
  let source;
  let store;
  let subject;
  let variables;
  let network;
  beforeEach(() => {
    query = graphql`
      query RelayModernEnvironmentExecuteWithCheckTestQuery(
        $fetchSize: Boolean!
      ) {
        me {
          name
          profilePicture(size: 42) @include(if: $fetchSize) {
            uri
          }
        }
      }
    `;
    variables = {fetchSize: false};
    operation = createOperationDescriptor(query, variables);

    complete = jest.fn<[], unknown>();
    error = jest.fn<[Error], unknown>();
    next = jest.fn<[GraphQLResponse], unknown>();
    callbacks = {complete, error, next};

    network = {
      execute: jest.fn(
        (
          _query,
          _variables,
          _cacheConfig,
          _1,
          _2,
          _3,
          _4,
          _availabilityConfig,
        ) => {
          availabilityConfig = _availabilityConfig;
          return RelayObservable.create(sink => {
            subject = sink;
          });
        },
      ),
    };
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network,
      store,
    });
  });

  it('checks the explicitly supplied parent operation', () => {
    environment.execute({operation}).subscribe(callbacks);
    const firstConfig = nullthrows(availabilityConfig);
    expect(firstConfig.parentOperation).toBe(operation);
    expect(firstConfig.checkOperation(operation).status).toBe('missing');
    subject.next({
      data: {
        me: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    });
    jest.runAllTimers();

    environment.execute({operation}).subscribe(callbacks);
    const secondConfig = nullthrows(availabilityConfig);
    expect(secondConfig.parentOperation).toBe(operation);
    expect(secondConfig.checkOperation(operation).status).toBe('available');
  });

  it('checks a related operation without implicit parent fallback', () => {
    const availableOperation = createOperationDescriptor(query, {
      fetchSize: false,
    });
    const parentOperation = createOperationDescriptor(query, {
      fetchSize: true,
    });
    environment.commitPayload(availableOperation, {
      me: {
        __typename: 'User',
        id: '842472',
        name: 'Joe',
      },
    });

    environment.execute({operation: parentOperation}).subscribe(callbacks);

    const config = nullthrows(availabilityConfig);
    expect(config.parentOperation).toBe(parentOperation);
    expect(config.checkOperation(parentOperation).status).toBe('missing');
    expect(config.checkOperation(availableOperation).status).toBe('available');
  });
});

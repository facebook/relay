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
import type {GraphQLResponse} from '../../network/RelayNetworkTypes';

const RelayObservable = require('../../network/RelayObservable');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() provides a `check` function for the network layer to determine availability of data in store', () => {
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
  let check;
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
        (_query, _variables, _cacheConfig, _1, _2, _3, _4, _check) => {
          check = _check;
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

  it('returns the correct availability in the check function', () => {
    environment.execute({operation}).subscribe(callbacks);
    expect(check().status).toBe('missing');
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
    expect(check().status).toBe('available');
  });
});

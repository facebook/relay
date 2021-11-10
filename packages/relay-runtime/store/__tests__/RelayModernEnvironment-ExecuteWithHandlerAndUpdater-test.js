/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {
  RecordSourceProxy,
  HandleFieldPayload,
} from 'relay-runtime/store/RelayStoreTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

// Regression test: updaters read the store using the selector used to
// publish, which can fail if a normalization ast was passed as the
// selector.
describe('execute() with handler and updater', () => {
  let callbacks;
  let complete;
  let environment;
  let error;
  let fetch;
  let next;
  let operation;
  let query;
  let source;
  let store;
  let subject;

  beforeEach(() => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery {
        me {
          name @__clientField(handle: "name_handler")
        }
      }
    `);
    operation = createOperationDescriptor(query, {});

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        subject = sink;
      }),
    );
    const NameHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const name = record.getValue(payload.fieldKey);
          record.setValue(
            typeof name === 'string' ? name.toUpperCase() : null,
            payload.handleKey,
          );
        }
      },
    };

    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
        }
      },
    });
  });

  it('calls next() and runs updater when payloads return', () => {
    const updater = jest.fn();
    environment.executeSubscription({operation, updater}).subscribe(callbacks);
    subject.next({
      data: {
        me: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
        },
      },
    });
    jest.runAllTimers();
    expect(next).toBeCalledTimes(1);
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(updater).toBeCalledTimes(1);
    expect(environment.lookup(operation.fragment).data).toEqual({
      me: {
        name: 'ALICE',
      },
    });
  });
});

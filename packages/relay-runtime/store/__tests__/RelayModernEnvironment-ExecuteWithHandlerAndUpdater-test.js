/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {generateAndCompile} = require('relay-test-utils-internal');

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
    jest.resetModules();

    ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery {
          me {
            name @__clientField(handle: "name_handler")
          }
        }
      `));
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
      update(storeProxy, payload) {
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
      network: RelayNetwork.create((fetch: $FlowFixMe)),
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
    environment.execute({operation, updater}).subscribe(callbacks);
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

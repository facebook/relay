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
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayRecordSource = require('../RelayRecordSource');

const {generateAndCompile} = require('relay-test-utils-internal');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('commitPayload()', () => {
  let ActorQuery;
  let environment;
  let operation;
  let source;
  let store;

  beforeEach(() => {
    jest.resetModules();
    ({ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            name
          }
        }
      `));
    operation = createOperationDescriptor(ActorQuery, {});
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    (store: $FlowFixMe).notify = jest.fn(store.notify.bind(store));
    (store: $FlowFixMe).publish = jest.fn(store.publish.bind(store));
  });

  it('applies server updates', () => {
    const callback = jest.fn();
    const snapshot = environment.lookup(operation.fragment, operation);
    environment.subscribe(snapshot, callback);

    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'Zuck',
      },
    });
  });

  it('rebases optimistic updates', () => {
    const callback = jest.fn();
    const snapshot = environment.lookup(operation.fragment, operation);
    environment.subscribe(snapshot, callback);

    environment.applyUpdate({
      storeUpdater: proxyStore => {
        const zuck = proxyStore.get('4');
        if (zuck) {
          const name = zuck.getValue('name');
          if (typeof name !== 'string') {
            throw new Error('Expected zuck.name to be defined');
          }
          zuck.setValue(name.toUpperCase(), 'name');
        }
      },
    });

    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      me: {
        name: 'ZUCK',
      },
    });
  });
});

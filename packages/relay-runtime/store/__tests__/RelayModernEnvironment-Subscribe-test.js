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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('subscribe()', () => {
  let ParentQuery;
  let environment;
  let operation;

  function setName(id, name) {
    environment.applyUpdate({
      storeUpdater: proxyStore => {
        const user = proxyStore.get(id);
        if (!user) {
          throw new Error('Expected user to be in the store');
        }
        user.setValue(name, 'name');
      },
    });
  }

  beforeEach(() => {
    jest.resetModules();
    ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operation = createOperationDescriptor(ParentQuery, {});
    environment.commitPayload(operation, {
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
  });

  it('calls the callback if data changes', () => {
    const snapshot = environment.lookup(
      createReaderSelector(
        ParentQuery.fragment,
        ROOT_ID,
        {},
        operation.request,
      ),
    );
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);
    setName('4', 'Mark'); // Zuck -> Mark
    expect(callback.mock.calls.length).toBe(1);
    const nextSnapshot = callback.mock.calls[0][0];
    expect(nextSnapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Mark', // reflects updated value
      },
    });
  });

  it('does not call the callback if disposed', () => {
    const snapshot = environment.lookup(
      createReaderSelector(
        ParentQuery.fragment,
        ROOT_ID,
        {},
        operation.request,
      ),
    );
    const callback = jest.fn();
    const {dispose} = environment.subscribe(snapshot, callback);
    dispose();
    setName('4', 'Mark'); // Zuck -> Mark
    expect(callback).not.toBeCalled();
  });
});

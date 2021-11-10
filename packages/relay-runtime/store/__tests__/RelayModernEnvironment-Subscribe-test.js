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

const RelayNetwork = require('../../network/RelayNetwork');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('subscribe()', () => {
  let ParentQuery;
  let environment;
  let operation;

  function setName(
    id: $TEMPORARY$string<'4'>,
    name: $TEMPORARY$string<'Mark'>,
  ) {
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
    ParentQuery = getRequest(graphql`
      query RelayModernEnvironmentSubscribeTestParentQuery {
        me {
          id
          name
        }
      }
    `);
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const {dispose} = environment.subscribe(snapshot, callback);
    dispose();
    setName('4', 'Mark'); // Zuck -> Mark
    expect(callback).not.toBeCalled();
  });
});

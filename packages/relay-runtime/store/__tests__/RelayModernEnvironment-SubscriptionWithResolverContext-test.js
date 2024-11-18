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
import type {Snapshot} from '../RelayStoreTypes';
import type {RecordSourceProxy} from 'relay-runtime/store/RelayStoreTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('RelayContext works when applying updates and gets passed through to the RelayStoreSubscriptions', () => {
  it('correctly using the resolver data from the context', () => {
    const ParentQuery = graphql`
      query RelayModernEnvironmentSubscriptionWithResolverContextTestParentQuery {
        me {
          ...RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment
        }
      }
    `;
    const UserFragment = graphql`
      fragment RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment on User {
        id
        name
        age
      }
    `;

    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source, {
      resolverContext: {
        age: 42,
      },
    });
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    const operation = createOperationDescriptor(ParentQuery, {});

    const selector = createReaderSelector(
      UserFragment,
      '4',
      {},
      operation.request,
    );
    const callback = jest.fn<[Snapshot], void>();
    const snapshot = environment.lookup(selector);
    environment.subscribe(snapshot, callback);

    callback.mockClear();
    const updater = {
      storeUpdater: (proxyStore: RecordSourceProxy) => {
        const zuck = proxyStore.create('4', 'User');
        zuck.setValue('4', 'id');
      },
    };
    environment.applyUpdate(updater);
    environment.replaceUpdate(updater, {
      storeUpdater: proxyStore => {
        const zuck = proxyStore.create('4', 'User');
        zuck.setValue('4', 'id');
        zuck.setValue('zuck', 'name');
      },
    });
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0].data).toEqual({
      id: '4',
      age: 42,
    });
    expect(callback.mock.calls[1][0].data).toEqual({
      id: '4',
      name: 'zuck',
      age: 42,
    });
  });
});

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
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {getRequest, graphql} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('retain()', () => {
  let ParentQuery;
  let environment;
  let operation;

  beforeEach(() => {
    graphql`
      fragment RelayModernEnvironmentRetainTestQueryChildFragment on User {
        id
        name
      }
    `;

    ParentQuery = getRequest(graphql`
      query RelayModernEnvironmentRetainTestQuery {
        me {
          id
          name
        }
      }
    `);

    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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

  it('retains data when not disposed', () => {
    environment.retain(operation);
    const snapshot = environment.lookup(
      createReaderSelector(
        ParentQuery.fragment,
        ROOT_ID,
        {},
        operation.request,
      ),
    );
    // data is still in the store
    expect(snapshot.data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
  });

  it('releases data when disposed', () => {
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const {dispose} = environment.retain(operation);
    const selector = createReaderSelector(
      ParentQuery.fragment,
      ROOT_ID,
      {},
      operation.request,
    );
    dispose();
    // GC runs asynchronously; data should still be in the store
    expect(environment.lookup(selector).data).toEqual({
      me: {
        id: '4',
        name: 'Zuck',
      },
    });
    jest.runAllTimers();
    // After GC runs data is missing
    expect(environment.lookup(selector).data).toBe(undefined);
  });
});

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
const {graphql, getRequest} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('query cache expiration time', () => {
  let environment;
  let operationDescriptor;
  let ParentQuery;
  let source;
  let store;
  let fetchTime;
  const QUERY_CACHE_EXPIRATION_TIME = 1000;
  const GC_RELEASE_BUFFER_SIZE = 1;

  beforeEach(() => {
    fetchTime = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);

    ParentQuery = getRequest(graphql`
      query RelayModernEnvironmentQueryCacheExpirationTimeTestQuery {
        me {
          id
          name
        }
      }
    `);

    source = RelayRecordSource.create();
    store = new RelayModernStore(source, {
      queryCacheExpirationTime: QUERY_CACHE_EXPIRATION_TIME,
      gcReleaseBufferSize: GC_RELEASE_BUFFER_SIZE,
    });
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(jest.fn()),
      store,
    });
    operationDescriptor = createOperationDescriptor(ParentQuery, {
      size: 32,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('interactions with the release buffer', () => {
    it('retains disposed query in release buffer if less time than the query cache expiration time has passed when query is released', () => {
      environment.commitPayload(operationDescriptor, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      const {dispose} = environment.retain(operationDescriptor);
      const snapshot = environment.lookup(
        createReaderSelector(
          ParentQuery.fragment,
          ROOT_ID,
          {},
          operationDescriptor.request,
        ),
      );
      // data is still in the store
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });

      fetchTime += QUERY_CACHE_EXPIRATION_TIME - 1;
      dispose();
      jest.runAllTimers();
      const snapshot2 = environment.lookup(
        createReaderSelector(
          ParentQuery.fragment,
          ROOT_ID,
          {},
          operationDescriptor.request,
        ),
      );

      // data is still in the store
      expect(snapshot2.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('immediately releases stale disposed items', () => {
      environment.commitPayload(operationDescriptor, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      const {dispose} = environment.retain(operationDescriptor);
      const snapshot = environment.lookup(
        createReaderSelector(
          ParentQuery.fragment,
          ROOT_ID,
          {},
          operationDescriptor.request,
        ),
      );
      // data is still in the store
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      fetchTime += QUERY_CACHE_EXPIRATION_TIME;
      dispose();
      jest.runAllTimers();
      const snapshot2 = environment.lookup(
        createReaderSelector(
          ParentQuery.fragment,
          ROOT_ID,
          {},
          operationDescriptor.request,
        ),
      );
      // data is not in the store
      expect(snapshot2.data).toBe(undefined);
    });
  });

  describe('with check()', () => {
    it('returns available for retained data until query cache expiration time has passed', () => {
      environment.commitPayload(operationDescriptor, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      const {dispose} = environment.retain(operationDescriptor);
      const originalFetchTime = fetchTime;

      expect(environment.check(operationDescriptor)).toEqual({
        status: 'available',
        fetchTime: originalFetchTime,
      });

      dispose();
      fetchTime += QUERY_CACHE_EXPIRATION_TIME - 1;
      expect(environment.check(operationDescriptor)).toEqual({
        status: 'available',
        fetchTime: originalFetchTime,
      });

      fetchTime += 1;
      expect(environment.check(operationDescriptor)).toEqual({
        status: 'stale',
      });
    });
  });
});

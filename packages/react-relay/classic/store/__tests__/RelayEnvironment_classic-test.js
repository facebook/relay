/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest
  .mock('../../legacy/store/GraphQLQueryRunner')
  .mock('../readRelayQueryData')
  .mock('../../mutation/RelayMutation')
  .useFakeTimers();

require('configureForRelayOSS');

const RelayClassic = require('../../RelayPublic');
const RelayEnvironment = require('../RelayEnvironment');
const RelayMutation = require('../../mutation/RelayMutation');
const RelayMutationTransaction = require('../../mutation/RelayMutationTransaction');
const RelayMutationTransactionStatus = require('../../mutation/RelayMutationTransactionStatus');
const RelayMutationQueue = require('../../mutation/RelayMutationQueue');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('../readRelayQueryData');

const {CREATED, ROLLED_BACK, UNCOMMITTED} = RelayMutationTransactionStatus;

describe('RelayEnvironment', () => {
  let environment;
  let filter;
  let dataIDs;
  let queries;
  let callback;
  let recordWriter;
  let queryRunner;

  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    environment = new RelayEnvironment();

    filter = () => true;
    dataIDs = ['feedback_id', 'likers_id'];
    queries = {};
    callback = jest.fn();
    queryRunner = environment.getStoreData().getQueryRunner();
    recordWriter = environment.getStoreData().getRecordWriter();
  });

  describe('primeCache', () => {
    it('invokes `GraphQLQueryRunner#run`', () => {
      environment.primeCache(queries, callback);

      expect(queryRunner.run).toBeCalled();
      expect(queryRunner.run.mock.calls[0][0]).toBe(queries);
      expect(queryRunner.run.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('forceFetch', () => {
    it('invokes `GraphQLQueryRunner#forceFetch`', () => {
      environment.forceFetch(queries, callback);

      expect(queryRunner.forceFetch).toBeCalled();
      expect(queryRunner.forceFetch.mock.calls[0][0]).toBe(queries);
      expect(queryRunner.forceFetch.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('read', () => {
    it('invokes `readRelayQueryData`', () => {
      environment.read(queries, dataIDs[0]);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][1]).toEqual(queries);
      expect(readRelayQueryData.mock.calls[0][2]).toBe(dataIDs[0]);
      expect(readRelayQueryData.mock.calls[0][3]).toBeUndefined();
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      environment.read(queries, dataIDs[0], filter);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][3]).toBe(filter);
    });
  });

  describe('readAll', () => {
    it('invokes `readRelayQueryData`', () => {
      environment.readAll(queries, dataIDs);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      expect(readRelayQueryData.mock.calls.map(call => call[2])).toEqual(
        dataIDs,
      );
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      environment.readAll(queries, dataIDs, filter);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      readRelayQueryData.mock.calls.forEach(call => {
        expect(call[3]).toBe(filter);
      });
    });
  });

  describe('readQuery', () => {
    it('accepts a query with no arguments', () => {
      recordWriter.putDataID('viewer', null, 'client:1');
      environment.readQuery(getNode(RelayClassic.QL`query{viewer{actor{id}}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(1);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('client:1');
    });

    it('accepts a query with arguments', () => {
      environment.readQuery(
        getNode(
          RelayClassic.QL`
        query {
          nodes(ids:["123","456"]) {
            id
          }
        }
      `,
        ),
      );
      expect(readRelayQueryData.mock.calls.length).toBe(2);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('123');
      expect(readRelayQueryData.mock.calls[1][2]).toBe('456');
    });

    it('accepts a query with unrecognized arguments', () => {
      const result = environment.readQuery(
        getNode(
          RelayClassic.QL`
        query {
          username(name:"foo") {
            id
          }
        }
      `,
        ),
      );
      expect(readRelayQueryData.mock.calls.length).toBe(0);
      expect(result).toEqual([undefined]);
    });
  });

  describe('update functions', () => {
    let createTransactionMock;
    let mockCallbacks;
    let mockMutation;
    let mockQueue;
    let mockTransaction;
    let status;

    beforeEach(() => {
      status = CREATED;
      mockQueue = {
        applyOptimistic: () => {
          status = UNCOMMITTED;
        },
        getStatus: jest.fn(() => status),
      };
      mockTransaction = new RelayMutationTransaction(mockQueue);
      mockTransaction.commit = jest.fn();
      createTransactionMock = jest.fn();
      createTransactionMock.mockReturnValue(mockTransaction);
      RelayMutationQueue.prototype.createTransaction = createTransactionMock;
      mockMutation = new RelayMutation();
      mockCallbacks = jest.fn();
    });

    describe('applyUpdate()', () => {
      it('binds environment to mutation before creating transaction', () => {
        mockMutation.bindEnvironment.mockImplementation(() => {
          expect(createTransactionMock).not.toBeCalled();
        });
        environment.applyUpdate(mockMutation);
        expect(mockMutation.bindEnvironment).toBeCalled();
        expect(mockMutation.bindEnvironment.mock.calls[0][0]).toBe(environment);
      });

      it('always uses the pre-bound version of `this`', () => {
        mockMutation.bindEnvironment = jest.fn();
        const applyUpdate = environment.applyUpdate;
        applyUpdate(mockMutation); // Without binding, `this` would be `global`.
        expect(mockMutation.bindEnvironment.mock.calls[0][0]).toBe(environment);
      });

      it('creates a new RelayMutationTransaction without committing it', () => {
        const transaction = environment.applyUpdate(
          mockMutation,
          mockCallbacks,
        );
        expect(transaction).toEqual(mockTransaction);
        expect(createTransactionMock).toBeCalledWith(
          mockMutation,
          mockCallbacks,
        );
        expect(mockTransaction.commit).not.toBeCalled();
      });
    });

    describe('commitUpdate()', () => {
      it('binds environment to mutation before creating transaction', () => {
        mockMutation.bindEnvironment.mockImplementation(() => {
          expect(createTransactionMock).not.toBeCalled();
        });
        environment.commitUpdate(mockMutation);
        expect(mockMutation.bindEnvironment).toBeCalled();
        expect(mockMutation.bindEnvironment.mock.calls[0][0]).toBe(environment);
      });

      it('always uses the pre-bound version of `this`', () => {
        mockMutation.bindEnvironment = jest.fn();
        const commitUpdate = environment.commitUpdate;
        commitUpdate(mockMutation); // Without binding, `this` would be `global`.
        expect(mockMutation.bindEnvironment.mock.calls[0][0]).toBe(environment);
      });

      it('creates a new RelayMutationTransaction and defers the commit', () => {
        environment.commitUpdate(mockMutation, mockCallbacks);
        expect(createTransactionMock).toBeCalledWith(
          mockMutation,
          mockCallbacks,
        );
        expect(mockTransaction.commit).not.toBeCalled();
        jest.runAllTimers();
        expect(mockTransaction.commit).toBeCalled();
      });

      it('cancels a scheduled commit action if the status changes', () => {
        environment.commitUpdate(mockMutation, mockCallbacks);
        expect(createTransactionMock).toBeCalledWith(
          mockMutation,
          mockCallbacks,
        );
        expect(mockTransaction.commit).not.toBeCalled();
        status = ROLLED_BACK;
        jest.runAllTimers();
        expect(mockTransaction.commit).not.toBeCalled();
      });
    });

    describe('injectCacheManager()', () => {
      it('passes down the cacheManager to the store data', () => {
        const mockCacheManager = {};
        environment.injectCacheManager(mockCacheManager);
        expect(environment.getStoreData().getCacheManager()).toBe(
          mockCacheManager,
        );
      });
    });
  });
});

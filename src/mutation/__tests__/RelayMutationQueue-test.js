/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

jest
  .dontMock('RelayMutationTransaction')
  .dontMock('RelayMutationTransactionStatus');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMutation = require('RelayMutation');
const RelayMutationQuery = require('RelayMutationQuery');
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
const RelayStore = require('RelayStore');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const fromGraphQL = require('fromGraphQL');

describe('RelayMutationQueue', () => {
  let storeData;
  let mutationQueue;
  let networkLayer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayStoreData.prototype.handleUpdatePayload = jest.genMockFunction();
    storeData = RelayStore.getStoreData();
    mutationQueue = storeData.getMutationQueue();
    networkLayer = storeData.getNetworkLayer();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('constructor', () => {
    let mockMutation, mutationNode, fatQuery;

    beforeEach(() => {
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          likers
          doesViewerLike
        }
      }`;
      mockMutation = new RelayMutation();
      mockMutation.getFatQuery.mockReturnValue(fatQuery);
      mockMutation.getMutation.mockReturnValue(mutationNode);
      mockMutation.getConfigs.mockReturnValue('configs');
    });

    it('does not update store if there is no optimistic response', () => {
      const transaction = mutationQueue.createTransaction(mockMutation);

      expect(transaction.getStatus()).toBe(
        RelayMutationTransactionStatus.UNCOMMITTED
      );
      expect(storeData.handleUpdatePayload).not.toBeCalled();
    });

    it('updates store if there is a optimistic response', () => {
      const input = {foo: 'bar'};
      mockMutation.getVariables.mockReturnValue(input);
      mockMutation.getOptimisticResponse.mockReturnValue({});
      mockMutation.getOptimisticConfigs.mockReturnValue('optimisticConfigs');
      RelayMutationQuery.buildQuery.mockReturnValue('optimisticQuery');

      const transaction = mutationQueue.createTransaction(mockMutation);

      expect(transaction.getStatus()).toBe(
        RelayMutationTransactionStatus.UNCOMMITTED
      );
      const buildQueryCalls = RelayMutationQuery.buildQuery.mock.calls;
      expect(buildQueryCalls.length).toBe(1);
      expect(buildQueryCalls[0][0].configs).toBe('optimisticConfigs');
      expect(buildQueryCalls[0][0].input).toEqual({
        ...input,
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
      });
      expect(buildQueryCalls[0][0].mutation).toBe(mutationNode);
      expect(buildQueryCalls[0][0].mutationName).toBe('RelayMutation');
      expect(buildQueryCalls[0][0].tracker).toBe(storeData.getQueryTracker());
      expect(buildQueryCalls[0][0].fatQuery).toEqualQueryNode(
        flattenRelayQuery(fromGraphQL.Fragment(fatQuery), {
          preserveEmptyNodes: true,
          shouldRemoveFragments: true,
        })
      );
      expect(storeData.handleUpdatePayload.mock.calls).toEqual([[
        'optimisticQuery',
        {[RelayConnectionInterface.CLIENT_MUTATION_ID]: '0'},
        {configs: 'optimisticConfigs', isOptimisticUpdate: true},
      ]]);
    });

    it('infers optimistic query if mutation does not have one', () => {
      mockMutation.getOptimisticResponse.mockReturnValue({});
      RelayMutationQuery.buildQueryForOptimisticUpdate.mockReturnValue(
        'optimisticQuery'
      );

      mutationQueue.createTransaction(mockMutation);

      const buildQueryCalls =
        RelayMutationQuery.buildQueryForOptimisticUpdate.mock.calls;
      expect(buildQueryCalls.length).toBe(1);
      expect(buildQueryCalls[0][0].mutation).toBe(mutationNode);
      expect(buildQueryCalls[0][0].response).toEqual({
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
      });
      expect(buildQueryCalls[0][0].tracker).toBe(storeData.getQueryTracker());
      expect(buildQueryCalls[0][0].fatQuery).toEqualQueryNode(
        flattenRelayQuery(fromGraphQL.Fragment(fatQuery), {
          preserveEmptyNodes: true,
          shouldRemoveFragments: true,
        })
      );
      expect(storeData.handleUpdatePayload.mock.calls).toEqual([[
        'optimisticQuery',
        {[RelayConnectionInterface.CLIENT_MUTATION_ID]: '0'},
        {configs: 'configs', isOptimisticUpdate: true},
      ]]);
    });
  });

  describe('commit', () => {
    let mockMutation1;
    let mockMutation2;
    let mockMutation3;

    beforeEach(() => {
      const fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      const mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;

      RelayMutation.prototype.getFatQuery.mockReturnValue(fatQuery);
      RelayMutation.prototype.getMutation.mockReturnValue(mutationNode);
      RelayMutation.prototype.getCollisionKey.mockReturnValue(null);
      RelayMutation.prototype.getVariables.mockReturnValue({});
      RelayMutation.prototype.getConfigs.mockReturnValue('configs');

      mockMutation1 = new RelayMutation();
      mockMutation2 = new RelayMutation();
      mockMutation3 = new RelayMutation();
      mockMutation1.getCollisionKey.mockReturnValue('key');
      mockMutation2.getCollisionKey.mockReturnValue('anotherKey');
    });

    it('throws if commit is called more than once', () => {
      const transaction = mutationQueue.createTransaction(mockMutation1);
      transaction.commit();
      expect(() => transaction.commit()).toFailInvariant(
        'RelayMutationTransaction: Only transactions with status ' +
        '`UNCOMMITTED` can be comitted.'
      );
    });

    it('calls `onSuccess` with response', () => {
      const successCallback1 = jest.genMockFunction();
      const transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onSuccess: successCallback1}
      );
      transaction1.commit();
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {'res': 'ponse'}});
      jest.runAllTimers();
      expect(successCallback1.mock.calls).toEqual([[{'res': 'ponse'}]]);
    });

    it('calls `onFailure` with transaction', () => {
      const failureCallback1 = jest.genMockFunction().mockImplementation(
        transaction => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getError()).toBe(mockError);
        }
      );
      const transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      const mockError = new Error('error');
      transaction1.commit();

      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);
      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.reject(mockError);
      jest.runAllTimers();
      expect(failureCallback1).toBeCalled();
    });

    it('queues commits for colliding transactions', () => {
      const successCallback1 = jest.genMockFunction();
      const transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onSuccess: successCallback1}
      );
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      const transaction2 = mutationQueue.createTransaction(mockMutation1);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {}});
      jest.runAllTimers();

      expect(successCallback1).toBeCalled();
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('does not queue commits for non-colliding transactions', () => {
      const transaction1 = mutationQueue.createTransaction(mockMutation1);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const transaction2 = mutationQueue.createTransaction(mockMutation2);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('does not queue commits for `null` collision key transactions', () => {
      const transaction1 = mutationQueue.createTransaction(mockMutation3);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const transaction2 = mutationQueue.createTransaction(mockMutation3);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('empties collision queue after a failure', () => {
      const failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
        }
      );
      const transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );

          preventAutoRollback();
        }
      );
      const transaction2 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback2}
      );
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(failureCallback2).toBeCalled();
      expect(() => transaction1.getStatus()).toFailInvariant(
        'RelayMutationQueue: `0` is not a valid pending transaction ID.'
      );
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
      );

      const transaction3 = mutationQueue.createTransaction(mockMutation1);
      transaction3.commit();

      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('rolls back colliding transactions on failure unless prevented', () => {
      const failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      const transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      transaction1.commit();

      const failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
        }
      );
      const transaction2 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback2}
      );
      transaction2.commit();

      const failureCallback3 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction3);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      const transaction3 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback3}
      );
      transaction3.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );

      const failureCallback4 = jest.genMockFunction().mockImplementation();
      const transaction4 = mutationQueue.createTransaction(
        mockMutation2,
        {onFailure: failureCallback4}
      );
      transaction4.commit();

      const failureCallback5 = jest.genMockFunction().mockImplementation();
      const transaction5 = mutationQueue.createTransaction(
        mockMutation2,
        {onFailure: failureCallback5}
      );
      transaction5.commit();

      expect(transaction4.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(transaction5.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);

      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(failureCallback2).toBeCalled();
      expect(failureCallback3).toBeCalled();
      expect(failureCallback4).not.toBeCalled();
      expect(failureCallback5).not.toBeCalled();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_FAILED
      );
      expect(() => transaction2.getStatus()).toFailInvariant(
        'RelayMutationQueue: `1` is not a valid pending transaction ID.'
      );
      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
      );
      expect(transaction4.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(transaction5.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
    });
  });

  describe('recommit', () => {
    let mockMutation;

    beforeEach(() => {
      const fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      const mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      RelayMutation.prototype.getFatQuery.mockReturnValue(fatQuery);
      RelayMutation.prototype.getMutation.mockReturnValue(mutationNode);
      RelayMutation.prototype.getCollisionKey.mockReturnValue('key');
      RelayMutation.prototype.getVariables.mockReturnValue({});
      RelayMutation.prototype.getConfigs.mockReturnValue('configs');

      mockMutation = new RelayMutation();
    });

    it('re-queues the transaction', () => {
      const successCallback1 = jest.genMockFunction();
      const failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          preventAutoRollback();
        }
      );
      const transaction1 = mutationQueue.createTransaction(
        mockMutation,
        {
          onSuccess: successCallback1,
          onFailure: failureCallback1,
        }
      );
      transaction1.commit();

      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);
      let request = networkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_FAILED
      );

      const successCallback2 = jest.genMockFunction();
      const transaction2 = mutationQueue.createTransaction(
        mockMutation,
        {onSuccess: successCallback2}
      );
      transaction2.commit();

      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);

      transaction1.recommit();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );

      request = networkLayer.sendMutation.mock.calls[1][0];
      request.resolve({response: {}});
      jest.runAllTimers();
      expect(successCallback2).toBeCalled();

      expect(networkLayer.sendMutation.mock.calls.length).toBe(3);
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      request = networkLayer.sendMutation.mock.calls[2][0];
      request.resolve({response: {}});
      jest.runAllTimers();

      expect(successCallback1).toBeCalled();
    });
  });

  describe('rollback', () => {
    let mockMutation1;

    beforeEach(() => {
      const fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      const mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      RelayMutation.prototype.getFatQuery.mockReturnValue(fatQuery);
      RelayMutation.prototype.getMutation.mockReturnValue(mutationNode);
      RelayMutation.prototype.getCollisionKey.mockReturnValue('key');
      RelayMutation.prototype.getVariables.mockReturnValue({});
      RelayMutation.prototype.getConfigs.mockReturnValue('configs');

      mockMutation1 = new RelayMutation();
      mockMutation1.getCollisionKey.mockReturnValue('key');
    });

    it('rollback queued transaction', () => {
      const transaction1 = mutationQueue.createTransaction(mockMutation1);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      const transaction2 = mutationQueue.createTransaction(mockMutation1);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );

      const transaction3 = mutationQueue.createTransaction(mockMutation1);
      transaction3.commit();

      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );

      expect(networkLayer.sendMutation.mock.calls.length).toBe(1);

      transaction2.rollback();

      expect(() => transaction2.getStatus()).toFailInvariant(
        'RelayMutationQueue: `1` is not a valid pending transaction ID.'
      );

      const request = networkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {'res': 'ponse'}});
      jest.runAllTimers();

      expect(networkLayer.sendMutation.mock.calls.length).toBe(2);

      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
    });
  });
});

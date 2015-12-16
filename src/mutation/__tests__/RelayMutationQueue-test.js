/**
 * Copyright 2013-2015, Facebook, Inc.
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
const RelayStoreData = require('RelayStoreData');

const flattenRelayQuery = require('flattenRelayQuery');
const fromGraphQL = require('fromGraphQL');

describe('RelayMutationQueue', () => {
  var RelayNetworkLayer;
  var storeData;
  var mutationQueue;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayNetworkLayer = jest.genMockFromModule('RelayNetworkLayer');
    jest.setMock('RelayNetworkLayer', RelayNetworkLayer);

    RelayStoreData.prototype.handleUpdatePayload = jest.genMockFunction();
    storeData = RelayStoreData.getDefaultInstance();
    mutationQueue = storeData.getMutationQueue();
  });

  describe('constructor', () => {
    var mockMutation, mutationNode, fatQuery;

    beforeEach(() => {
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      mockMutation = new RelayMutation();
      mockMutation.getFatQuery.mockReturnValue(fatQuery);
      mockMutation.getMutation.mockReturnValue(mutationNode);
      mockMutation.getConfigs.mockReturnValue('configs');
    });

    it('does not update store if there is no optimistic response', () => {
      var transaction = mutationQueue.createTransaction(mockMutation);

      expect(transaction.getStatus()).toBe(
        RelayMutationTransactionStatus.UNCOMMITTED
      );
      expect(storeData.handleUpdatePayload).not.toBeCalled();
    });

    it('updates store if there is a optimistic response', () => {
      var input = {foo: 'bar'};
      mockMutation.getVariables.mockReturnValue(input);
      mockMutation.getOptimisticResponse.mockReturnValue({});
      mockMutation.getOptimisticConfigs.mockReturnValue('optimisticConfigs');
      RelayMutationQuery.buildQuery.mockReturnValue('optimisticQuery');

      var transaction = mutationQueue.createTransaction(mockMutation);

      expect(transaction.getStatus()).toBe(
        RelayMutationTransactionStatus.UNCOMMITTED
      );
      expect(RelayMutationQuery.buildQuery.mock.calls).toEqual([[{
        configs: 'optimisticConfigs',
        fatQuery: flattenRelayQuery(fromGraphQL.Fragment(fatQuery), {
          shouldRemoveFragments: true,
        }),
        input: {
          ...input,
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        },
        mutation: mutationNode,
        mutationName: 'RelayMutation',
        tracker: storeData.getQueryTracker(),
      }]]);
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

      expect(
        RelayMutationQuery.buildQueryForOptimisticUpdate.mock.calls
      ).toEqual([[{
        fatQuery: flattenRelayQuery(fromGraphQL.Fragment(fatQuery), {
          shouldRemoveFragments: true,
        }),
        mutation: mutationNode,
        response: {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        },
        tracker: storeData.getQueryTracker(),
      }]]);
      expect(storeData.handleUpdatePayload.mock.calls).toEqual([[
        'optimisticQuery',
        {[RelayConnectionInterface.CLIENT_MUTATION_ID]: '0'},
        {configs: 'configs', isOptimisticUpdate: true},
      ]]);
    });
  });

  describe('commit', () => {
    var mockMutation1, mockMutation2, mockMutation3, mutationNode, fatQuery;

    beforeEach(() => {
      fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;

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
      var transaction = mutationQueue.createTransaction(mockMutation1);
      transaction.commit();
      expect(() => transaction.commit()).toThrowError(
        'RelayMutationTransaction: Only transactions with status ' +
        '`UNCOMMITTED` can be comitted.'
      );
    });

    it('calls `onSuccess` with response', () => {
      var successCallback1 = jest.genMockFunction();
      var transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onSuccess: successCallback1}
      );
      transaction1.commit();
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {'res': 'ponse'}});
      jest.runAllTimers();
      expect(successCallback1.mock.calls).toEqual([[{'res': 'ponse'}]]);
    });

    it('calls `onFailure` with transaction', () => {
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        transaction => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getError()).toBe(mockError);
        }
      );
      var transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      var mockError = new Error('error');
      transaction1.commit();

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);
      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(mockError);
      jest.runAllTimers();
      expect(failureCallback1).toBeCalled();
    });

    it('queues commits for colliding transactions', () => {
      var successCallback1 = jest.genMockFunction();
      var transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onSuccess: successCallback1}
      );
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      var transaction2 = mutationQueue.createTransaction(mockMutation1);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {}});
      jest.runAllTimers();

      expect(successCallback1).toBeCalled();
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('does not queue commits for non-colliding transactions', () => {
      var transaction1 = mutationQueue.createTransaction(mockMutation1);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var transaction2 = mutationQueue.createTransaction(mockMutation2);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('does not queue commits for `null` collision key transactions', () => {
      var transaction1 = mutationQueue.createTransaction(mockMutation3);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var transaction2 = mutationQueue.createTransaction(mockMutation3);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('empties collision queue after a failure', () => {
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
        }
      );
      var transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );

          preventAutoRollback();
        }
      );
      var transaction2 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback2}
      );
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(failureCallback2).toBeCalled();
      expect(() => transaction1.getStatus()).toThrowError(
        'RelayMutationQueue: `0` is not a valid pending transaction ID.'
      );
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
      );

      var transaction3 = mutationQueue.createTransaction(mockMutation1);
      transaction3.commit();

      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('rolls back colliding transactions on failure unless prevented', () => {
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      var transaction1 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback1}
      );
      transaction1.commit();

      var failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
        }
      );
      var transaction2 = mutationQueue.createTransaction(
        mockMutation1,
        {onFailure: failureCallback2}
      );
      transaction2.commit();

      var failureCallback3 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction3);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      var transaction3 = mutationQueue.createTransaction(
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

      var failureCallback4 = jest.genMockFunction().mockImplementation();
      var transaction4 = mutationQueue.createTransaction(
        mockMutation2,
        {onFailure: failureCallback4}
      );
      transaction4.commit();

      var failureCallback5 = jest.genMockFunction().mockImplementation();
      var transaction5 = mutationQueue.createTransaction(
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
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
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
      expect(() => transaction2.getStatus()).toThrowError(
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
    var mockMutation, mutationNode, fatQuery;

    beforeEach(() => {
      fatQuery = Relay.QL`fragment on Comment @relay(pattern: true) {
        ... on Comment {
          doesViewerLike
        }
      }`;
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      RelayMutation.prototype.getFatQuery.mockReturnValue(fatQuery);
      RelayMutation.prototype.getMutation.mockReturnValue(mutationNode);
      RelayMutation.prototype.getCollisionKey.mockReturnValue('key');
      RelayMutation.prototype.getVariables.mockReturnValue({});
      RelayMutation.prototype.getConfigs.mockReturnValue('configs');

      mockMutation = new RelayMutation();
    });

    it('re-queues the transaction', () => {
      var successCallback1 = jest.genMockFunction();
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          preventAutoRollback();
        }
      );
      var transaction1 = mutationQueue.createTransaction(
        mockMutation,
        {
          onSuccess: successCallback1,
          onFailure: failureCallback1,
        }
      );
      transaction1.commit();

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);
      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_FAILED
      );

      var successCallback2 = jest.genMockFunction();
      var transaction2 = mutationQueue.createTransaction(
        mockMutation,
        {onSuccess: successCallback2}
      );
      transaction2.commit();

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);

      transaction1.recommit();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );

      request = RelayNetworkLayer.sendMutation.mock.calls[1][0];
      request.resolve({response: {}});
      jest.runAllTimers();
      expect(successCallback2).toBeCalled();

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(3);
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      request = RelayNetworkLayer.sendMutation.mock.calls[2][0];
      request.resolve({response: {}});
      jest.runAllTimers();

      expect(successCallback1).toBeCalled();
    });
  });
});

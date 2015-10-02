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

require('RelayTestUtils').unmockRelay();

jest
  .dontMock('RelayMutationTransaction')
  .dontMock('RelayMutationTransactionStatus');

var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMutation = require('RelayMutation');
var RelayMutationQuery = require('RelayMutationQuery');
var RelayMutationTransaction = require('RelayMutationTransaction');
var RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
var RelayStoreData = require('RelayStoreData');
var fromGraphQL = require('fromGraphQL');

describe('RelayMutationTransaction', () => {
  var RelayNetworkLayer;
  var storeData;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayNetworkLayer = jest.genMockFromModule('RelayNetworkLayer');
    jest.setMock('RelayNetworkLayer', RelayNetworkLayer);

    fromGraphQL.Fragment = jest.genMockFunction().mockImplementation(f => f);

    RelayStoreData.prototype.handleUpdatePayload = jest.genMockFunction();
    storeData = RelayStoreData.getDefaultInstance();
  });

  describe('constructor', () => {
    var mockMutation, mutationNode;

    beforeEach(() => {
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      mockMutation = new RelayMutation();
      mockMutation.getMutation.mockReturnValue(mutationNode);
      mockMutation.getFatQuery.mockReturnValue('fatQuery');
      mockMutation.getConfigs.mockReturnValue('configs');
    });

    it('does not update store if there is no optimistic response', () => {
      var transaction = new RelayMutationTransaction(mockMutation);

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

      var transaction = new RelayMutationTransaction(mockMutation);

      expect(transaction.getStatus()).toBe(
        RelayMutationTransactionStatus.UNCOMMITTED
      );
      expect(RelayMutationQuery.buildQuery.mock.calls).toEqual([[{
        configs: 'optimisticConfigs',
        fatQuery: 'fatQuery',
        input: {
          ...input,
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        },
        mutation: mutationNode,
        mutationName: 'RelayMutation',
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

      /* eslint-disable no-new */
      new RelayMutationTransaction(mockMutation);
      /* eslint-enable no-new */

      expect(
        RelayMutationQuery.buildQueryForOptimisticUpdate.mock.calls
      ).toEqual([[{
        fatQuery: 'fatQuery',
        mutation: mutationNode,
        response: {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: '0',
        },
      }]]);
      expect(storeData.handleUpdatePayload.mock.calls).toEqual([[
        'optimisticQuery',
        {[RelayConnectionInterface.CLIENT_MUTATION_ID]: '0'},
        {configs: 'configs', isOptimisticUpdate: true},
      ]]);
    });
  });

  describe('commit', () => {
    var mockMutation1, mockMutation2, mockMutation3, mutationNode;

    beforeEach(() => {
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
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
      var transaction = new RelayMutationTransaction(mockMutation1);
      transaction.commit();
      expect(() => transaction.commit()).toThrow(
        'Invariant Violation: RelayMutationTransaction: Only transactions ' +
        'with status `UNCOMMITTED` can be comitted.'
      );
    });

    it('calls `onSuccess` with response', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      var successCallback1 = jest.genMockFunction();
      transaction1.commit({onSuccess: successCallback1});
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.resolve({response: {'res': 'ponse'}});
      jest.runAllTimers();
      expect(successCallback1.mock.calls).toEqual([[{'res': 'ponse'}]]);
    });

    it('calls `onFailure` with transaction', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      var mockError = new Error('error');
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        transaction => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getError()).toBe(mockError);
        }
      );
      transaction1.commit({onFailure: failureCallback1});

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);
      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(mockError);
      jest.runAllTimers();
      expect(failureCallback1).toBeCalled();
    });

    it('queues commits for colliding transactions', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      var successCallback1 = jest.genMockFunction();
      transaction1.commit({onSuccess: successCallback1});

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );

      var transaction2 = new RelayMutationTransaction(mockMutation1);
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
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var transaction2 = new RelayMutationTransaction(mockMutation2);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('does not queue commits for `null` collision key transactions', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation3);
      transaction1.commit();

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var transaction2 = new RelayMutationTransaction(mockMutation3);
      transaction2.commit();

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('empties collision queue after a failure', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
        }
      );
      transaction1.commit({onFailure: failureCallback1});

      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var transaction2 = new RelayMutationTransaction(mockMutation1);
      var failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );

          preventAutoRollback();
        }
      );
      transaction2.commit({onFailure: failureCallback2});

      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_QUEUED
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);

      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(failureCallback2).toBeCalled();
      expect(() => transaction1.getStatus()).toThrow(
        'Invariant Violation: RelayMutationTransaction: Only pending ' +
        'transactions can be interacted with.'
      );
      expect(transaction2.getStatus()).toBe(
        RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
      );

      var transaction3 = new RelayMutationTransaction(mockMutation1);
      transaction3.commit();

      expect(transaction3.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMITTING
      );
      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(2);
    });

    it('auto-rollbacks colliding queued transactions upon failure, unless prevented', () => {

      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction1);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      var transaction1 = new RelayMutationTransaction(mockMutation1);
      transaction1.commit({onFailure: failureCallback1});

      var failureCallback2 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction2);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
        }
      );
      var transaction2 = new RelayMutationTransaction(mockMutation1);
      transaction2.commit({onFailure: failureCallback2});

      var failureCallback3 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          expect(transaction).toBe(transaction3);
          expect(transaction.getStatus()).toBe(
            RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
          );
          preventAutoRollback();
        }
      );
      var transaction3 = new RelayMutationTransaction(mockMutation1);
      transaction3.commit({onFailure: failureCallback3});

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
      var transaction4 = new RelayMutationTransaction(mockMutation2);
      transaction4.commit({onFailure: failureCallback4});

      var failureCallback5 = jest.genMockFunction().mockImplementation();
      var transaction5 = new RelayMutationTransaction(mockMutation2);
      transaction5.commit({onFailure: failureCallback5});

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
      expect(() => transaction2.getStatus()).toThrow(
        'Invariant Violation: RelayMutationTransaction: Only pending ' +
        'transactions can be interacted with.'
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
    var mockMutation, mutationNode;

    beforeEach(() => {
      mutationNode = Relay.QL`mutation{commentCreate(input:$input)}`;
      RelayMutation.prototype.getMutation.mockReturnValue(mutationNode);
      RelayMutation.prototype.getCollisionKey.mockReturnValue('key');
      RelayMutation.prototype.getVariables.mockReturnValue({});
      RelayMutation.prototype.getConfigs.mockReturnValue('configs');

      mockMutation = new RelayMutation();
    });

    it('re-queues the transaction', () => {
      var transaction1 = new RelayMutationTransaction(mockMutation);
      var successCallback1 = jest.genMockFunction();
      var failureCallback1 = jest.genMockFunction().mockImplementation(
        (transaction, preventAutoRollback) => {
          preventAutoRollback();
        }
      );
      transaction1.commit({
        onSuccess: successCallback1,
        onFailure: failureCallback1,
      });

      expect(RelayNetworkLayer.sendMutation.mock.calls.length).toBe(1);
      var request = RelayNetworkLayer.sendMutation.mock.calls[0][0];
      request.reject(new Error('error'));
      jest.runAllTimers();

      expect(failureCallback1).toBeCalled();
      expect(transaction1.getStatus()).toBe(
        RelayMutationTransactionStatus.COMMIT_FAILED
      );

      var transaction2 = new RelayMutationTransaction(mockMutation);
      var successCallback2 = jest.genMockFunction();
      transaction2.commit({onSuccess: successCallback2});

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

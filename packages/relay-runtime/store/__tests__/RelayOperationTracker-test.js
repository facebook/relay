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

const {getRequest, graphql} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayOperationTracker = require('../RelayOperationTracker');
const invariant = require('invariant');

describe('RelayOperationTracker', () => {
  let tracker;

  let QueryOperation1;
  let QueryOperation2;
  let MutationOperation1;
  let MutationOperation2;
  beforeEach(() => {
    tracker = new RelayOperationTracker();
    const Query1 = getRequest(graphql`
      query RelayOperationTrackerTest1Query($id: ID) {
        node(id: $id) {
          id
        }
      }
    `);
    const Query2 = getRequest(graphql`
      query RelayOperationTrackerTest2Query($id: ID) {
        node(id: $id) {
          __typename
        }
      }
    `);
    const Mutation1 = getRequest(graphql`
      mutation RelayOperationTrackerTest1Mutation($input: CommentCreateInput) {
        commentCreate(input: $input) {
          __typename
        }
      }
    `);
    const Mutation2 = getRequest(graphql`
      mutation RelayOperationTrackerTest2Mutation($input: CommentDeleteInput) {
        commentDelete(input: $input) {
          __typename
        }
      }
    `);

    QueryOperation1 = createOperationDescriptor(Query1, {id: '1'}).request;
    QueryOperation2 = createOperationDescriptor(Query2, {id: '2'}).request;
    MutationOperation1 = createOperationDescriptor(Mutation1, {
      id: '1',
    }).request;
    MutationOperation2 = createOperationDescriptor(Mutation2, {
      id: '2',
    }).request;
  });

  it('should not have any pending operations affecting owners', () => {
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation1)).toBe(
      null,
    );
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation2)).toBe(
      null,
    );
  });

  it('should update fragment owners affected by operation', () => {
    tracker.update(MutationOperation1, new Set([QueryOperation1]));
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation1)?.promise,
    ).toBeInstanceOf(Promise);
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation2)).toBe(
      null,
    );
    expect(tracker.getPendingOperationsAffectingOwner(MutationOperation1)).toBe(
      null,
    );
  });

  it('should remove pending operation when it is completed', () => {
    tracker.update(
      MutationOperation1,
      new Set([QueryOperation1, QueryOperation2]),
    );
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation1)?.promise,
    ).toBeInstanceOf(Promise);
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation2)?.promise,
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation1);
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation1)).toBe(
      null,
    );
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation2)).toBe(
      null,
    );
  });

  it('should remove pending operation when it is completed when multiple operations affect the same owner', () => {
    tracker.update(MutationOperation1, new Set([QueryOperation1]));
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation1)?.promise,
    ).toBeInstanceOf(Promise);
    tracker.update(MutationOperation2, new Set([QueryOperation1]));
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation1)?.promise,
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation1);
    expect(
      tracker.getPendingOperationsAffectingOwner(QueryOperation1)?.promise,
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation2);
    expect(tracker.getPendingOperationsAffectingOwner(QueryOperation1)).toBe(
      null,
    );
  });

  describe('getPendingOperationsAffectingOwner', () => {
    it('should return null if there are no pending operations affecting owner', () => {
      expect(tracker.getPendingOperationsAffectingOwner(QueryOperation1)).toBe(
        null,
      );
    });

    it("should return a promise for operation that's been affected operation", () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const result =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result != null, 'Expected to find operations for owner.');
      expect(result.promise).toBeInstanceOf(Promise);
      expect(result.pendingOperations).toMatchObject([
        {
          identifier: MutationOperation1.identifier,
        },
      ]);
    });

    it('should return the same promise for an operation if called multiple times', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const result =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result != null, 'Expected to find operations for owner.');
      expect(result.promise).toBeInstanceOf(Promise);
      expect(result.pendingOperations).toMatchObject([
        {
          identifier: MutationOperation1.identifier,
        },
      ]);

      const result2 =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result2 !== null, 'Expected to find operations for owner.');
      expect(result2.promise).toBe(result.promise);
      expect(result2.pendingOperations).toMatchObject([
        {
          identifier: MutationOperation1.identifier,
        },
      ]);
    });

    it('should resolve promise when pending operation is completed', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const result =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result != null, 'Expected to find operations for owner.');
      const callback = jest.fn();
      result.promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.complete(MutationOperation1);
      jest.runAllTimers();
      expect(callback).toBeCalled();
      expect(tracker.getPendingOperationsAffectingOwner(QueryOperation1)).toBe(
        null,
      );
    });

    it('should resolve promise when new operation affected the owner', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const result =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result != null, 'Expected to find operations for owner.');
      const callback = jest.fn();
      result.promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.update(MutationOperation2, new Set([QueryOperation1]));
      jest.runAllTimers();
      expect(callback).toBeCalled();
      // There is one more operation that is affecting the owner
      const updatedResult =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(
        updatedResult != null,
        'Expected to find operations for owner.',
      );
      expect(updatedResult.promise).toBeInstanceOf(Promise);
      expect(updatedResult.pendingOperations).toMatchObject([
        {
          identifier: MutationOperation1.identifier,
        },
        {
          identifier: MutationOperation2.identifier,
        },
      ]);
    });

    it('should resolve promise when one of the pending operation is completed', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      tracker.update(MutationOperation2, new Set([QueryOperation1]));
      const result =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(result != null, 'Expected to find operations for owner.');
      const callback = jest.fn();
      result.promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.complete(MutationOperation1);
      jest.runAllTimers();
      expect(callback).toBeCalled();
      // But there still operations that may affect the owner
      const updatedResult =
        tracker.getPendingOperationsAffectingOwner(QueryOperation1);
      invariant(
        updatedResult != null,
        'Expected to find operations for owner.',
      );
      expect(updatedResult.promise).toBeInstanceOf(Promise);
      expect(updatedResult.pendingOperations).toMatchObject([
        {
          identifier: MutationOperation2.identifier,
        },
      ]);
    });
  });
});

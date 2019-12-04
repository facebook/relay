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

const RelayOperationTracker = require('../RelayOperationTracker');

const invariant = require('invariant');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('RelayOperationTracker', () => {
  let tracker;

  let QueryOperation1;
  let QueryOperation2;
  let MutationOperation1;
  let MutationOperation2;
  beforeEach(() => {
    tracker = new RelayOperationTracker();
    const {Query1, Query2, Mutation1, Mutation2} = generateAndCompile(`
      query Query1($id: ID) {
        node(id: $id) {
          id
        }
      }

      query Query2($id: ID) {
        node(id: $id) {
          __typename
        }
      }

      mutation Mutation1($input: CommentCreateInput) {
        commentCreate(input: $input) {
          __typename
        }
      }

      mutation Mutation2($input: CommentDeleteInput) {
        commentDelete(input: $input) {
          __typename
        }
      }
    `);

    QueryOperation1 = createOperationDescriptor(Query1, {id: '1'}).request;
    QueryOperation2 = createOperationDescriptor(Query2, {id: '2'}).request;
    MutationOperation1 = createOperationDescriptor(Mutation1, {id: '1'})
      .request;
    MutationOperation2 = createOperationDescriptor(Mutation2, {id: '2'})
      .request;
  });

  it('should not have any pending operations affecting owners', () => {
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBe(null);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation2),
    ).toBe(null);
  });

  it('should update fragment owners affected by operation', () => {
    tracker.update(MutationOperation1, new Set([QueryOperation1]));
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBeInstanceOf(Promise);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation2),
    ).toBe(null);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(MutationOperation1),
    ).toBe(null);
  });

  it('should remove pending operation when it is completed', () => {
    tracker.update(
      MutationOperation1,
      new Set([QueryOperation1, QueryOperation2]),
    );
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBeInstanceOf(Promise);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation2),
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation1);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBe(null);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation2),
    ).toBe(null);
  });

  it('should remove pending operation when it is completed when multiple operations affect the same owner', () => {
    tracker.update(MutationOperation1, new Set([QueryOperation1]));
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBeInstanceOf(Promise);
    tracker.update(MutationOperation2, new Set([QueryOperation1]));
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation1);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBeInstanceOf(Promise);
    tracker.complete(MutationOperation2);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
    ).toBe(null);
  });

  describe('getPromiseForPendingOperationsAffectingOwner', () => {
    it('should return null if there are no pending operations affecting owner', () => {
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
      ).toBe(null);
    });

    it("should return a promise for operation that's been affected operation", () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should return the same promise for an operation if called multiple times', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      expect(promise).toBeInstanceOf(Promise);

      const promise2 = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      expect(promise2).toBe(promise);
    });

    it('should resolve promise when pending operation is completed', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      invariant(promise !== null, 'Expected promise to be defined');
      const callback = jest.fn();
      promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.complete(MutationOperation1);
      jest.runAllTimers();
      expect(callback).toBeCalled();
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
      ).toBe(null);
    });

    it('should resolve promise when new operation affected the owner', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      invariant(promise !== null, 'Expected promise to be defined');
      const callback = jest.fn();
      promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.update(MutationOperation2, new Set([QueryOperation1]));
      jest.runAllTimers();
      expect(callback).toBeCalled();
      // There is one more operation that is affecting the owner
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
      ).toBeInstanceOf(Promise);
    });

    it('should resolve promise when one of the pending operation is completed', () => {
      tracker.update(MutationOperation1, new Set([QueryOperation1]));
      tracker.update(MutationOperation2, new Set([QueryOperation1]));
      const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1,
      );
      invariant(promise !== null, 'Expected promise to be defined');
      const callback = jest.fn();
      promise.then(callback);
      expect(callback).not.toBeCalled();
      tracker.complete(MutationOperation1);
      jest.runAllTimers();
      expect(callback).toBeCalled();
      // But there still operations that may affect the owner
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(QueryOperation1),
      ).toBeInstanceOf(Promise);
    });
  });
});

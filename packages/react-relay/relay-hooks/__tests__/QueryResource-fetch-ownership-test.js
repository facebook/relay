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

import type {GraphQLResponse, Sink} from 'relay-runtime';

const {getQueryResourceForEnvironment} = require('../QueryResource');
const gqlQuery = require('./__generated__/QueryResourceTest2Query.graphql');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const {
  __internal: {fetchQuery},
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

function captureSuspense(callback: () => unknown): Promise<unknown> {
  try {
    callback();
  } catch (value) {
    invariant(value instanceof Promise, 'Expected the query to suspend');
    return value;
  }
  throw new Error('Expected the query to suspend');
}

describe('QueryResource fetch ownership and GC recovery', () => {
  let environment;
  let resource;
  let operation;
  let store;
  let gcTasks: Array<() => void>;

  beforeEach(() => {
    // Exercise the normal release buffer, rather than forcing buffer size zero.
    gcTasks = [];
    store = new Store(new RecordSource(), {
      gcScheduler: task => {
        gcTasks.push(task);
      },
    });
    environment = createMockEnvironment({store});
    resource = getQueryResourceForEnvironment(environment);
    operation = createOperationDescriptor(gqlQuery, {id: 'target'});
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('refetches on revisit after a late payload and normal release-buffer churn', () => {
    const result = resource.prepare(
      operation,
      fetchQuery(environment, operation),
      'store-and-network',
      'partial',
    );
    const retained = resource.retain(result);
    retained.dispose();

    environment.mock.resolve(operation, {
      data: {
        node: {__typename: 'User', id: 'target', name: 'Before navigation'},
      },
    });
    expect(store.getSource().get('target')).toBeDefined();

    // Ten other releases evict the target operation from the default buffer.
    for (let index = 0; index < 10; index++) {
      const id = 'other-' + index;
      const other = createOperationDescriptor(gqlQuery, {id});
      const retain = environment.retain(other);
      environment.commitPayload(other, {
        node: {__typename: 'User', id, name: id},
      });
      retain.dispose();
    }
    while (gcTasks.length > 0) {
      nullthrows(gcTasks.shift())();
    }
    expect(store.getSource().get('target')).toBeUndefined();
    expect(environment.check(operation).status).toBe('missing');

    resource.prepare(
      operation,
      fetchQuery(environment, operation),
      'store-and-network',
      'partial',
    );
    expect(environment.mock.isLoading(gqlQuery, {id: 'target'})).toBe(true);

    environment.mock.resolve(operation, {
      data: {node: {__typename: 'User', id: 'target', name: 'After revisit'}},
    });
    expect(environment.lookup(operation.fragment).data).toMatchObject({
      node: {name: 'After revisit'},
    });
  });

  it.each(['next', 'error'])(
    'does not recreate a disposed entry after late %s',
    event => {
      let sink: ?Sink<GraphQLResponse>;
      const observable = Observable.create<GraphQLResponse>(value => {
        sink = value;
      });
      captureSuspense(() =>
        resource.prepare(operation, observable, 'network-only', 'full'),
      );
      jest.runAllTimers();
      expect(
        resource.TESTS_ONLY__getCacheEntry(operation, 'network-only', 'full'),
      ).toBeUndefined();

      if (event === 'next') {
        nullthrows(sink).next({data: {}});
      } else {
        nullthrows(sink).error(new Error('Late error from retired fetch'));
      }

      expect(
        resource.TESTS_ONLY__getCacheEntry(operation, 'network-only', 'full'),
      ).toBeUndefined();
    },
  );

  it('delivers a shared in-flight request to a separately retained entry', () => {
    const firstResult = resource.prepare(
      operation,
      fetchQuery(environment, operation),
      'store-and-network',
      'partial',
    );
    resource.retain(firstResult).dispose();
    const secondResult = resource.prepare(
      operation,
      fetchQuery(environment, operation),
      'store-and-network',
      'partial',
      null,
      'replacement',
    );
    const retained = resource.retain(secondResult);
    expect(environment.mock.getAllOperations()).toHaveLength(1);

    environment.mock.resolve(operation, {
      data: {node: {__typename: 'User', id: 'target', name: 'Shared result'}},
    });

    expect(
      resource.TESTS_ONLY__getCacheEntry(
        operation,
        'store-and-network',
        'partial',
      ),
    ).toBeUndefined();
    expect(
      nullthrows(
        resource.TESTS_ONLY__getCacheEntry(
          operation,
          'store-and-network',
          'partial',
          'replacement',
        ),
      ).getValue(),
    ).toEqual(secondResult);
    expect(environment.lookup(operation.fragment).data).toMatchObject({
      node: {name: 'Shared result'},
    });
    retained.dispose();
  });

  it.each(['next', 'error'])(
    'does not overwrite a replacement entry with an older fetch %s',
    event => {
      let firstSink: ?Sink<GraphQLResponse>;
      const first = Observable.create<GraphQLResponse>(value => {
        firstSink = value;
      });
      captureSuspense(() =>
        resource.prepare(operation, first, 'network-only', 'full'),
      );
      jest.runAllTimers();

      let secondSink: ?Sink<GraphQLResponse>;
      const second = Observable.create<GraphQLResponse>(value => {
        secondSink = value;
      });
      const pending = captureSuspense(() =>
        resource.prepare(operation, second, 'network-only', 'full'),
      );
      const replacement = nullthrows(
        resource.TESTS_ONLY__getCacheEntry(operation, 'network-only', 'full'),
      );

      if (event === 'next') {
        nullthrows(firstSink).next({data: {}});
      } else {
        nullthrows(firstSink).error(new Error('Old fetch failed'));
      }

      expect(replacement.getValue()).toBe(pending);
      nullthrows(secondSink).next({data: {}});
      expect(replacement.getValue()).not.toBe(pending);
    },
  );

  it('keeps a synchronous first payload renderable', () => {
    const observable = Observable.create<GraphQLResponse>(sink => {
      sink.next({data: {}});
      sink.complete();
    });
    expect(
      resource.prepare(operation, observable, 'network-only', 'full')
        .fragmentNode,
    ).toBe(operation.fragment.node);
  });

  it('throws a synchronous first error instead of a pending promise', () => {
    const error = new Error('Synchronous transport error');
    const observable = Observable.create<GraphQLResponse>(sink =>
      sink.error(error),
    );
    expect(() =>
      resource.prepare(operation, observable, 'network-only', 'full'),
    ).toThrow(error);
  });
});

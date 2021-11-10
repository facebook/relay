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
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  RecordSourceProxy,
  HandleFieldPayload,
} from 'relay-runtime/store/RelayStoreTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  createReaderSelector,
  getSingularSelector,
} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() a query with multiple @stream selections on the same record', () => {
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let next;
  let operation;
  let query;
  let selector;
  let variables;
  let source;
  let store;
  let deferFragment;

  beforeEach(() => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery(
        $id: ID!
        $enableStream: Boolean!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment
        }
      }
    `);
    fragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment on Feedback {
        id
        actors
          @stream(label: "actors", if: $enableStream, initial_count: 0)
          @__clientField(handle: "actors_handler") {
          name @__clientField(handle: "name_handler")
        }
        ...RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment
          @defer(label: "viewedBy", if: $enableStream)
      }
    `);
    deferFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment on Feedback {
        viewedBy
          @stream(label: "viewedBy", if: $enableStream, initial_count: 0)
          @__clientField(handle: "actors_handler") {
          name @__clientField(handle: "name_handler")
        }
      }
    `);
    variables = {id: '1', enableStream: true};
    operation = createOperationDescriptor(query, variables);
    selector = createReaderSelector(fragment, '1', {}, operation.request);
    // Handler to upper-case the value of the (string) field to which it's
    // applied
    const NameHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const name = record.getValue(payload.fieldKey);
          record.setValue(
            typeof name === 'string' ? name.toUpperCase() : null,
            payload.handleKey,
          );
        }
      },
    };
    // Handler that simply copies the plural linked source field to the
    // synthesized client field: this is just to check whether the handler
    // ran or not.
    const ActorsHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const actors = record.getLinkedRecords(payload.fieldKey);
          if (actors == null) {
            record.setValue(actors, payload.handleKey);
          } else {
            record.setLinkedRecords(actors, payload.handleKey);
          }
        }
      },
    };

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
    ) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    };
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
          case 'actors_handler':
            return ActorsHandler;
        }
      },
    });
  });

  it('calls next() and publishes the initial payload to the store', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [],
      __fragments: {
        RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment: {},
      },
      __fragmentOwner: operation.request,
      __isWithinUnmatchedTypeRefinement: false,
      __id: '1',
    });
    const deferSelector = nullthrows(
      getSingularSelector(deferFragment, snapshot.data),
    );
    const deferSnapshot = environment.lookup(deferSelector);
    expect(deferSnapshot.isMissingData).toBe(true);
    expect(deferSnapshot.data).toEqual({
      viewedBy: undefined,
    });
  });

  it('processes sequential payloads (all actors, then all viewedBy)', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    const deferCallback = jest.fn();

    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    const deferSelector = nullthrows(
      getSingularSelector(deferFragment, callback.mock.calls[0][0].data),
    );
    const deferSnapshot = environment.lookup(deferSelector);
    expect(deferSnapshot.isMissingData).toBe(true);
    environment.subscribe(deferSnapshot, deferCallback);
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    expect(deferCallback).toBeCalledTimes(0);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      __fragments: {
        RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment: {},
      },
      __fragmentOwner: operation.request,
      __isWithinUnmatchedTypeRefinement: false,
      __id: '1',
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(0);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      __fragments: {
        RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment: {},
      },
      __fragmentOwner: operation.request,
      __isWithinUnmatchedTypeRefinement: false,
      __id: '1',
    });

    dataSource.next({
      data: {
        viewedBy: [],
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$defer$viewedBy',
      path: ['node'],
    });
    expect(next).toBeCalledTimes(3);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(1);
    const snapshot3 = deferCallback.mock.calls[0][0];
    expect(snapshot3.isMissingData).toEqual(false);
    expect(deferCallback.mock.calls[0][0].data).toEqual({
      viewedBy: [],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '4',
        name: 'Claire',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 0],
    });
    expect(next).toBeCalledTimes(4);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(2);
    const snapshot4 = deferCallback.mock.calls[1][0];
    expect(snapshot4.isMissingData).toEqual(false);
    expect(snapshot4.data).toEqual({
      viewedBy: [{name: 'CLAIRE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '5',
        name: 'Dave',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 1],
    });
    expect(next).toBeCalledTimes(5);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(3);
    const snapshot5 = deferCallback.mock.calls[2][0];
    expect(snapshot5.isMissingData).toBe(false);
    expect(snapshot5.data).toEqual({
      viewedBy: [{name: 'CLAIRE'}, {name: 'DAVE'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes interleaved streamed payloads (actor/viewedBy/actor/viewedBy)', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    const deferCallback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    const deferSelector = nullthrows(
      getSingularSelector(deferFragment, callback.mock.calls[0][0].data),
    );
    const deferSnapshot = environment.lookup(deferSelector);
    expect(deferSnapshot.isMissingData).toBe(true);
    environment.subscribe(deferSnapshot, deferCallback);
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    expect(deferCallback).toBeCalledTimes(0);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      __fragments: {
        RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment: {},
      },
      __fragmentOwner: operation.request,
      __isWithinUnmatchedTypeRefinement: false,
      __id: '1',
    });

    dataSource.next({
      data: {
        viewedBy: [],
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$defer$viewedBy',
      path: ['node'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(1);
    expect(deferCallback).toBeCalledTimes(1);
    const snapshot2 = deferCallback.mock.calls[0][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      viewedBy: [],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '4',
        name: 'Claire',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(3);
    expect(callback).toBeCalledTimes(1);
    expect(deferCallback).toBeCalledTimes(2);
    const snapshot3 = deferCallback.mock.calls[1][0];
    expect(snapshot3.isMissingData).toBe(false);
    expect(snapshot3.data).toEqual({
      viewedBy: [{name: 'CLAIRE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(4);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(2);
    const snapshot4 = callback.mock.calls[1][0];
    expect(snapshot4.isMissingData).toBe(false);
    expect(snapshot4.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      __fragments: {
        RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment: {},
      },
      __fragmentOwner: operation.request,
      __isWithinUnmatchedTypeRefinement: false,
      __id: '1',
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '5',
        name: 'Dave',
      },
      label:
        'RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 1],
    });
    expect(next).toBeCalledTimes(5);
    expect(callback).toBeCalledTimes(2);
    expect(deferCallback).toBeCalledTimes(3);

    const snapshot5 = deferCallback.mock.calls[2][0];
    expect(snapshot5.isMissingData).toBe(false);
    expect(snapshot5.data).toEqual({
      viewedBy: [{name: 'CLAIRE'}, {name: 'DAVE'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });
});

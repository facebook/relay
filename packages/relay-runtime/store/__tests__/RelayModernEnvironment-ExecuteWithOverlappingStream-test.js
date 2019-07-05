/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {generateAndCompile, matchers} = require('relay-test-utils-internal');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succinct description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('execute() a query with multiple @stream selections on the same record', () => {
  let actorFragment;
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

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect.extend(matchers);
    ({
      FeedbackQuery: query,
      FeedbackFragment: fragment,
      ActorFragment: actorFragment,
    } = generateAndCompile(`
        query FeedbackQuery($id: ID!, $enableStream: Boolean!) {
          node(id: $id) {
            ...FeedbackFragment
          }
        }

        fragment FeedbackFragment on Feedback {
          id
          actors
          @stream(label: "actors", if: $enableStream, initial_count: 0)
          @__clientField(handle: "actors_handler") {
            name @__clientField(handle: "name_handler")
          }
          ... @defer(label: "viewedBy", if: $enableStream) {
            viewedBy
            @stream(label: "viewedBy", if: $enableStream, initial_count: 0)
            @__clientField(handle: "actors_handler") {
              name @__clientField(handle: "name_handler")
            }
          }
        }

        # keep in sync with above
        fragment ActorFragment on Actor {
          name @__clientField(handle: "name_handler")
        }
      `));
    variables = {id: '1', enableStream: true};
    operation = createOperationDescriptor(query, variables);
    selector = {
      dataID: '1',
      node: fragment,
      variables: {},
    };

    // Handler to upper-case the value of the (string) field to which it's
    // applied
    const NameHandler = {
      update(storeProxy, payload) {
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
      update(storeProxy, payload) {
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
    fetch = (_query, _variables, _cacheConfig) => {
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
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [],
      viewedBy: undefined,
    });
  });

  it('processes sequential payloads (all actors, then all viewedBy)', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
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
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      viewedBy: undefined,
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(true);
    expect(snapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: undefined,
    });

    dataSource.next({
      data: {
        viewedBy: [],
      },
      label: 'FeedbackFragment$defer$viewedBy',
      path: ['node'],
    });
    expect(next).toBeCalledTimes(3);
    expect(callback).toBeCalledTimes(3);
    const snapshot3 = callback.mock.calls[2][0];
    expect(snapshot3.isMissingData).toBe(false);
    expect(snapshot3.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: [],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '4',
        name: 'Claire',
      },
      label: 'FeedbackFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 0],
    });
    expect(next).toBeCalledTimes(4);
    expect(callback).toBeCalledTimes(4);
    const snapshot4 = callback.mock.calls[3][0];
    expect(snapshot4.isMissingData).toBe(false);
    expect(snapshot4.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: [{name: 'CLAIRE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '5',
        name: 'Dave',
      },
      label: 'FeedbackFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 1],
    });
    expect(next).toBeCalledTimes(5);
    expect(callback).toBeCalledTimes(5);
    const snapshot5 = callback.mock.calls[4][0];
    expect(snapshot5.isMissingData).toBe(false);
    expect(snapshot5.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: [{name: 'CLAIRE'}, {name: 'DAVE'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes interleaved streamed payloads (actor/viewedBy/actor/viewedBy)', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
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
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      viewedBy: undefined,
    });

    dataSource.next({
      data: {
        viewedBy: [],
      },
      label: 'FeedbackFragment$defer$viewedBy',
      path: ['node'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      viewedBy: [],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '4',
        name: 'Claire',
      },
      label: 'FeedbackFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(3);
    expect(callback).toBeCalledTimes(3);
    const snapshot3 = callback.mock.calls[2][0];
    expect(snapshot3.isMissingData).toBe(false);
    expect(snapshot3.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
      viewedBy: [{name: 'CLAIRE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(4);
    expect(callback).toBeCalledTimes(4);
    const snapshot4 = callback.mock.calls[3][0];
    expect(snapshot4.isMissingData).toBe(false);
    expect(snapshot4.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: [{name: 'CLAIRE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '5',
        name: 'Dave',
      },
      label: 'FeedbackFragment$stream$viewedBy',
      path: ['node', 'viewedBy', 1],
    });
    expect(next).toBeCalledTimes(5);
    expect(callback).toBeCalledTimes(5);
    const snapshot5 = callback.mock.calls[4][0];
    expect(snapshot5.isMissingData).toBe(false);
    expect(snapshot5.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
      viewedBy: [{name: 'CLAIRE'}, {name: 'DAVE'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });
});

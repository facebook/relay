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

const {fetchQuery_UNSTABLE} = require('../fetchQuery_UNSTABLE');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');

describe('fetchQuery_UNSTABLE', () => {
  let query;
  let environment;
  let retained = [];
  const response = {
    data: {
      node: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
      },
    },
  };
  beforeEach(() => {
    retained = [];
    environment = createMockEnvironment();
    environment.retain.mockImplementation(obj => {
      retained.push(obj);
      return {
        dispose: () => {
          retained = retained.filter(o => o !== obj);
        },
      };
    });
    query = generateAndCompile(
      `query TestQuery($id: ID!) {
          node(id: $id) {
            id
          }
        }
      `,
    ).TestQuery;
  });

  test('fetches request and retains data correctly', () => {
    let calledObserver = false;
    const observer = {
      complete: () => {
        calledObserver = true;
        expect(retained.length).toEqual(1);
      },
    };
    const disposable = fetchQuery_UNSTABLE({
      environment,
      query,
      variables: {id: '4'},
      observer,
    });
    environment.mock.nextValue(query, response);
    environment.mock.complete(query);
    disposable.dispose();
    expect(calledObserver).toEqual(true);
    expect(retained.length).toEqual(0);
  });

  test('unsubscribes and releases data when request is disposed', () => {
    let calledNext = false;
    let calledUnsubscribe = false;
    const observer = {
      next: () => {
        calledNext = true;
        expect(retained.length).toEqual(1);
      },
      unsubscribe: () => {
        calledUnsubscribe = true;
        expect(retained.length).toEqual(0);
      },
    };
    const disposable = fetchQuery_UNSTABLE({
      environment,
      query,
      variables: {id: '4'},
      observer,
    });
    environment.mock.nextValue(query, response);
    disposable.dispose();
    expect(calledNext).toEqual(true);
    expect(calledUnsubscribe).toEqual(true);
  });

  describe('when making a request that is already in flight', () => {
    it('doesnt dedupe requests if using different environments', () => {
      const environment2 = createMockEnvironment();
      let calledObserver1 = false;
      const observer1 = {
        complete: () => {
          calledObserver1 = true;
        },
      };
      const observer2 = {
        complete: () => {
          expect(calledObserver1).toEqual(true);
        },
      };
      const disposable1 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer1,
      });
      const disposable2 = fetchQuery_UNSTABLE({
        environment: environment2,
        query,
        variables: {id: '4'},
        observer: observer2,
      });
      environment.mock.nextValue(query, response);
      environment2.mock.nextValue(query, response);
      environment.mock.complete(query);
      environment2.mock.complete(query);
      disposable1.dispose();
      disposable2.dispose();
      expect(environment.execute).toHaveBeenCalledTimes(1);
      expect(environment2.execute).toHaveBeenCalledTimes(1);
    });

    it('dedupes request and notifies all observers', () => {
      let calledObserver1 = false;
      let calledObserver2 = false;
      const observer1 = {
        complete: () => {
          calledObserver1 = true;
        },
      };
      const observer2 = {
        complete: () => {
          calledObserver2 = true;
        },
      };
      const disposable1 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer1,
      });
      const disposable2 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer2,
      });
      environment.mock.nextValue(query, response);
      environment.mock.complete(query);
      disposable1.dispose();
      disposable2.dispose();
      expect(environment.execute).toHaveBeenCalledTimes(1);
      expect(calledObserver1).toEqual(true);
      expect(calledObserver2).toEqual(true);
    });

    it('dedupes request and notifies observers of events that were missed', () => {
      let observer1Payload = null;
      let calledObserver1Complete = false;
      let observer2Payload = null;
      let calledObserver2Complete = false;
      const observer1 = {
        next: payload => {
          observer1Payload = payload;
        },
        complete: () => {
          calledObserver1Complete = true;
        },
      };
      const observer2 = {
        next: payload => {
          observer2Payload = payload;
        },
        complete: () => {
          calledObserver2Complete = true;
        },
      };
      const disposable1 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer1,
      });
      environment.mock.nextValue(query, response);
      const disposable2 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer2,
      });
      environment.mock.complete(query);
      disposable1.dispose();
      disposable2.dispose();
      expect(environment.execute).toHaveBeenCalledTimes(1);
      expect(observer1Payload).not.toEqual(null);
      expect(observer2Payload).not.toEqual(null);
      expect(observer1Payload).toEqual(observer2Payload);
      expect(calledObserver1Complete).toEqual(true);
      expect(calledObserver2Complete).toEqual(true);
    });

    test('disposes of data and unsubscribes from request until last observer is disposed of', () => {
      let unsubscribedObserver1 = false;
      let unsubscribedObserver2 = false;
      const observer1 = {
        unsubscribe: () => {
          unsubscribedObserver1 = true;
        },
      };
      const observer2 = {
        unsubscribe: () => {
          unsubscribedObserver2 = true;
        },
      };
      const disposable1 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer1,
      });
      const disposable2 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer2,
      });
      environment.mock.nextValue(query, response);
      expect(unsubscribedObserver1).toEqual(false);
      expect(unsubscribedObserver2).toEqual(false);
      expect(retained.length).toEqual(1);
      disposable1.dispose();
      expect(unsubscribedObserver1).toEqual(false);
      expect(unsubscribedObserver2).toEqual(false);
      expect(retained.length).toEqual(1);
      disposable2.dispose();
      expect(unsubscribedObserver1).toEqual(true);
      expect(unsubscribedObserver2).toEqual(true);
      expect(retained.length).toEqual(0);
      expect(environment.execute).toHaveBeenCalledTimes(1);
    });

    test('disposes of data until last observer is disposed of even after request completes', () => {
      let calledObserver1 = false;
      let calledObserver2 = false;
      const observer1 = {
        complete: () => {
          calledObserver1 = true;
        },
      };
      const observer2 = {
        complete: () => {
          calledObserver2 = true;
        },
      };
      const disposable1 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer1,
      });
      const disposable2 = fetchQuery_UNSTABLE({
        environment,
        query,
        variables: {id: '4'},
        observer: observer2,
      });
      environment.mock.nextValue(query, response);
      environment.mock.complete(query);
      expect(calledObserver1).toEqual(true);
      expect(calledObserver2).toEqual(true);
      expect(retained.length).toEqual(1);
      disposable1.dispose();
      expect(retained.length).toEqual(1);
      disposable2.dispose();
      expect(retained.length).toEqual(0);
      expect(environment.execute).toHaveBeenCalledTimes(1);
    });
  });
});

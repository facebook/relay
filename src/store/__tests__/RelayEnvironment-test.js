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

jest
  .dontMock('GraphQLStoreChangeEmitter')
  .autoMockOff();

const RelayEnvironment = require('RelayEnvironment');
const {ROOT_ID} = require('RelayStoreConstants');
const RelayTestUtils = require('RelayTestUtils');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const {graphql} = require('RelayGraphQLTag');

describe('RelayFragmentSpecResolver', () => {
  let UserQuery;
  let environment;

  function setName(id, name) {
    environment.getStoreData().getNodeData()[id].name = name;
    environment.getStoreData().getChangeEmitter().broadcastChangeForID(id);
    jest.runAllTimers();
  }

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);

    environment = new RelayEnvironment();

    UserQuery = graphql`
      query RelayEnvironmentQuery($id: ID!, $size: Int) {
        user: node(id: $id) {
          id
          name
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `.relay();

    const nodeAlias = generateRQLFieldAlias('node.user.id(4)');
    const photoAlias = generateRQLFieldAlias('profilePicture.size(1)');
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      },
      {
        [nodeAlias]: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          [photoAlias]: {
            uri: 'https://4.jpg',
          },
        },
      },
    );
    jest.runAllTimers();
  });

  describe('lookup()', () => {
    it('returns the results of executing a query', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      expect(snapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Zuck',
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
    });
  });

  describe('subscribe()', () => {
    it('calls the callback if data changes', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);
      expect(callback).not.toBeCalled();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback.mock.calls.length).toBe(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Mark', // updated value
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
      expect(nextSnapshot.data).not.toBe(snapshot.data);
      expect(nextSnapshot.data.user).not.toBe(snapshot.data.user);
      // Unchanged portions of the results are === to previous values
      expect(nextSnapshot.data.user.profilePicture)
        .toBe(snapshot.data.user.profilePicture);
    });

    it('does not call the callback if disposed', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      const {dispose} = environment.subscribe(snapshot, callback);
      dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
    });
  });
});

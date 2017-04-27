/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff();

const RelayModernFragmentSpecResolver = require('RelayModernFragmentSpecResolver');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {ROOT_ID} = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');

describe('RelayModernFragmentSpecResolver', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let context;
  let environment;
  let zuck;
  let beast;
  let variables;

  function setName(id, name) {
    environment.applyUpdate(store => {
      const user = store.get(id);
      user.setValue(name, 'name');
    });
  }

  function setPhotoUri(id, size, uri) {
    environment.applyUpdate(store => {
      const user = store.get(id);
      const profilePicture = user.getOrCreateLinkedRecord('profilePicture', 'Image', {size});
      profilePicture.setValue(uri, 'uri');
    });
  }

  beforeEach(() => {
    jasmine.addMatchers(RelayModernTestUtils.matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery, UsersFragment} = environment.mock.compile(`
      query UserQuery($id: ID! $size: Int $fetchSize: Boolean!) {
        node(id: $id) {
          ...UserFragment
          ...UsersFragment
        }
      }
      fragment UserFragment on User {
        id
        name
        profilePicture(size: $size) @include(if: $fetchSize) {
          uri
        }
      }
      fragment UsersFragment on User @relay(plural: true) {
        id
        name
        profilePicture(size: $size) @include(if: $fetchSize) {
          uri
        }
      }
    `));
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.query,
        variables: {fetchSize: false, id: '4', size: null},
      },
      {
        node: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
      },
    );
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.query,
        variables: {fetchSize: false, id: 'beast', size: null},
      },
      {
        node: {
          id: 'beast',
          __typename: 'User',
          name: 'Beast',
        },
      },
    );
    zuck = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    beast = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: 'beast'},
    }).data.node;

    variables = {
      fetchSize: false,
      id: '4',
      size: null,
    };
    context = {environment, variables};
  });

  it('ignores non-fragment data, sets missing fragment props to null', () => {
    const resolver = new RelayModernFragmentSpecResolver(
      context,
      {user: UserFragment},
      {foo: 'foo', bar: 42},
      jest.fn(),
    );
    expect(resolver.resolve()).toEqual({
      user: null, // set to null since prop is missing
    });
  });

  describe('singular props', () => {
    it('passes through null-ish values', () => {
      let resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: null},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: undefined},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
    });

    it('passes through mock values', () => {
      const user = {};
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user},
        jest.fn(),
      );
      expect(resolver.resolve().user).toBe(user);
    });

    it('disposes with null props', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: null},
        jest.fn(),
      );
      expect(() => resolver.dispose()).not.toThrow();
    });

    it('resolves fragment data', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('calls callback when fragment data changes', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        callback,
      );
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: {
          id: '4',
          name: 'Mark',
        },
      });
    });

    it('disposes subscriptions', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        callback,
      );
      resolver.dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: {
          id: '4',
          name: 'Zuck', // does not reflect latest changes
        },
      });
    });

    describe('setProps()', () => {
      let callback;
      let resolver;

      beforeEach(() => {
        callback = jest.fn();
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          callback,
        );
      });

      it('cancels subscriptions if a prop is set to null', () => {
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user: null});
        expect(dispose).toBeCalled();
      });

      it('cancels subscriptions if a prop is set to a mock value', () => {
        const user = {};
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user});
        expect(dispose).toBeCalled();
        expect(resolver.resolve().user).toBe(user);
      });

      it('creates a subscription if a prop is set to non-mock value', () => {
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: {}},
          callback,
        );
        resolver.setProps({user: zuck});
        expect(callback).not.toBeCalled();
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: {
            id: '4',
            name: 'Mark', // reflects updated value
          },
        });
      });

      it('returns === data if props do not change', () => {
        const prevData = resolver.resolve();
        resolver.setProps({user: zuck});
        expect(resolver.resolve()).toBe(prevData);
        expect(resolver.resolve().user).toBe(prevData.user);
      });

      it('resolves fragment data if a prop changes', () => {
        resolver.setProps({user: beast});
        expect(resolver.resolve()).toEqual({
          user: {
            id: 'beast',
            name: 'Beast',
          },
        });
      });

      it('cancels subscriptions if a prop changes', () => {
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user: beast});
        expect(dispose).toBeCalled();
      });

      it('calls callback when fragment data changes', () => {
        resolver.setProps({user: beast});
        expect(callback).not.toBeCalled();
        setName('beast', 'BEAST'); // all caps
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: {
            id: 'beast',
            name: 'BEAST', // reflects updated value
          },
        });
      });

      it('disposes subscriptions', () => {
        resolver.setProps({user: beast});
        expect(callback).not.toBeCalled();
        resolver.dispose();
        setName('beast', 'BEAST'); // all caps
        expect(callback).not.toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: {
            id: 'beast',
            name: 'Beast', // does not update
          },
        });
      });
    });

    describe('setVariables()', () => {
      let callback;
      let resolver;

      beforeEach(() => {
        callback = jest.fn();
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          callback,
        );
      });

      it('does nothing if variables are equivalent', () => {
        const prevData = resolver.resolve();
        const dispose = environment.subscribe.mock.dispose;
        environment.lookup.mockClear();
        environment.subscribe.mockClear();

        resolver.setVariables({
          fetchSize: false,
          size: null,
        });
        expect(dispose).not.toBeCalled();
        expect(environment.lookup).not.toBeCalled();
        expect(environment.subscribe).not.toBeCalled();
        expect(resolver.resolve()).toBe(prevData);
      });

      it('resolves fragment data when variables change', () => {
        const dispose = environment.subscribe.mock.dispose;
        setPhotoUri('4', 1, 'https://4.jpg');
        expect(dispose).not.toBeCalled();
        resolver.setVariables({
          fetchSize: true,
          size: 1,
        });
        expect(callback).not.toBeCalled();
        expect(dispose).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: {
            id: '4',
            name: 'Zuck',
            profilePicture: {
              uri: 'https://4.jpg',
            },
          },
        });
      });

      it('calls callback when fragment data changes', () => {
        setPhotoUri('4', 1, 'https://4.jpg');
        resolver.setVariables({
          fetchSize: true,
          size: 1,
        });
        expect(callback).not.toBeCalled();
        setPhotoUri('4', 1, 'https://zuck.jpg');
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: {
            id: '4',
            name: 'Zuck',
            profilePicture: {
              uri: 'https://zuck.jpg',
            },
          },
        });
      });
    });
  });

  describe('plural props', () => {
    it('passes through null-ish values', () => {
      let resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: null},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: undefined},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
    });

    it('passes through mock values', () => {
      const users = [{}];
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: users},
        jest.fn(),
      );
      expect(resolver.resolve().user).toBe(users);
    });

    it('resolves fragment data', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: [{
          id: '4',
          name: 'Zuck',
        }],
      });
    });

    it('calls callback when fragment data changes', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        callback,
      );
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: [{
          id: '4',
          name: 'Mark',
        }],
      });
    });

    it('disposes subscriptions', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        callback,
      );
      resolver.dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: [{
          id: '4',
          name: 'Zuck', // does not reflect latest changes
        }],
      });
    });

    describe('setProps()', () => {
      let callback;
      let resolver;

      beforeEach(() => {
        callback = jest.fn();
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UsersFragment},
          {user: [zuck]},
          callback,
        );
      });

      it('cancels subscriptions if a prop is set to null', () => {
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user: null});
        expect(dispose).toBeCalled();
      });

      it('cancels subscriptions if a prop is set to a mock value', () => {
        const users = [{}];
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user: users});
        expect(dispose).toBeCalled();
        expect(resolver.resolve().user).toBe(users);
      });

      it('creates a subscription if a prop is set to non-mock value', () => {
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UsersFragment},
          {user: [{}]},
          callback,
        );
        resolver.setProps({user: [zuck]});
        expect(callback).not.toBeCalled();
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Mark', // reflects updated value
          }],
        });
      });

      it('returns === data if the props do not change', () => {
        const prevData = resolver.resolve();
        resolver.setProps({user: [zuck]}); // zuck -> zuck
        expect(resolver.resolve()).toBe(prevData);
        expect(resolver.resolve()[0]).toBe(prevData[0]);
      });

      it('resolves fragment data if a prop changes', () => {
        resolver.setProps({user: [beast]}); // zuck -> beast
        expect(resolver.resolve()).toEqual({
          user: [{
            id: 'beast',
            name: 'Beast',
          }],
        });
      });

      it('cancels subscriptions if a prop changes', () => {
        const dispose = environment.subscribe.mock.dispose;
        expect(dispose).not.toBeCalled();
        resolver.setProps({user: [beast]}); // zuck -> beast
        expect(dispose).toBeCalled();
      });

      it('calls callback when fragment data changes', () => {
        resolver.setProps({user: [beast]}); // zuck -> beast
        expect(callback).not.toBeCalled();
        setName('beast', 'BEAST'); // all caps
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: 'beast',
            name: 'BEAST', // reflects updated value
          }],
        });
      });

      it('disposes subscriptions', () => {
        resolver.setProps({user: [beast]}); // zuck -> beast
        expect(callback).not.toBeCalled();
        resolver.dispose();
        setName('beast', 'BEAST'); // all caps
        expect(callback).not.toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: 'beast',
            name: 'Beast', // does not update
          }],
        });
      });

      it('resolves added items', () => {
        resolver.setProps({user: [zuck, beast]}); // add beast
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Zuck',
          }, {
            id: 'beast',
            name: 'Beast',
          }],
        });
      });

      it('subscribes to added items', () => {
        environment.subscribe.mockClear();
        resolver.setProps({user: [zuck, beast]}); // add beast
        // Should only subscribe to the new item
        expect(environment.subscribe.mock.calls.length).toBe(1);
        setName('beast', 'BEAST'); // all caps
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Zuck',
          }, {
            id: 'beast',
            name: 'BEAST', // updated value
          }],
        });
      });

      it('retains subscription to unchanged items', () => {
        resolver.setProps({user: [zuck, beast]}); // add beast
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Mark',
          }, {
            id: 'beast',
            name: 'Beast',
          }],
        });
      });

      it('unsubscribes from removed items', () => {
        resolver.setProps({user: []});
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).not.toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [],
        });
      });
    });

    describe('setVariables()', () => {
      let callback;
      let resolver;

      beforeEach(() => {
        callback = jest.fn();
        resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UsersFragment},
          {user: [zuck]},
          callback,
        );
      });

      it('does nothing if variables are equivalent', () => {
        const prevData = resolver.resolve();
        const dispose = environment.subscribe.mock.dispose;
        environment.lookup.mockClear();
        environment.subscribe.mockClear();

        resolver.setVariables({
          fetchSize: false,
          size: null,
        });
        expect(dispose).not.toBeCalled();
        expect(environment.lookup).not.toBeCalled();
        expect(environment.subscribe).not.toBeCalled();
        expect(resolver.resolve()).toBe(prevData);
      });

      it('resolves fragment data when variables change', () => {
        const dispose = environment.subscribe.mock.dispose;
        setPhotoUri('4', 1, 'https://4.jpg');
        expect(dispose).not.toBeCalled();
        resolver.setVariables({
          fetchSize: true,
          size: 1,
        });
        expect(callback).not.toBeCalled();
        expect(dispose).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Zuck',
            profilePicture: {
              uri: 'https://4.jpg',
            },
          }],
        });
      });

      it('calls callback when fragment data changes', () => {
        setPhotoUri('4', 1, 'https://4.jpg');
        resolver.setVariables({
          fetchSize: true,
          size: 1,
        });
        expect(callback).not.toBeCalled();
        setPhotoUri('4', 1, 'https://zuck.jpg');
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [{
            id: '4',
            name: 'Zuck',
            profilePicture: {
              uri: 'https://zuck.jpg',
            },
          }],
        });
      });
    });
  });
});

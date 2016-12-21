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
  .dontMock('GraphQLStoreChangeEmitter')
  .mock('relayUnstableBatchedUpdates')
  .autoMockOff();

const RelayEnvironment = require('RelayEnvironment');
const RelayFragmentSpecResolver = require('RelayFragmentSpecResolver');
const {ROOT_ID} = require('RelayStoreConstants');
const RelayTestUtils = require('RelayTestUtils');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const {graphql} = require('RelayGraphQLTag');

describe('RelayFragmentSpecResolver', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let context;
  let environment;
  let zuck;
  let beast;
  let variables;

  function mockInstanceMethod(object, key) {
    object[key] = jest.fn(object[key].bind(object));
  }

  function mockDisposableMethod(object, key) {
    const fn = object[key].bind(object);
    object[key] = jest.fn((...args) => {
      const disposable = fn(...args);
      const dispose = jest.fn(() => disposable.dispose());
      object[key].mock.dispose = dispose;
      return {dispose};
    });
    const mockClear = object[key].mockClear.bind(object[key]);
    object[key].mockClear = () => {
      mockClear();
      object[key].mock.dispose = null;
    };
  }

  function setName(id, name) {
    const nodeAlias = generateRQLFieldAlias(`node.id(${id})`);
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {
          fetchSize: false,
          id,
          size: null,
        },
      },
      {
        [nodeAlias]: {
          id,
          __typename: 'User',
          name,
        },
      },
    );
    jest.runAllTimers();
  }

  function setPhotoUri(id, size, uri) {
    const nodeAlias = generateRQLFieldAlias(`node.id(${id})`);
    const photoAlias = generateRQLFieldAlias(`profilePicture.size(${size})`);
    // If name is not specified it will be nulled out
    const name = environment.getStoreData().getNodeData()[id].name;
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {
          fetchSize: true,
          id,
          size,
        },
      },
      {
        [nodeAlias]: {
          id,
          name,
          __typename: 'User',
          [photoAlias]: {
            uri,
          },
        },
      },
    );
    jest.runAllTimers();
  }

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);

    environment = new RelayEnvironment();
    mockInstanceMethod(environment, 'lookup');
    mockDisposableMethod(environment, 'subscribe');

    const fragments = {
      user: graphql`
        fragment RelayFragmentSpecResolver_user on User {
          id
          name
          profilePicture(size: $size) @include(if: $fetchSize) {
            uri
          }
        }
      `.relay(),
      users: graphql`
        fragment RelayFragmentSpecResolver_users on User @relay(plural: true) {
          id
          name
          profilePicture(size: $size) @include(if: $fetchSize) {
            uri
          }
        }
      `.relay(),
    };
    // Fake a container: The `...Container_*` fragment spreads below are
    // transformed to `Container.getFragment('*')` calls.
    //
    // eslint-disable-next-line no-unused-vars
    const Container = {
      getFragment(name) {
        return {
          kind: 'FragmentSpread',
          args: {},
          fragment: fragments[name],
        };
      },
    };
    UserQuery = graphql`
      query RelayFragmentSpecResolverQuery($id: ID!, $size: Int, $fetchSize: Boolean!) {
        node(id: $id) {
          ...Container_user
          ...Container_users
        }
      }
    `.relay();
    UserFragment = fragments.user;
    UsersFragment = fragments.users;

    let nodeAlias = generateRQLFieldAlias('node.id(4)');
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {fetchSize: false, id: '4', size: null},
      },
      {
        [nodeAlias]: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
      },
    );
    nodeAlias = generateRQLFieldAlias('node.id(beast)');
    environment.commitPayload(
      {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {fetchSize: false, id: 'beast', size: null},
      },
      {
        [nodeAlias]: {
          id: 'beast',
          __typename: 'User',
          name: 'Beast',
        },
      },
    );
    // Initial changes must be flushed or else future updates from
    // setName()/setPhotoUri() will be ignored.
    jest.runAllTimers();

    zuck = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.node,
      variables: {id: '4', size: null, fetchSize: false},
    }).data.node;
    beast = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.node,
      variables: {id: 'beast', size: null, fetchSize: false},
    }).data.node;

    variables = {
      fetchSize: false,
      id: '4',
      size: null,
    };
    context = {environment, variables};
  });

  it('ignores non-fragment data, sets missing fragment props to null', () => {
    const resolver = new RelayFragmentSpecResolver(
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
      let resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: null},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: undefined},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
    });

    it('passes through mock values', () => {
      const user = {};
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user},
        jest.fn(),
      );
      expect(resolver.resolve().user).toBe(user);
    });

    it('disposes with null props', () => {
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: null},
        jest.fn(),
      );
      expect(() => resolver.dispose()).not.toThrow();
    });

    it('resolves fragment data', () => {
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('calls callback when fragment data changes', () => {
      const callback = jest.fn();
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        callback,
      );
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Mark',
        },
      });
    });

    it('disposes subscriptions', () => {
      const callback = jest.fn();
      const resolver = new RelayFragmentSpecResolver(
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
          __dataID__: '4',
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
        resolver = new RelayFragmentSpecResolver(
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
        resolver = new RelayFragmentSpecResolver(
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
            __dataID__: '4',
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
            __dataID__: 'beast',
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
            __dataID__: 'beast',
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
            __dataID__: 'beast',
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
        resolver = new RelayFragmentSpecResolver(
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
            __dataID__: '4',
            id: '4',
            name: 'Zuck',
            profilePicture: {
              __dataID__: jasmine.any(String),
              uri: 'https://zuck.jpg',
            },
          },
        });
      });
    });
  });

  describe('plural props', () => {
    it('passes through null-ish values', () => {
      let resolver = new RelayFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: null},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: undefined},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({user: null});
    });

    it('passes through mock values', () => {
      const users = [{}];
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: users},
        jest.fn(),
      );
      expect(resolver.resolve().user).toBe(users);
    });

    it('resolves fragment data', () => {
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: [{
            __dataID__: '4',
          id: '4',
          name: 'Zuck',
        }],
      });
    });

    it('calls callback when fragment data changes', () => {
      const callback = jest.fn();
      const resolver = new RelayFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        callback,
      );
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: [{
            __dataID__: '4',
          id: '4',
          name: 'Mark',
        }],
      });
    });

    it('disposes subscriptions', () => {
      const callback = jest.fn();
      const resolver = new RelayFragmentSpecResolver(
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
            __dataID__: '4',
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
        resolver = new RelayFragmentSpecResolver(
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
        resolver = new RelayFragmentSpecResolver(
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
            __dataID__: '4',
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
            __dataID__: 'beast',
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
            __dataID__: 'beast',
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
            __dataID__: 'beast',
            id: 'beast',
            name: 'Beast', // does not update
          }],
        });
      });

      it('resolves added items', () => {
        resolver.setProps({user: [zuck, beast]}); // add beast
        expect(resolver.resolve()).toEqual({
          user: [{
            __dataID__: '4',
            id: '4',
            name: 'Zuck',
          }, {
            __dataID__: 'beast',
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
            __dataID__: '4',
            id: '4',
            name: 'Zuck',
          }, {
            __dataID__: 'beast',
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
            __dataID__: '4',
            id: '4',
            name: 'Mark',
          }, {
            __dataID__: 'beast',
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
        resolver = new RelayFragmentSpecResolver(
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
            __dataID__: '4',
            id: '4',
            name: 'Zuck',
            profilePicture: {
              __dataID__: jasmine.any(String),
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
            __dataID__: '4',
            id: '4',
            name: 'Zuck',
            profilePicture: {
              __dataID__: jasmine.any(String),
              uri: 'https://zuck.jpg',
            },
          }],
        });
      });
    });
  });
});

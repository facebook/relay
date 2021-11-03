/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {fetchQuery} = require('../../query/fetchQueryInternal');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernFragmentSpecResolver = require('../RelayModernFragmentSpecResolver');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getRequest, graphql} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('RelayModernFragmentSpecResolver', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let context;
  let environment;
  let zuck;
  let zuckOperation;
  let beast;
  let beastOperation;
  let variables;

  function setName(id, name) {
    environment.applyUpdate({
      storeUpdater: store => {
        const user = store.get(id);
        user.setValue(name, 'name');
      },
    });
  }

  function setPhotoUri(id, size, uri) {
    environment.applyUpdate({
      storeUpdater: store => {
        const user = store.get(id);
        const profilePicture = user.getOrCreateLinkedRecord(
          'profilePicture',
          'Image',
          {size},
        );
        profilePicture.setValue(uri, 'uri');
      },
    });
  }

  beforeEach(() => {
    environment = createMockEnvironment();
    UserFragment = graphql`
      fragment RelayModernFragmentSpecResolverTestQueryUserFragment on User {
        id
        name
        profilePicture(size: $size) @include(if: $fetchSize) {
          uri
        }
      }
    `;
    UsersFragment = graphql`
      fragment RelayModernFragmentSpecResolverTestQueryUsersFragment on User
      @relay(plural: true) {
        id
        name
        profilePicture(size: $size) @include(if: $fetchSize) {
          uri
        }
      }
    `;

    UserQuery = getRequest(graphql`
      query RelayModernFragmentSpecResolverTestQuery(
        $id: ID!
        $size: [Int]
        $fetchSize: Boolean!
      ) {
        node(id: $id) {
          ...RelayModernFragmentSpecResolverTestQueryUserFragment
          ...RelayModernFragmentSpecResolverTestQueryUsersFragment
        }
      }
    `);

    zuckOperation = createOperationDescriptor(UserQuery, {
      fetchSize: false,
      id: '4',
      size: null,
    });
    beastOperation = createOperationDescriptor(UserQuery, {
      fetchSize: false,
      id: 'beast',
      size: null,
    });
    environment.commitPayload(zuckOperation, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    environment.commitPayload(beastOperation, {
      node: {
        id: 'beast',
        __typename: 'User',
        name: 'Beast',
      },
    });
    zuck = environment.lookup(zuckOperation.fragment).data.node;
    beast = environment.lookup(beastOperation.fragment).data.node;

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
      true /* rootIsQueryRenderer */,
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
        true /* rootIsQueryRenderer */,
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: undefined},
        jest.fn(),
        true /* rootIsQueryRenderer */,
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
        true /* rootIsQueryRenderer */,
      );
      expect(resolver.resolve().user).toBe(user);
    });

    it('disposes with null props', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: null},
        jest.fn(),
        true /* rootIsQueryRenderer */,
      );
      expect(() => resolver.dispose()).not.toThrow();
    });

    it('resolves fragment data', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UserFragment},
        {user: zuck},
        jest.fn(),
        true /* rootIsQueryRenderer */,
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
        true /* rootIsQueryRenderer */,
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
        true /* rootIsQueryRenderer */,
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
          true /* rootIsQueryRenderer */,
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
          true /* rootIsQueryRenderer */,
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
          true /* rootIsQueryRenderer */,
        );
      });

      it('does nothing if variables are equivalent', () => {
        const prevData = resolver.resolve();
        const dispose = environment.subscribe.mock.dispose;
        environment.lookup.mockClear();
        environment.subscribe.mockClear();

        resolver.setVariables(
          {
            fetchSize: false,
            size: null,
          },
          UserQuery,
        );
        expect(dispose).not.toBeCalled();
        expect(environment.lookup).not.toBeCalled();
        expect(environment.subscribe).not.toBeCalled();
        expect(resolver.resolve()).toBe(prevData);
      });

      it('resolves fragment data when variables change', () => {
        const dispose = environment.subscribe.mock.dispose;
        setPhotoUri('4', 1, 'https://4.jpg');
        expect(dispose).not.toBeCalled();
        resolver.setVariables(
          {
            fetchSize: true,
            size: 1,
          },
          UserQuery,
        );
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
        resolver.setVariables(
          {
            fetchSize: true,
            size: 1,
          },
          UserQuery,
        );
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
        true /* rootIsQueryRenderer */,
      );
      expect(resolver.resolve()).toEqual({user: null});
      resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: undefined},
        jest.fn(),
        true /* rootIsQueryRenderer */,
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
        true /* rootIsQueryRenderer */,
      );
      expect(resolver.resolve().user).toBe(users);
    });

    it('resolves fragment data', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        jest.fn(),
        true /* rootIsQueryRenderer */,
      );
      expect(resolver.resolve()).toEqual({
        user: [
          {
            id: '4',
            name: 'Zuck',
          },
        ],
      });
    });

    it('calls callback when fragment data changes', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        callback,
        true /* rootIsQueryRenderer */,
      );
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: [
          {
            id: '4',
            name: 'Mark',
          },
        ],
      });
    });

    it('resolves fragment data when the item at the end of the array is removed', () => {
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck, beast]},
        jest.fn(),
        true /* rootIsQueryRenderer */,
      );

      expect(resolver.resolve()).toEqual({
        user: [
          {
            id: '4',
            name: 'Zuck',
          },
          {
            id: 'beast',
            name: 'Beast',
          },
        ],
      });

      resolver.setProps({user: [zuck]});

      expect(resolver.resolve()).toEqual({
        user: [
          {
            id: '4',
            name: 'Zuck',
          },
        ],
      });
    });

    it('disposes subscriptions', () => {
      const callback = jest.fn();
      const resolver = new RelayModernFragmentSpecResolver(
        context,
        {user: UsersFragment},
        {user: [zuck]},
        callback,
        true /* rootIsQueryRenderer */,
      );
      resolver.dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
      expect(resolver.resolve()).toEqual({
        user: [
          {
            id: '4',
            name: 'Zuck', // does not reflect latest changes
          },
        ],
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
          true /* rootIsQueryRenderer */,
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
          true /* rootIsQueryRenderer */,
        );
        resolver.setProps({user: [zuck]});
        expect(callback).not.toBeCalled();
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: '4',
              name: 'Mark', // reflects updated value
            },
          ],
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
          user: [
            {
              id: 'beast',
              name: 'Beast',
            },
          ],
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
          user: [
            {
              id: 'beast',
              name: 'BEAST', // reflects updated value
            },
          ],
        });
      });

      it('disposes subscriptions', () => {
        resolver.setProps({user: [beast]}); // zuck -> beast
        expect(callback).not.toBeCalled();
        resolver.dispose();
        setName('beast', 'BEAST'); // all caps
        expect(callback).not.toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: 'beast',
              name: 'Beast', // does not update
            },
          ],
        });
      });

      it('resolves added items', () => {
        resolver.setProps({user: [zuck, beast]}); // add beast
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: '4',
              name: 'Zuck',
            },
            {
              id: 'beast',
              name: 'Beast',
            },
          ],
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
          user: [
            {
              id: '4',
              name: 'Zuck',
            },
            {
              id: 'beast',
              name: 'BEAST', // updated value
            },
          ],
        });
      });

      it('retains subscription to unchanged items', () => {
        resolver.setProps({user: [zuck, beast]}); // add beast
        setName('4', 'Mark'); // Zuck -> Mark
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: '4',
              name: 'Mark',
            },
            {
              id: 'beast',
              name: 'Beast',
            },
          ],
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
          true /* rootIsQueryRenderer */,
        );
      });

      it('does nothing if variables are equivalent', () => {
        const prevData = resolver.resolve();
        const dispose = environment.subscribe.mock.dispose;
        environment.lookup.mockClear();
        environment.subscribe.mockClear();

        resolver.setVariables(
          {
            fetchSize: false,
            size: null,
          },
          UserQuery,
        );
        expect(dispose).not.toBeCalled();
        expect(environment.lookup).not.toBeCalled();
        expect(environment.subscribe).not.toBeCalled();
        expect(resolver.resolve()).toBe(prevData);
      });

      it('resolves fragment data when variables change', () => {
        const dispose = environment.subscribe.mock.dispose;
        setPhotoUri('4', 1, 'https://4.jpg');
        expect(dispose).not.toBeCalled();
        resolver.setVariables(
          {
            fetchSize: true,
            size: 1,
          },
          UserQuery,
        );
        expect(callback).not.toBeCalled();
        expect(dispose).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: '4',
              name: 'Zuck',
              profilePicture: {
                uri: 'https://4.jpg',
              },
            },
          ],
        });
      });

      it('calls callback when fragment data changes', () => {
        setPhotoUri('4', 1, 'https://4.jpg');
        resolver.setVariables(
          {
            fetchSize: true,
            size: 1,
          },
          UserQuery,
        );
        expect(callback).not.toBeCalled();
        setPhotoUri('4', 1, 'https://zuck.jpg');
        expect(callback).toBeCalled();
        expect(resolver.resolve()).toEqual({
          user: [
            {
              id: '4',
              name: 'Zuck',
              profilePicture: {
                uri: 'https://zuck.jpg',
              },
            },
          ],
        });
      });
    });
  });

  describe('suspense compatibility', () => {
    describe('when data is missing and query is in progress', () => {
      beforeEach(() => {
        jest.mock('warning');
        setName('4', undefined);
        fetchQuery(environment, zuckOperation).subscribe({});
      });
      it('only warns but does not suspend if resolver is under a QueryRenderer root', () => {
        const warning = require('warning');
        warning.mockClear();
        const resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          jest.fn(),
          true /* rootIsQueryRenderer */,
        );
        expect(resolver.resolve()).toEqual({
          user: {
            id: '4',
            name: undefined,
          },
        });
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning.mock.calls[0][1]).toContain(
          'has missing data and would suspend',
        );
      });

      it('warns and suspends if resolver is NOT under QueryRenderer root (i.e. root is a Relay Hooks query)', () => {
        const warning = require('warning');
        warning.mockClear();
        const resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          jest.fn(),
          false /* rootIsQueryRenderer */,
        );
        let promise;
        try {
          resolver.resolve();
        } catch (e) {
          promise = e;
        }
        expect(promise).toBeDefined();
        expect(promise.then).toBeDefined();
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning.mock.calls[0][1]).toContain('suspended');
      });
    });

    describe('when data is missing and operation that affects query is in progress', () => {
      let AffectingQuery;
      beforeEach(() => {
        jest.mock('warning');

        AffectingQuery = getRequest(graphql`
          query RelayModernFragmentSpecResolverTestAffectingQuery(
            $id: ID!
            $size: [Int]
            $fetchSize: Boolean!
          ) {
            node(id: $id) {
              ...RelayModernFragmentSpecResolverTestQueryUserFragment
              ...RelayModernFragmentSpecResolverTestQueryUsersFragment
            }
          }
        `);
        const affectingQueryOperation = createOperationDescriptor(
          AffectingQuery,
          {
            fetchSize: false,
            id: '4',
            size: null,
          },
        );

        fetchQuery(environment, affectingQueryOperation).subscribe({});
      });

      it('only warns but does not suspend if resolver is under a QueryRenderer root', () => {
        const warning = require('warning');
        warning.mockClear();
        const resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          jest.fn(),
          true /* rootIsQueryRenderer */,
        );

        // Process a payload on the affecting query so we know it affects
        // the current fragment
        environment.mock.nextValue(AffectingQuery, {
          data: {
            node: {
              id: '4',
              __typename: 'User',
              name: 'Some value',
            },
          },
        });
        setName('4', undefined); // Keep this field missing
        warning.mockClear();

        expect(resolver.resolve()).toEqual({
          user: {
            id: '4',
            name: undefined,
          },
        });
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning.mock.calls[0][1]).toContain(
          'has missing data and would suspend',
        );
      });

      it('warns and suspends if resolver is NOT under QueryRenderer root (i.e. root is a Relay Hooks query)', () => {
        const warning = require('warning');
        warning.mockClear();
        const resolver = new RelayModernFragmentSpecResolver(
          context,
          {user: UserFragment},
          {user: zuck},
          jest.fn(),
          false /* rootIsQueryRenderer */,
        );

        // Process a payload on the affecting query so we know it affects
        // the current fragment
        environment.mock.nextValue(AffectingQuery, {
          data: {
            node: {
              id: '4',
              __typename: 'User',
              name: 'Some value',
            },
          },
        });
        setName('4', undefined); // Keep this field missing
        warning.mockClear();

        let promise;
        try {
          resolver.resolve();
        } catch (e) {
          promise = e;
        }
        expect(promise).toBeDefined();
        expect(promise.then).toBeDefined();
        expect(warning).toHaveBeenCalledTimes(1);
        expect(warning.mock.calls[0][1]).toContain('suspended');
      });
    });
  });
});

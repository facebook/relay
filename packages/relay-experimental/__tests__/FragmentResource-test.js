/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

jest.mock('relay-runtime', () => {
  const originalRuntime = jest.requireActual('relay-runtime');
  const originalInternal = originalRuntime.__internal;
  return {
    ...originalRuntime,
    __internal: {
      ...originalInternal,
      getPromiseForActiveRequest: jest.fn(),
    },
  };
});

const {getFragmentResourceForEnvironment} = require('../FragmentResource');
const {
  __internal: {getPromiseForActiveRequest},
  createOperationDescriptor,
  getFragment,
} = require('relay-runtime');

describe('FragmentResource', () => {
  let environment;
  let query;
  let queryMissingData;
  let queryPlural;
  let FragmentResource;
  let createMockEnvironment;
  let generateAndCompile;
  let UserQuery;
  let UserFragment;
  let UserQueryMissing;
  let UserFragmentMissing;
  let UsersQuery;
  let UsersFragment;
  const variables = {
    id: '4',
  };
  const pluralVariables = {ids: ['4']};
  const componentDisplayName = 'TestComponent';

  beforeEach(() => {
    // jest.resetModules();

    ({
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal'));

    environment = createMockEnvironment();
    FragmentResource = getFragmentResourceForEnvironment(environment);

    ({UserQuery, UserFragment} = generateAndCompile(
      `
        fragment UserFragment on User {
          id
          name
        }
        query UserQuery($id: ID!) {
          node(id: $id) {
            __typename
            ...UserFragment
          }
        }
    `,
    ));

    ({
      UserQuery: UserQueryMissing,
      UserFragment: UserFragmentMissing,
    } = generateAndCompile(
      `
        fragment UserFragment on User {
          id
          name
          username
        }
        query UserQuery($id: ID!) {
          node(id: $id) {
            __typename
            ...UserFragment
          }
        }
      `,
    ));

    ({UsersQuery, UsersFragment} = generateAndCompile(
      `
        fragment UsersFragment on User @relay(plural: true) {
          id
          name
        }
        query UsersQuery($ids: [ID!]!) {
          nodes(ids: $ids) {
            __typename
            ...UsersFragment
          }
        }
      `,
    ));

    query = createOperationDescriptor(UserQuery, variables);
    queryMissingData = createOperationDescriptor(UserQueryMissing, variables);
    queryPlural = createOperationDescriptor(UsersQuery, pluralVariables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '4',
        name: 'Mark',
      },
    });
  });

  afterEach(() => {
    (getPromiseForActiveRequest: any).mockReset();
  });

  describe('read', () => {
    it('should read data for the fragment when all data is available', () => {
      const result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark'});
    });

    it('should read data for plural fragment when all data is available', () => {
      const result = FragmentResource.read(
        getFragment(UsersFragment),
        [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ],
        componentDisplayName,
      );
      expect(result.data).toEqual([{id: '4', name: 'Mark'}]);
    });

    it('should return empty array for plural fragment when plural field is empty', () => {
      const {UsersFragment} = generateAndCompile(
        `
          fragment UsersFragment on User @relay(plural: true) {
            id
          }
          query UsersQuery($ids: [ID!]!) {
            nodes(ids: $ids) {
              __typename
              ...UsersFragment
            }
          }
        `,
      );

      const result = FragmentResource.read(
        getFragment(UsersFragment),
        [],
        componentDisplayName,
      );
      expect(result.data).toEqual([]);
    });

    it('should correctly read fragment data when dataID changes', () => {
      let result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark'});

      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '5',
          name: 'User 5',
        },
      });

      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '5',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '5', name: 'User 5'});
    });

    it('should correctly read fragment data when variables used by fragment change', () => {
      ({UserQuery, UserFragment} = generateAndCompile(
        `
          fragment UserFragment on Query {
            node(id: $id) {
              __typename
              id
              name
            }
          }
          query UserQuery($id: ID!) {
            ...UserFragment
          }
        `,
      ));
      const prevVars = {id: '4'};
      query = createOperationDescriptor(UserQuery, prevVars);
      let result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: 'client:root',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({
        node: {__typename: 'User', id: '4', name: 'Mark'},
      });

      const nextVars = {id: '5'};
      query = createOperationDescriptor(UserQuery, nextVars);
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '5',
          name: 'User 5',
        },
      });

      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: 'client:root',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({
        node: {__typename: 'User', id: '5', name: 'User 5'},
      });
    });

    it(
      'should correctly read fragment data when variables used by fragment ' +
        'in @argumentDefinitions change',
      () => {
        ({UserQuery, UserFragment} = generateAndCompile(
          `
          fragment UserFragment on Query @argumentDefinitions(id: {type: "ID!"}) {
            node(id: $id) {
              __typename
              id
              name
            }
          }
          query UserQuery($id: ID!) {
            ...UserFragment @arguments(id: $id)
          }
        `,
        ));
        const prevVars = {id: '4'};
        query = createOperationDescriptor(UserQuery, prevVars);
        let result = FragmentResource.read(
          getFragment(UserFragment),
          {
            __id: 'client:root',
            __fragments: {
              UserFragment: prevVars,
            },
            __fragmentOwner: query.request,
          },
          componentDisplayName,
        );
        expect(result.data).toEqual({
          node: {__typename: 'User', id: '4', name: 'Mark'},
        });

        const nextVars = {id: '5'};
        query = createOperationDescriptor(UserQuery, nextVars);
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '5',
            name: 'User 5',
          },
        });

        result = FragmentResource.read(
          getFragment(UserFragment),
          {
            __id: 'client:root',
            __fragments: {
              UserFragment: nextVars,
            },
            __fragmentOwner: query.request,
          },
          componentDisplayName,
        );
        expect(result.data).toEqual({
          node: {__typename: 'User', id: '5', name: 'User 5'},
        });
      },
    );

    it(
      'should correctly read fragment data when fragment owner variables ' +
        'change',
      () => {
        ({UserQuery, UserFragment} = generateAndCompile(
          `
          fragment UserFragment on User {
            id
            name
          }
          query UserQuery($id: ID!, $foo: Boolean!) {
            node(id: $id) {
              __typename
              name @include(if: $foo)
              ...UserFragment
            }
          }
        `,
        ));
        const variablesWithFoo = {
          id: '4',
          foo: false,
        };
        query = createOperationDescriptor(UserQuery, variablesWithFoo);

        const environmentSpy = jest.spyOn(environment, 'lookup');
        let result = FragmentResource.read(
          getFragment(UserFragment),
          {
            __id: '4',
            __fragments: {
              UserFragment: {},
            },
            __fragmentOwner: query.request,
          },
          componentDisplayName,
        );
        expect(result.data).toEqual({id: '4', name: 'Mark'});

        const nextVars = {
          ...variablesWithFoo,
          // Change value of $foo
          foo: true,
        };
        query = createOperationDescriptor(UserQuery, nextVars);
        result = FragmentResource.read(
          getFragment(UserFragment),
          {
            __id: '4',
            __fragments: {
              UserFragment: {},
            },
            __fragmentOwner: query.request,
          },
          componentDisplayName,
        );
        expect(result.data).toEqual({id: '4', name: 'Mark'});

        // Even if variable $foo isn't directly used by the fragment, the cache
        // key for the fragment should still change since $foo might affect
        // descendants of this fragment; if we return a cached value, the
        // fragment ref we pass to our children might be stale.
        expect(environmentSpy).toHaveBeenCalledTimes(2);
        environmentSpy.mockRestore();
      },
    );

    it('should return null data if fragment reference is not provided', () => {
      const result = FragmentResource.read(
        getFragment(UserFragment),
        null,
        componentDisplayName,
      );
      expect(result.data).toBe(null);
    });

    it('should throw and cache promise if reading missing data and network request for parent query is in flight', () => {
      (getPromiseForActiveRequest: any).mockReturnValue(Promise.resolve());
      const fragmentNode = getFragment(UserFragmentMissing);
      const fragmentRef = {
        __id: '4',
        __fragments: {
          UserFragment: {},
        },
        __fragmentOwner: queryMissingData.request,
      };

      // Try reading a fragment while parent query is in flight
      let thrown = null;
      try {
        FragmentResource.read(fragmentNode, fragmentRef, componentDisplayName);
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        thrown = p;
      }
      // Assert that promise for request in flight is thrown
      expect(thrown).not.toBe(null);

      // Try reading a fragment a second time while parent query is in flight
      let cached = null;
      try {
        FragmentResource.read(fragmentNode, fragmentRef, componentDisplayName);
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        cached = p;
      }
      // Assert that promise from first read was cached
      expect(cached).toBe(thrown);
    });

    it('should not cache or throw an error if network request for parent query errored', () => {
      let reject = (e: Error) => {};
      (getPromiseForActiveRequest: any).mockReturnValueOnce(
        new Promise((_, r) => {
          reject = r;
        }),
      );
      const fragmentNode = getFragment(UserFragmentMissing);
      const fragmentRef = {
        __id: '4',
        __fragments: {
          UserFragment: {},
        },
        __fragmentOwner: queryMissingData.request,
      };

      // Try reading a fragment while parent query is in flight
      let thrown = null;
      try {
        FragmentResource.read(fragmentNode, fragmentRef, componentDisplayName);
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        thrown = p;
      }
      // Assert that promise for request in flight is thrown
      expect(thrown).not.toBe(null);

      // Make the network request error
      reject(new Error('Network Error'));
      jest.runAllImmediates();

      // Try reading a fragment a second time after the parent query errored
      let cached = null;
      try {
        FragmentResource.read(fragmentNode, fragmentRef, componentDisplayName);
      } catch (p) {
        cached = p;
      }
      // Assert that promise from first read was cached
      expect(cached).toBe(null);
    });

    it('should raise a warning if data is missing and no pending requests', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      FragmentResource.read(
        getFragment(UserFragmentMissing),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: queryMissingData.request,
        },
        componentDisplayName,
      );

      expect(console.error).toHaveBeenCalledTimes(1);
      // $FlowFixMe[prop-missing]
      const warningMessage = console.error.mock.calls[0][0];
      expect(
        warningMessage.startsWith(
          'Warning: Relay: Tried reading fragment `UserFragment` ' +
            'declared in `TestComponent`, but it has ' +
            'missing data and its parent query `UserQuery` is not being fetched.',
        ),
      ).toEqual(true);
      // $FlowFixMe[prop-missing]
      console.error.mockClear();
    });

    it('should show a readable error message if fragment is conditionally included', () => {
      expect(() =>
        FragmentResource.read(
          getFragment(UserFragment),
          {
            /* no fragment reference */
          },
          componentDisplayName,
        ),
      ).toThrow(
        "Relay: Expected to receive an object where `...UserFragment` was spread, but the fragment reference was not found`. This is most likely the result of:\n- Forgetting to spread `UserFragment` in `TestComponent`'s parent's fragment.\n- Conditionally fetching `UserFragment` but unconditionally passing a fragment reference prop to `TestComponent`. If the parent fragment only fetches the fragment conditionally - with e.g. `@include`, `@skip`, or inside a `... on SomeType { }` spread  - then the fragment reference will not exist. In this case, pass `null` if the conditions for evaluating the fragment are not met (e.g. if the `@include(if)` value is false.)",
      );
    });
  });

  describe('readSpec', () => {
    it('should read data for the fragment when all data is available', () => {
      const result = FragmentResource.readSpec(
        {
          user: getFragment(UserFragment),
          user2: getFragment(UserFragment),
        },
        {
          user: {
            __id: '4',
            __fragments: {
              UserFragment: {},
            },
            __fragmentOwner: query.request,
          },
          user2: null,
        },
        componentDisplayName,
      );
      expect(result.user.data).toEqual({id: '4', name: 'Mark'});
      expect(result.user2.data).toEqual(null);
    });

    it('should throw and cache promise if reading missing data and network request for parent query is in flight', () => {
      (getPromiseForActiveRequest: any).mockReturnValueOnce(Promise.resolve());
      const fragmentNodes = {
        user: getFragment(UserFragmentMissing),
      };
      const fragmentRefs = {
        user: {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: queryMissingData.request,
        },
      };

      // Try reading a fragment while parent query is in flight
      let thrown = null;
      try {
        FragmentResource.readSpec(
          fragmentNodes,
          fragmentRefs,
          componentDisplayName,
        );
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        thrown = p;
      }
      // Assert that promise for request in flight is thrown
      expect(thrown).not.toBe(null);

      // Try reading a fragment a second time while parent query is in flight
      let cached = null;
      try {
        FragmentResource.readSpec(
          fragmentNodes,
          fragmentRefs,
          componentDisplayName,
        );
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        cached = p;
      }
      // Assert that promise from first read was cached
      expect(cached).toBe(thrown);
    });
  });

  describe('subscribe', () => {
    let callback;
    beforeEach(() => {
      callback = jest.fn();
    });

    it('subscribes to the fragment that was `read`', () => {
      let result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      const disposable = FragmentResource.subscribe(result, callback);
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

      // Update data
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark Updated',
        },
      });

      // Assert that callback gets update
      expect(callback).toBeCalledTimes(1);

      // Assert that reading the result again will reflect the latest value
      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark Updated'});

      disposable.dispose();
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
    });

    it('immediately notifies of data updates that were missed between calling `read` and `subscribe`', () => {
      let result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      // Update data once, before subscribe has been called
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark Updated 1',
        },
      });

      const disposable = FragmentResource.subscribe(result, callback);
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

      // Assert that callback was immediately called
      expect(callback).toBeCalledTimes(1);

      // Assert that reading the result again will reflect the latest value
      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark Updated 1'});

      // Update data again
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark Updated 2',
        },
      });

      // Assert that callback gets update
      expect(callback).toBeCalledTimes(2);

      // Assert that reading the result again will reflect the latest value
      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark Updated 2'});

      disposable.dispose();
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
    });

    it('immediately notifies of data updates that were missed between calling `read` and `subscribe` (revert to original value)', () => {
      let result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      // Update data once, before subscribe has been called
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark Updated 1',
        },
      });

      const disposable = FragmentResource.subscribe(result, callback);
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

      // Assert that callback was immediately called
      expect(callback).toBeCalledTimes(1);

      // Assert that reading the result again will reflect the latest value
      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark Updated 1'});

      // Update data again
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark', // original value
        },
      });

      // Assert that callback gets update
      expect(callback).toBeCalledTimes(2);

      // Assert that reading the result again will reflect the latest value
      result = FragmentResource.read(
        getFragment(UserFragment),
        {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        },
        componentDisplayName,
      );
      expect(result.data).toEqual({id: '4', name: 'Mark'});

      disposable.dispose();
      expect(environment.subscribe).toBeCalledTimes(1);
      expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
    });

    it("doesn't subscribe when result was null", () => {
      const result = FragmentResource.read(
        getFragment(UserFragment),
        null,
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      const disposable = FragmentResource.subscribe(result, callback);
      expect(environment.subscribe).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);

      disposable.dispose();
      expect(environment.subscribe).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it("doesn't subscribe when result was empty", () => {
      const result = FragmentResource.read(
        getFragment(UsersFragment),
        [],
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      const disposable = FragmentResource.subscribe(result, callback);
      expect(environment.subscribe).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);

      disposable.dispose();
      expect(environment.subscribe).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    describe('when subscribing multiple times to the same fragment', () => {
      it('maintains subscription even if one of the fragments is disposed of', () => {
        const fragmentNode = getFragment(UserFragment);
        const fragmentRef = {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        };
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        const disposable1 = FragmentResource.subscribe(result, callback1);
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        const disposable2 = FragmentResource.subscribe(result, callback2);
        expect(environment.subscribe).toBeCalledTimes(2);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Update data once
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Update 1',
          },
        });

        // Assert that both callbacks receive update
        expect(callback1).toBeCalledTimes(1);
        expect(callback2).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual({id: '4', name: 'Mark Update 1'});

        // Unsubscribe the second listener
        disposable2.dispose();
        expect(environment.subscribe).toBeCalledTimes(2);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);

        // Update data again
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Update 2',
          },
        });

        // Assert that subscription that hasn't been disposed receives update
        expect(callback1).toBeCalledTimes(2);

        // Assert that subscription that was already disposed isn't called again
        expect(callback2).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual({id: '4', name: 'Mark Update 2'});

        disposable1.dispose();
        expect(environment.subscribe).toBeCalledTimes(2);
      });
    });

    describe('when subscribing to plural fragment', () => {
      it('subscribes to the plural fragment that was `read`', () => {
        const fragmentNode = getFragment(UsersFragment);
        const fragmentRef = [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ];
        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        const disposable = FragmentResource.subscribe(result, callback);
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Update data
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated',
          },
        });

        // Assert that callback gets update
        expect(callback).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([{id: '4', name: 'Mark Updated'}]);

        disposable.dispose();
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
      });

      it('immediately notifies of data updates that were missed between calling `read` and `subscribe`', () => {
        const fragmentNode = getFragment(UsersFragment);
        const fragmentRef = [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ];
        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        // Update data once, before subscribe has been called
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 1',
          },
        });

        const disposable = FragmentResource.subscribe(result, callback);
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Assert that callback was immediately called
        expect(callback).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([{id: '4', name: 'Mark Updated 1'}]);

        // Update data again
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 2',
          },
        });

        // Assert that callback gets update
        expect(callback).toBeCalledTimes(2);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([{id: '4', name: 'Mark Updated 2'}]);

        disposable.dispose();
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
      });

      it('correctly subscribes to a plural fragment with multiple records', () => {
        queryPlural = createOperationDescriptor(UsersQuery, {ids: ['4', '5']});
        environment.commitPayload(queryPlural, {
          nodes: [
            {
              __typename: 'User',
              id: '4',
              name: 'Mark',
            },
            {
              __typename: 'User',
              id: '5',
              name: 'User 5',
            },
          ],
        });
        const fragmentNode = getFragment(UsersFragment);
        const fragmentRef = [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
          {
            __id: '5',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ];

        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        const disposable = FragmentResource.subscribe(result, callback);
        expect(environment.subscribe).toBeCalledTimes(2);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Update data
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated',
          },
        });

        // Assert that callback gets update
        expect(callback).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([
          {id: '4', name: 'Mark Updated'},
          {id: '5', name: 'User 5'},
        ]);

        disposable.dispose();
        expect(environment.subscribe).toBeCalledTimes(2);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
      });

      it('immediately notifies of data updates that were missed between calling `read` and `subscribe` when subscribing to multiple records', () => {
        queryPlural = createOperationDescriptor(UsersQuery, {ids: ['4', '5']});
        environment.commitPayload(queryPlural, {
          nodes: [
            {
              __typename: 'User',
              id: '4',
              name: 'Mark',
            },
            {
              __typename: 'User',
              id: '5',
              name: 'User 5',
            },
            {
              __typename: 'User',
              id: '6',
              name: 'User 6',
            },
          ],
        });
        const fragmentNode = getFragment(UsersFragment);
        const fragmentRef = [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
          {
            __id: '5',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
          {
            __id: '6',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ];

        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        // Update data once, before subscribe has been called
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 1',
          },
        });
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '6',
            name: 'User 6 Updated',
          },
        });

        const disposable = FragmentResource.subscribe(result, callback);
        expect(environment.subscribe).toBeCalledTimes(3);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Assert that callback was immediately called
        expect(callback).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([
          {id: '4', name: 'Mark Updated 1'},
          {id: '5', name: 'User 5'},
          {id: '6', name: 'User 6 Updated'},
        ]);

        // Update data again
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 2',
          },
        });

        // Assert that callback gets update
        expect(callback).toBeCalledTimes(2);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([
          {id: '4', name: 'Mark Updated 2'},
          {id: '5', name: 'User 5'},
          {id: '6', name: 'User 6 Updated'},
        ]);

        disposable.dispose();
        expect(environment.subscribe).toBeCalledTimes(3);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
      });

      it('immediately notifies of data updates that were missed between calling `read` and `subscribe` when subscribing to multiple records (revert to original)', () => {
        queryPlural = createOperationDescriptor(UsersQuery, {ids: ['4']});
        environment.commitPayload(queryPlural, {
          nodes: [
            {
              __typename: 'User',
              id: '4',
              name: 'Mark',
            },
          ],
        });
        const fragmentNode = getFragment(UsersFragment);
        const fragmentRef = [
          {
            __id: '4',
            __fragments: {
              UsersFragment: {},
            },
            __fragmentOwner: queryPlural.request,
          },
        ];

        let result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(environment.subscribe).toHaveBeenCalledTimes(0);

        // Update data once, before subscribe has been called
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 1',
          },
        });

        const disposable = FragmentResource.subscribe(result, callback);
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(0);

        // Assert that callback was immediately called
        expect(callback).toBeCalledTimes(1);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([{id: '4', name: 'Mark Updated 1'}]);

        // Update data again
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark', // revert to original
          },
        });

        // Assert that callback gets update
        expect(callback).toBeCalledTimes(2);

        // Assert that reading the result again will reflect the latest value
        result = FragmentResource.read(
          fragmentNode,
          fragmentRef,
          componentDisplayName,
        );
        expect(result.data).toEqual([{id: '4', name: 'Mark'}]);

        disposable.dispose();
        expect(environment.subscribe).toBeCalledTimes(1);
        expect(environment.subscribe.mock.dispose).toBeCalledTimes(1);
      });
    });
  });

  describe('subscribeSpec', () => {
    let unsubscribe;
    let callback;
    beforeEach(() => {
      unsubscribe = jest.fn();
      callback = jest.fn();
      jest.spyOn(environment, 'subscribe').mockImplementation(() => ({
        dispose: unsubscribe,
      }));
    });

    it('subscribes to the fragment spec that was `read`', () => {
      const result = FragmentResource.readSpec(
        {user: getFragment(UserFragment)},
        {
          user: {
            __id: '4',
            __fragments: {
              UserFragment: {},
            },
            __fragmentOwner: query.request,
          },
        },
        componentDisplayName,
      );
      expect(environment.subscribe).toHaveBeenCalledTimes(0);

      const disposable = FragmentResource.subscribeSpec(result, callback);
      expect(unsubscribe).toBeCalledTimes(0);
      expect(environment.subscribe).toBeCalledTimes(1);

      disposable.dispose();
      expect(unsubscribe).toBeCalledTimes(1);
      expect(environment.subscribe).toBeCalledTimes(1);
    });

    describe('checkMissedUpdatesSpec', () => {
      beforeEach(() => {
        unsubscribe = jest.fn();
        callback = jest.fn();
        jest.spyOn(environment, 'subscribe').mockImplementation(() => ({
          dispose: jest.fn(),
        }));
      });
      test('returns true if one fragment missed updates', () => {
        queryPlural = createOperationDescriptor(UsersQuery, {
          ids: ['4', '5'],
        });
        environment.commitPayload(queryPlural, {
          nodes: [
            {
              __typename: 'User',
              id: '4',
              name: 'Mark',
            },
            {
              __typename: 'User',
              id: '5',
              name: 'User 5',
            },
          ],
        });
        const userARef = {
          __id: '4',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        };
        const userBRef = {
          __id: '5',
          __fragments: {
            UserFragment: {},
          },
          __fragmentOwner: query.request,
        };
        function readUsersSpec() {
          return FragmentResource.readSpec(
            {
              userA: getFragment(UserFragment),
              userB: getFragment(UserFragment),
            },
            {
              userA: userARef,
              userB: userBRef,
            },
            componentDisplayName,
          );
        }
        const result = readUsersSpec();
        expect(FragmentResource.checkMissedUpdatesSpec(result)).toBe(false);
        // Update data once, before subscribe has been called
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark Updated 1',
          },
        });
        expect(FragmentResource.checkMissedUpdatesSpec(result)).toBe(true);
      });
    });
  });
});

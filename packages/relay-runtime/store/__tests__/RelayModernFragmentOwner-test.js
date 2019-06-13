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

jest.mock('warning');

const {
  getFragmentOwner,
  getFragmentOwners,
} = require('../RelayModernFragmentOwner');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');
const {getRequest, createOperationDescriptor} = require('../RelayCore');

describe('RelayModernFragmentOwner', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let zuck;
  let operationVariables;
  let owner;
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  describe('getFragmentOwner()', () => {
    describe('singular fragment', () => {
      beforeEach(() => {
        ({UserFragment, UserQuery} = generateAndCompile(`
          query UserQuery($id: ID!) {
            node(id: $id) {
              ...UserFragment
            }
          }
          fragment UserFragment on User {
            id
            name
          }
          `));
        operationVariables = {id: '4'};
        owner = createOperationDescriptor(
          getRequest(UserQuery),
          operationVariables,
        );
        environment.commitPayload(owner, {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        });

        zuck = environment.lookup(owner.fragment, owner).data?.node;
      });

      it('throws if fragment ref is not an object', () => {
        // $FlowFixMe
        expect(() => getFragmentOwner(UserFragment, 'zuck')).toThrow(
          'RelayModernFragmentOwner: Expected value for fragment `UserFragment` to ' +
            'be an object, got `string`.',
        );
      });

      it('returns null if owner is not found in fragment ref', () => {
        const fragmentOwner = getFragmentOwner(UserFragment, {
          __id: '4',
          __fragments: {UserFragment: {}},
          __fragmentOwner: null,
        });
        expect(fragmentOwner).toEqual(null);
      });

      it('returns null if fragment ref is null or undefined', () => {
        let fragmentOwner = getFragmentOwner(UserFragment, null);
        expect(fragmentOwner).toEqual(null);

        fragmentOwner = getFragmentOwner(UserFragment, undefined);
        expect(fragmentOwner).toEqual(null);
      });

      it('returns fragment owner', () => {
        const fragmentOwner = getFragmentOwner(
          UserFragment,
          (zuck: $FlowFixMe),
        );
        expect(fragmentOwner).toBe(owner);
      });
    });

    describe('plural fragment', () => {
      beforeEach(() => {
        ({UserQuery, UsersFragment} = generateAndCompile(`
          query UserQuery($ids: [ID!]!) {
            nodes(ids: $ids) {
              ...UsersFragment
            }
          }
          fragment UsersFragment on User @relay(plural: true) {
            id
            name
          }`));
        operationVariables = {ids: ['4']};
        owner = createOperationDescriptor(
          getRequest(UserQuery),
          operationVariables,
        );
        environment.commitPayload(owner, {
          nodes: [
            {
              id: '4',
              __typename: 'User',
              name: 'Zuck',
            },
          ],
        });

        zuck = environment.lookup(owner.fragment, owner).data?.nodes;
      });

      it('throws if fragment ref is not an object', () => {
        // $FlowFixMe
        expect(() => getFragmentOwner(UsersFragment, ['zuck'])).toThrow(
          'RelayModernFragmentOwner: Expected value for fragment `UsersFragment` to ' +
            'be an object, got `string`.',
        );
      });

      it('returns null if owner is not found in fragment ref', () => {
        const fragmentOwner = getFragmentOwner(UsersFragment, [
          {
            __id: '4',
            __fragments: {UserFragment: {}},
            __fragmentOwner: null,
          },
        ]);
        expect(fragmentOwner).toEqual([null]);
      });

      it('returns null if fragment ref is null or undefined', () => {
        let fragmentOwner = getFragmentOwner(UsersFragment, [null]);
        expect(fragmentOwner).toEqual([null]);

        fragmentOwner = getFragmentOwner(UsersFragment, [undefined]);
        expect(fragmentOwner).toEqual([null]);
      });

      it('returns fragment owner', () => {
        const fragmentOwner = getFragmentOwner(
          UsersFragment,
          (zuck: $FlowFixMe),
        );
        expect(fragmentOwner).toEqual([owner]);
        // $FlowFixMe
        expect(fragmentOwner[0]).toBe(owner);
      });
    });
  });

  describe('getFragmentOwners', () => {
    let zucks;
    beforeEach(() => {
      ({UserFragment, UsersFragment, UserQuery} = generateAndCompile(`
          query UserQuery($id: ID!, $ids: [ID!]!) {
            node(id: $id) {
              ...UserFragment
            }
            nodes(ids: $ids) {
              ...UsersFragment
            }
          }
          fragment UserFragment on User {
            id
            name
          }
          fragment UsersFragment on User @relay(plural: true) {
            id
            name
          }
          `));
      operationVariables = {id: '4', ids: ['4']};
      owner = createOperationDescriptor(
        getRequest(UserQuery),
        operationVariables,
      );
      environment.commitPayload(owner, {
        node: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
        nodes: [
          {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        ],
      });

      zuck = environment.lookup(owner.fragment, owner).data?.node;
      zucks = environment.lookup(owner.fragment, owner).data?.nodes;
    });

    it('throws if fragment ref is not an object', () => {
      expect(() =>
        getFragmentOwners(
          {zuck: UserFragment, zucks: UsersFragment},
          {zuck: 'zuck', zucks: ['zuck']},
        ),
      ).toThrow(
        'RelayModernFragmentOwner: Expected value for fragment `UserFragment` to ' +
          'be an object, got `string`.',
      );
    });

    it('returns null if owner is not found in fragment ref', () => {
      const fragmentOwners = getFragmentOwners(
        {zuck: UserFragment, zucks: UsersFragment},
        {
          zuck: {
            __id: '4',
            __fragments: {UserFragment: {}},
            __fragmentOwner: null,
          },
          zucks: [
            {
              __id: '4',
              __fragments: {UsersFragment: {}},
              __fragmentOwner: null,
            },
          ],
        },
      );
      expect(fragmentOwners).toEqual({zuck: null, zucks: [null]});
    });

    it('returns null if fragment ref is null or undefined', () => {
      let fragmentOwner = getFragmentOwners(
        {zuck: UserFragment, zucks: UsersFragment},
        {zuck: null, zucks: [null]},
      );
      expect(fragmentOwner).toEqual({zuck: null, zucks: [null]});

      fragmentOwner = getFragmentOwners(
        {zuck: UserFragment, zucks: UsersFragment},
        {zuck: undefined, zucks: [undefined]},
      );
      expect(fragmentOwner).toEqual({zuck: null, zucks: [null]});
    });

    it('returns fragment owner', () => {
      const fragmentOwners = getFragmentOwners(
        {zuck: UserFragment, zucks: UsersFragment},
        {zuck, zucks},
      );
      expect(fragmentOwners).toEqual({
        zuck: owner,
        zucks: [owner],
      });
      expect(fragmentOwners.zuck).toBe(owner);
      // $FlowFixMe
      expect(fragmentOwners.zucks[0]).toBe(owner);
    });
  });
});

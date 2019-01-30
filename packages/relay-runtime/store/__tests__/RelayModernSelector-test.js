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

jest.mock('warning');

const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('../RelayModernSelector');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {ROOT_ID} = require('../RelayStoreUtils');
const {getRequest, createOperationDescriptor} = require('../RelayCore');
const RelayModernTestUtils = require('RelayModernTestUtils');

describe('RelayModernSelector', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let zuck;
  let variables;
  let operationVariables;
  let owner;

  beforeEach(() => {
    expect.extend(RelayModernTestUtils.matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery, UsersFragment} = environment.mock.compile(`
      query UserQuery($id: ID!, $size: Int, $cond: Boolean!) {
        node(id: $id) {
          ...UserFragment
          ...UsersFragment
        }
      }
      fragment UserFragment on User {
        id
        name
        profilePicture(size: $size) @include(if: $cond) {
          uri
        }
      }
      fragment UsersFragment on User @relay(plural: true) {
        id
        name
        profilePicture(size: $size) @include(if: $cond) {
          uri
        }
      }
    `));
    const dataID = ROOT_ID;
    variables = {id: '4', size: null, cond: false};
    operationVariables = variables;
    const fragment = {
      dataID,
      node: UserQuery.fragment,
      variables,
    };
    const root = {
      dataID,
      node: UserQuery.operation,
      variables,
    };
    const operationDescriptor = {
      fragment,
      root,
      node: UserQuery,
      variables,
    };

    environment.commitPayload(operationDescriptor, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    zuck = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    variables = {
      size: null,
      cond: false,
    };
  });

  describe('getSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getSelector(variables, UserFragment, 'zuck'),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to ' +
          'be an object, got `"zuck"`.',
      );
      expect(() =>
        getSelector(variables, UserFragment, [zuck]),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an object, got ' +
          '`[{"__fragments":{"UserFragment":{},"UsersFragment":{}},"__id":"4","__fragmentOwner":null}]`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selector;
      expect(() => {
        selector = getSelector(variables, UserFragment, {});
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(selector).toBe(null);
    });

    it('returns a selector', () => {
      const selector = getSelector(variables, UserFragment, zuck);
      expect(selector).toEqual({
        owner: null,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      });
    });

    it('returns a selector with an owner when owner is passed', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSelector(variables, UserFragment, zuck, owner);
      expect(selector).toEqual({
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      });
      expect(selector.owner).toBe(owner);
    });

    it('returns a selector with an owner when owner is present in fragment ref', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSelector(variables, UserFragment, zuck);
      expect(selector).toEqual({
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      });
      expect(selector.owner).toBe(owner);
    });

    it('prefers variables from owner when owner is passed', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSelector(variables, UserFragment, zuck, owner);
      expect(selector).toEqual({
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables: {size: 16, cond: true},
        },
      });
      expect(selector.owner).toBe(owner);
    });

    it('prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSelector(variables, UserFragment, zuck);
      expect(selector).toEqual({
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      });
      expect(selector.owner).toBe(owner);
    });
  });

  describe('getSelectorList()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getSelectorList(variables, UserFragment, ['zuck']),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be ' +
          'an object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selectors;
      expect(() => {
        selectors = getSelectorList(variables, UserFragment, [{}]);
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(selectors).toBe(null);
    });

    it('returns selectors', () => {
      const selectors = getSelectorList(variables, UserFragment, [zuck]);
      expect(selectors).toEqual([
        {
          owner: null,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      ]);
    });

    it('returns selectors with an owner when owner is passed', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getSelectorList(
        variables,
        UserFragment,
        [zuck],
        [owner],
      );
      expect(selectors).toEqual([
        {
          owner: owner,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      ]);
    });

    it('returns selectors with an owner when owner is present in fragment ref', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getSelectorList(variables, UserFragment, [zuck]);
      expect(selectors).toEqual([
        {
          owner: owner,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      ]);
    });

    it('prefers variables from owner when owner is passed', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getSelectorList(
        variables,
        UserFragment,
        [zuck],
        [owner],
      );
      expect(selectors).toEqual([
        {
          owner: owner,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables: {size: 16, cond: true},
          },
        },
      ]);
    });

    it('prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getSelectorList(variables, UserFragment, [zuck]);
      expect(selectors).toEqual([
        {
          owner: owner,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      ]);
    });
  });

  describe('getSelectorsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getSelectorsFromObject(variables, {user: UserFragment}, {user: 'zuck'}),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selectors;
      expect(() => {
        selectors = getSelectorsFromObject(
          variables,
          {user: UserFragment},
          {user: {}},
        );
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(selectors).toEqual({user: null});
    });

    it('ignores keys not present in the fragment map', () => {
      const selectors = getSelectorsFromObject(
        variables,
        {user: UserFragment},
        {
          user: zuck,
          foo: 'foo',
          bar: 42,
        },
      );
      expect(selectors).toEqual({
        user: {
          owner: null,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      });
    });

    it('passes through null/undefined values', () => {
      let selectors = getSelectorsFromObject(
        variables,
        {user: UserFragment},
        {user: null},
      );
      expect(selectors).toEqual({
        user: null,
      });
      selectors = getSelectorsFromObject(
        variables,
        {user: UserFragment},
        {user: undefined},
      );
      expect(selectors).toEqual({
        user: undefined,
      });
    });

    it('returns singular selectors', () => {
      const selectors = getSelectorsFromObject(
        variables,
        {user: UserFragment},
        {user: zuck},
      );
      expect(selectors).toEqual({
        user: {
          owner: null,
          selector: {
            dataID: '4',
            node: UserFragment,
            variables,
          },
        },
      });
    });

    it('returns plural selectors', () => {
      const selectors = getSelectorsFromObject(
        variables,
        {user: UsersFragment},
        {user: [zuck]},
      );
      expect(selectors).toEqual({
        user: [
          {
            owner: null,
            selector: {
              dataID: '4',
              node: UsersFragment,
              variables,
            },
          },
        ],
      });
    });

    describe('with owner', () => {
      beforeEach(() => {
        const queryNode = getRequest(UserQuery);
        owner = createOperationDescriptor(queryNode, operationVariables);
        zuck = environment.lookup(owner.fragment, owner).data.node;
      });

      it('throws for invalid inputs with singular fragment', () => {
        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UserFragment},
            {user: zuck},
            {userr: owner},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` to be defined.',
        );

        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UserFragment},
            {user: zuck},
            {user: null},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` to be defined.',
        );

        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UserFragment},
            {user: zuck},
            {user: ['zuck']},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` not to be an array, got `["zuck"]`.',
        );
      });

      it('throws for invalid inputs with plural fragment', () => {
        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UsersFragment},
            {user: [zuck]},
            {userr: owner},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `undefined`.',
        );

        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UsersFragment},
            {user: [zuck]},
            {user: null},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `null`.',
        );

        expect(() =>
          getSelectorsFromObject(
            variables,
            {user: UsersFragment},
            {user: [zuck]},
            {user: 'zuck'},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `"zuck"`.',
        );
      });

      it('returns singular selectors with an owner when owner is passed', () => {
        const selectors = getSelectorsFromObject(
          variables,
          {user: UserFragment},
          {user: zuck},
          {user: owner},
        );
        expect(selectors).toEqual({
          user: {
            owner: owner,
            selector: {
              dataID: '4',
              node: UserFragment,
              variables,
            },
          },
        });
      });

      it('returns singular selectors with an owner when owner is present in fragment ref', () => {
        const selectors = getSelectorsFromObject(
          variables,
          {user: UserFragment},
          {user: zuck},
        );
        expect(selectors).toEqual({
          user: {
            owner: owner,
            selector: {
              dataID: '4',
              node: UserFragment,
              variables,
            },
          },
        });
      });

      it('returns singular selector and prefers variables from owner when it is passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
          variables,
          {user: UserFragment},
          {user: zuck},
          {user: owner},
        );
        expect(selectors).toEqual({
          user: {
            owner: owner,
            selector: {
              dataID: '4',
              node: UserFragment,
              variables: {size: 16, cond: true},
            },
          },
        });
      });

      it('returns singular selector and prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
          variables,
          {user: UserFragment},
          {user: zuck},
        );
        expect(selectors).toEqual({
          user: {
            owner: owner,
            selector: {
              dataID: '4',
              node: UserFragment,
              variables,
            },
          },
        });
      });

      it('returns plural selectors with an owner when it is passed', () => {
        const selectors = getSelectorsFromObject(
          variables,
          {user: UsersFragment},
          {user: [zuck]},
          {user: [owner]},
        );
        expect(selectors).toEqual({
          user: [
            {
              owner: owner,
              selector: {
                dataID: '4',
                node: UsersFragment,
                variables,
              },
            },
          ],
        });
      });

      it('returns plural selectors with an owner when it is present in fragment ref', () => {
        const selectors = getSelectorsFromObject(
          variables,
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(selectors).toEqual({
          user: [
            {
              owner: owner,
              selector: {
                dataID: '4',
                node: UsersFragment,
                variables,
              },
            },
          ],
        });
      });

      it('returns plural selectors and prefers variables from owner when it is passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
          variables,
          {user: UsersFragment},
          {user: [zuck]},
          {user: [owner]},
        );
        expect(selectors).toEqual({
          user: [
            {
              owner: owner,
              selector: {
                dataID: '4',
                node: UsersFragment,
                variables: {size: 16, cond: true},
              },
            },
          ],
        });
      });

      it('returns plural selectors and prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
          variables,
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(selectors).toEqual({
          user: [
            {
              owner: owner,
              selector: {
                dataID: '4',
                node: UsersFragment,
                variables,
              },
            },
          ],
        });
      });
    });
  });

  describe('getDataIDsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getDataIDsFromObject({user: UserFragment}, {user: 'zuck'}),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let ids;
      expect(() => {
        ids = getDataIDsFromObject({user: UserFragment}, {user: {}});
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(ids).toEqual({user: null});
    });

    it('ignores keys not present in the fragment map', () => {
      const dataIDs = getDataIDsFromObject(
        {user: UserFragment},
        {
          user: zuck,
          foo: 'foo',
          bar: 42,
        },
      );
      expect(dataIDs).toEqual({
        user: '4',
      });
    });

    it('passes through null/undefined values', () => {
      let dataIDs = getDataIDsFromObject({user: UserFragment}, {user: null});
      expect(dataIDs).toEqual({
        user: null,
      });
      dataIDs = getDataIDsFromObject({user: UserFragment}, {user: undefined});
      expect(dataIDs).toEqual({
        user: undefined,
      });
    });

    it('returns singular ids', () => {
      const dataIDs = getDataIDsFromObject({user: UserFragment}, {user: zuck});
      expect(dataIDs).toEqual({
        user: '4',
      });
    });

    it('returns plural ids', () => {
      const dataIDs = getDataIDsFromObject(
        {user: UsersFragment},
        {user: [zuck]},
      );
      expect(dataIDs).toEqual({
        user: ['4'],
      });
    });
  });

  describe('getVariablesFromObject()', () => {
    const inputVariables = {
      cond: true,
      id: '4',
      size: 42,
      other: 'whatevs',
    };

    it('throws for invalid inputs', () => {
      expect(() =>
        getVariablesFromObject(
          inputVariables,
          {user: UserFragment},
          {user: 'zuck'},
        ),
      ).toFailInvariant(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns empty variables and warns for unfetched fragment data', () => {
      let fragmentVariables;
      expect(() => {
        fragmentVariables = getVariablesFromObject(
          variables,
          {user: UserFragment},
          {user: {}},
        );
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(fragmentVariables).toEqual({});
    });

    it('ignores keys not present in the fragment map', () => {
      variables = getVariablesFromObject(
        inputVariables,
        {user: UserFragment},
        {
          foo: 'foo',
          bar: 42,
        },
      );
      expect(variables).toEqual({});
    });

    it('ignores null/undefined values', () => {
      variables = getVariablesFromObject(
        variables,
        {user: UserFragment},
        {user: null},
      );
      expect(variables).toEqual({});
      variables = getVariablesFromObject(
        variables,
        {user: UserFragment},
        {user: undefined},
      );
      expect(variables).toEqual({});
    });

    it('returns variables for singular props', () => {
      variables = getVariablesFromObject(
        inputVariables,
        {user: UserFragment},
        {user: zuck},
      );
      expect(variables).toEqual({
        cond: true,
        size: 42,
      });
    });

    it('returns variables for plural props', () => {
      variables = getVariablesFromObject(
        inputVariables,
        {user: UsersFragment},
        {user: [null, zuck, null]},
      );
      expect(variables).toEqual({
        cond: true,
        size: 42,
      });
    });

    describe('with owner', () => {
      beforeEach(() => {
        const queryNode = getRequest(UserQuery);
        owner = createOperationDescriptor(queryNode, inputVariables);
        zuck = environment.lookup(owner.fragment, owner).data.node;
      });

      it('throws for invalid inputs with singular fragment', () => {
        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UserFragment},
            {user: 'zuck'},
            {userr: owner},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` to be defined.',
        );

        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UserFragment},
            {user: 'zuck'},
            {user: null},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` to be defined.',
        );

        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UserFragment},
            {user: 'zuck'},
            {user: ['zuck']},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UserFragment` ' +
            'under key `user` not to be an array, got `["zuck"]`.',
        );
      });

      it('throws for invalid inputs with plural fragment', () => {
        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UsersFragment},
            {user: [zuck]},
            {userr: owner},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `undefined`.',
        );

        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UsersFragment},
            {user: [zuck]},
            {user: null},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `null`.',
        );

        expect(() =>
          getVariablesFromObject(
            inputVariables,
            {user: UsersFragment},
            {user: [zuck]},
            {user: 'zuck'},
          ),
        ).toFailInvariant(
          'RelayModernSelector: Expected explcitly provided owner for fragment `UsersFragment` ' +
            'under key `user` to be an array, got `"zuck"`.',
        );
      });

      it('returns variables for singular props when owner is passed', () => {
        variables = getVariablesFromObject(
          inputVariables,
          {user: UserFragment},
          {user: zuck},
          {user: owner},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for singular props when owner is present in fragment ref', () => {
        variables = getVariablesFromObject(
          inputVariables,
          {user: UserFragment},
          {user: zuck},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for singular props and prefers variables from owner when it is passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject(
          inputVariables,
          {user: UserFragment},
          {user: zuck},
          {user: owner},
        );
        expect(variables).toEqual({
          cond: false,
          size: 16,
        });
      });

      it('returns variables for singular props and prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject(
          inputVariables,
          {user: UserFragment},
          {user: zuck},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for plural props when owner is passed', () => {
        variables = getVariablesFromObject(
          inputVariables,
          {user: UsersFragment},
          {user: [zuck]},
          {user: [owner]},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for plural props when owner is present in fragment ref', () => {
        variables = getVariablesFromObject(
          inputVariables,
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for plural props and prefers variables from owner when it is passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject(
          inputVariables,
          {user: UsersFragment},
          {user: [zuck]},
          {user: [owner]},
        );
        expect(variables).toEqual({
          cond: false,
          size: 16,
        });
      });

      it('returns variables for plural props and prefers passed variables when owner is present in fragment ref, but not explicitly passed', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject(
          inputVariables,
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });
    });
  });

  describe('areEqualSelectors()', () => {
    it('returns true for equivalent selectors', () => {
      const selector = {
        owner: null,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      };
      const clone = {
        ...selector,
        variables: {...selector.variables},
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);
    });

    it('returns true for equivalent selectors with owners', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      const selector = {
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      };
      const clone = {
        owner: {...selector.owner},
        selector: {
          ...selector.selector,
          variables: {...selector.selector.variables},
        },
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);

      // Even if the owner is different, areEqualSelectors should return true
      // if the 2 selectors represent the same selection
      const differentOwner = {
        ...selector,
        owner: {...owner, variables: {}},
      };
      expect(areEqualSelectors(selector, differentOwner)).toBe(true);
    });

    it('returns false for different selectors', () => {
      const readerSelector = {
        dataID: '4',
        node: UserFragment,
        variables,
      };
      const selector = {
        owner: null,
        selector: readerSelector,
      };
      const differentID = {
        ...selector,
        selector: {...readerSelector, dataID: 'beast'},
      };
      const differentNode = {
        ...selector,
        selector: {...readerSelector, node: {...selector.node}},
      };
      const differentVars = {
        ...selector,
        selector: {...readerSelector, variables: {}},
      };
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
    });

    it('returns false for different selectors with owners', () => {
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      const readerSelector = {
        dataID: '4',
        node: UserFragment,
        variables,
      };
      const selector = {
        owner: owner,
        selector: {
          dataID: '4',
          node: UserFragment,
          variables,
        },
      };
      const differentID = {
        ...selector,
        selector: {...readerSelector, dataID: 'beast'},
      };
      const differentNode = {
        ...selector,
        selector: {...readerSelector, node: {...selector.node}},
      };
      const differentVars = {
        ...selector,
        selector: {...readerSelector, variables: {}},
      };
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
    });
  });
});

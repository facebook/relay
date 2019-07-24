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

const {getRequest} = require('../../query/RelayModernGraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSingularSelector,
  getPluralSelector,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {
  createMockEnvironment,
  generateAndCompile,
  matchers,
} = require('relay-test-utils-internal');

describe('RelayModernSelector', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let zuck;
  let variables;
  let operationVariables;
  let operationDescriptor;
  let owner;

  beforeEach(() => {
    expect.extend(matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery, UsersFragment} = generateAndCompile(`
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
    operationDescriptor = {
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
    zuck = environment.lookup(
      {
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '4'},
      },
      operationDescriptor,
    ).data.node;
    variables = {
      size: null,
      cond: false,
    };
  });

  describe('getSingularSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getSingularSelector(UserFragment, 'zuck')).toThrowError(
        'RelayModernSelector: Expected value for fragment `UserFragment` to ' +
          'be an object, got `"zuck"`.',
      );
      expect(() => getSingularSelector(UserFragment, [zuck])).toThrowError(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an object, got ' +
          '`[{"__fragments":{"UserFragment":{},"UsersFragment":{}},"__id":"4","__fragmentOwner":' +
          JSON.stringify(operationDescriptor) +
          '}]`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selector;
      expect(() => {
        selector = getSingularSelector(UserFragment, {});
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
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSingularSelector(UserFragment, zuck);
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

    it('uses variables from owner', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selector = getSingularSelector(UserFragment, zuck);
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
  });

  describe('getPluralSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getPluralSelector(UserFragment, ['zuck'])).toThrowError(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be ' +
          'an object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selectors;
      expect(() => {
        selectors = getPluralSelector(UserFragment, [{}]);
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
      const queryNode = getRequest(UserQuery);
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getPluralSelector(UserFragment, [zuck]);
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

    it('uses owner variables', () => {
      const queryNode = getRequest(UserQuery);
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = environment.lookup(owner.fragment, owner).data.node;

      const selectors = getPluralSelector(UserFragment, [zuck]);
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
  });

  describe('getSelectorsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getSelectorsFromObject({user: UserFragment}, {user: 'zuck'}),
      ).toThrowError(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selectors;
      expect(() => {
        selectors = getSelectorsFromObject({user: UserFragment}, {user: {}});
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
        {user: UserFragment},
        {
          user: zuck,
          foo: 'foo',
          bar: 42,
        },
      );
      expect(selectors).toEqual({
        user: {
          owner: operationDescriptor,
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
        {user: UserFragment},
        {user: null},
      );
      expect(selectors).toEqual({
        user: null,
      });
      selectors = getSelectorsFromObject(
        {user: UserFragment},
        {user: undefined},
      );
      expect(selectors).toEqual({
        user: undefined,
      });
    });

    it('returns singular selectors', () => {
      const selectors = getSelectorsFromObject(
        {user: UserFragment},
        {user: zuck},
      );
      expect(selectors).toEqual({
        user: {
          owner: operationDescriptor,
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
        {user: UsersFragment},
        {user: [zuck]},
      );
      expect(selectors).toEqual({
        user: [
          {
            owner: operationDescriptor,
            selector: {
              dataID: '4',
              node: UsersFragment,
              variables,
            },
          },
        ],
      });
    });

    describe('with fragment owner', () => {
      beforeEach(() => {
        const queryNode = getRequest(UserQuery);
        owner = createOperationDescriptor(queryNode, operationVariables);
        zuck = environment.lookup(owner.fragment, owner).data.node;
      });

      it('returns singular selectors', () => {
        const selectors = getSelectorsFromObject(
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

      it('returns singular selector and uses variables from owner', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
          {user: UserFragment},
          {user: zuck},
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

      it('returns plural selectors', () => {
        const selectors = getSelectorsFromObject(
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

      it('returns plural selectors and uses variables from owner', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        const selectors = getSelectorsFromObject(
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
                variables: {size: 16, cond: true},
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
      ).toThrowError(
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
        getVariablesFromObject({user: UserFragment}, {user: 'zuck'}),
      ).toThrowError(
        'RelayModernSelector: Expected value for fragment `UserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns empty variables and warns for unfetched fragment data', () => {
      let fragmentVariables;
      expect(() => {
        fragmentVariables = getVariablesFromObject(
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
        {user: UserFragment},
        {
          foo: 'foo',
          bar: 42,
        },
      );
      expect(variables).toEqual({});
    });

    it('ignores null/undefined values', () => {
      variables = getVariablesFromObject({user: UserFragment}, {user: null});
      expect(variables).toEqual({});
      variables = getVariablesFromObject(
        {user: UserFragment},
        {user: undefined},
      );
      expect(variables).toEqual({});
    });

    it('returns variables for singular props', () => {
      variables = getVariablesFromObject({user: UserFragment}, {user: zuck});
      expect(variables).toEqual({
        cond: false,
        size: null,
      });
    });

    it('returns variables for plural props', () => {
      variables = getVariablesFromObject(
        {user: UsersFragment},
        {user: [null, zuck, null]},
      );
      expect(variables).toEqual({
        cond: false,
        size: null,
      });
    });

    describe('with fragment owner', () => {
      beforeEach(() => {
        const queryNode = getRequest(UserQuery);
        owner = createOperationDescriptor(queryNode, inputVariables);
        zuck = environment.lookup(owner.fragment, owner).data.node;
      });

      it('returns variables for singular props', () => {
        variables = getVariablesFromObject({user: UserFragment}, {user: zuck});
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });
      it('returns variables for singular props and uses variables from owner', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject({user: UserFragment}, {user: zuck});
        expect(variables).toEqual({
          cond: false,
          size: 16,
        });
      });
      it('returns variables for plural props', () => {
        variables = getVariablesFromObject(
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });

      it('returns variables for plural props and uses variables from owner', () => {
        const queryNode = getRequest(UserQuery);
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = environment.lookup(owner.fragment, owner).data.node;
        variables = getVariablesFromObject(
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(variables).toEqual({
          cond: false,
          size: 16,
        });
      });
    });
  });

  describe('areEqualSelectors()', () => {
    it('returns true for equivalent selectors', () => {
      const selector = {
        owner: operationDescriptor,
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

    it('returns false for equivalent selectors but with different owners', () => {
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
        owner,
        selector: {
          ...selector.selector,
          variables: {...selector.selector.variables},
        },
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);

      // Even if the owner is different, areEqualSelectors should return false
      // if the 2 selectors represent the same selection
      const differentOwner = {
        ...selector,
        owner: {...owner, variables: {}},
      };
      expect(areEqualSelectors(selector, differentOwner)).toBe(false);
    });

    it('returns true for equivalent selectors with same owners', () => {
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
        owner: owner,
        selector: {
          ...selector.selector,
          variables: {...selector.selector.variables},
        },
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);
    });

    it('returns false for different selectors', () => {
      const readerSelector = {
        dataID: '4',
        node: UserFragment,
        variables,
      };
      const selector = {
        owner: operationDescriptor,
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
      const differentOwner = {
        ...selector,
        owner: {...owner},
      };
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
      expect(areEqualSelectors(selector, differentOwner)).toBe(false);
    });
  });
});

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
} = require('RelayModernSelector');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {ROOT_ID} = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');

describe('RelayModernSelector', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let zuck;
  let variables;

  beforeEach(() => {
    expect.extend(RelayModernTestUtils.matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery, UsersFragment} = environment.mock.compile(
      `
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
    `,
    ));
    const dataID = ROOT_ID;
    variables = {id: '4', size: null, cond: false};
    const fragment = {
      dataID,
      node: UserQuery.fragment,
      variables,
    };
    const root = {
      dataID,
      node: UserQuery.query,
      variables,
    };
    const operationSelector = {
      fragment,
      root,
      node: UserQuery,
      variables,
    };

    environment.commitPayload(operationSelector, {
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
          '`[{"__fragments":{"UserFragment":{},"UsersFragment":{}},"__id":"4"}]`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selector;
      expect(() => {
        selector = getSelector(variables, UserFragment, {});
      }).toWarn([
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s`.',
        'UserFragment',
        '{}',
        'UserFragment',
      ]);
      expect(selector).toBe(null);
    });

    it('returns a selector', () => {
      const selector = getSelector(variables, UserFragment, zuck);
      expect(selector).toEqual({
        dataID: '4',
        node: UserFragment,
        variables,
      });
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
          'operation/fragment included fragment `...%s`.',
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
          dataID: '4',
          node: UserFragment,
          variables,
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
          'operation/fragment included fragment `...%s`.',
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
          dataID: '4',
          node: UserFragment,
          variables,
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
          dataID: '4',
          node: UserFragment,
          variables,
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
            dataID: '4',
            node: UsersFragment,
            variables,
          },
        ],
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
          'operation/fragment included fragment `...%s`.',
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
          'operation/fragment included fragment `...%s`.',
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
  });

  describe('areEqualSelectors()', () => {
    it('returns trure for equivalent selectors', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables,
      };
      const clone = {
        ...selector,
        variables: {...selector.variables},
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);
    });

    it('returns false for different selectors', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables,
      };
      const differentID = {...selector, dataID: 'beast'};
      const differentNode = {...selector, node: {...selector.node}};
      const differentVars = {...selector, variables: {}};
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
    });
  });
});

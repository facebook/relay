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
  .mock('warning')
  .autoMockOff();

const {graphql} = require('RelayGraphQLTag');
const RelayEnvironment = require('RelayEnvironment');
const RelayTestUtils = require('RelayTestUtils');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('RelaySelector');

describe('RelaySelector', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let store;
  let zuck;
  let variables;

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);

    environment = new RelayEnvironment();
    store = environment.getStoreData();

    // Object property
    const fragments = {
      user: graphql`
        fragment RelaySelector_user on User {
          id
          name
          profilePicture(size: $size) @include(if: $cond) {
            uri
          }
        }
      `.relay(),
      users: graphql`
        fragment RelaySelector_users on User @relay(plural: true) {
          id
          name
          profilePicture(size: $size) @include(if: $cond) {
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
      query RelaySelectorQuery($id: ID!, $size: Int, $cond: Boolean!) {
        node(id: $id) {
          ...Container_user
          ...Container_users
        }
      }
    `.relay();
    UserFragment = fragments.user;
    UsersFragment = fragments.users;

    const query = RelayTestUtils.getNode(
      UserQuery.queries.node,
      {id: '4', size: null, cond: false},
    );
    RelayTestUtils.writePayload(
      store.getRecordStore(),
      store.getRecordWriter(),
      query,
      {
        node: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
      },
    );
    zuck = environment.readQuery(query)[0];
    variables = {
      size: null,
      cond: false,
    };
  });

  describe('getSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getSelector(variables, UserFragment, 'zuck'))
        .toFailInvariant(
          'RelaySelector: Expected value for fragment `RelaySelector_user` to ' +
          'be an object, got `"zuck"`.'
        );
      expect(() => getSelector(variables, UserFragment, [zuck]))
        .toFailInvariant(
          'RelaySelector: Expected value for fragment `RelaySelector_user` to be an object, got ' +
          '`[{"__dataID__":"4","__fragments__":{"0::client":[{"size":null,"cond":false}],"1::client":[{"size":null,"cond":false}]}}]`.'
        );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selector;
      expect(() => {
        selector = getSelector(variables, UserFragment, {});
      }).toWarn([
        'RelaySelector: Expected object to contain data for fragment ' +
        '`%s`, got `%s`. Make sure that the parent ' +
        'operation/fragment included fragment `...%s`.',
        'RelaySelector_user',
        '{}',
        'RelaySelector_user',
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
      expect(() => getSelectorList(variables, UserFragment, ['zuck']))
        .toFailInvariant(
          'RelaySelector: Expected value for fragment `RelaySelector_user` to be ' +
          'an object, got `"zuck"`.'
        );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let selectors;
      expect(() => {
        selectors = getSelectorList(variables, UserFragment, [{}]);
      }).toWarn([
        'RelaySelector: Expected object to contain data for fragment ' +
        '`%s`, got `%s`. Make sure that the parent ' +
        'operation/fragment included fragment `...%s`.',
        'RelaySelector_user',
        '{}',
        'RelaySelector_user',
      ]);
      expect(selectors).toBe(null);
    });

    it('returns selectors', () => {
      const selectors = getSelectorList(variables, UserFragment, [zuck]);
      expect(selectors).toEqual([{
        dataID: '4',
        node: UserFragment,
        variables,
      }]);
    });
  });

  describe('getSelectorsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getSelectorsFromObject(
        variables,
        {user: UserFragment},
        {user: 'zuck'},
      )).toFailInvariant(
        'RelaySelector: Expected value for fragment `RelaySelector_user` to be an ' +
        'object, got `"zuck"`.'
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
        'RelaySelector: Expected object to contain data for fragment ' +
        '`%s`, got `%s`. Make sure that the parent ' +
        'operation/fragment included fragment `...%s`.',
        'RelaySelector_user',
        '{}',
        'RelaySelector_user',
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
        user: [{
          dataID: '4',
          node: UsersFragment,
          variables,
        }],
      });
    });
  });

  describe('getDataIDsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getDataIDsFromObject(
        {user: UserFragment},
        {user: 'zuck'},
      )).toFailInvariant(
        'RelaySelector: Expected value for fragment `RelaySelector_user` to be an ' +
        'object, got `"zuck"`.'
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      let ids;
      expect(() => {
        ids = getDataIDsFromObject(
          {user: UserFragment},
          {user: {}},
        );
      }).toWarn([
        'RelaySelector: Expected object to contain data for fragment ' +
        '`%s`, got `%s`. Make sure that the parent ' +
        'operation/fragment included fragment `...%s`.',
        'RelaySelector_user',
        '{}',
        'RelaySelector_user',
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
      let dataIDs = getDataIDsFromObject(
        {user: UserFragment},
        {user: null},
      );
      expect(dataIDs).toEqual({
        user: null,
      });
      dataIDs = getDataIDsFromObject(
        {user: UserFragment},
        {user: undefined},
      );
      expect(dataIDs).toEqual({
        user: undefined,
      });
    });

    it('returns singular ids', () => {
      const dataIDs = getDataIDsFromObject(
        {user: UserFragment},
        {user: zuck},
      );
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

    beforeEach(() => {
      const query = RelayTestUtils.getNode(
        UserQuery.queries.node,
        inputVariables,
      );
      zuck = environment.readQuery(query)[0];
    });

    it('throws for invalid inputs', () => {
      expect(() => getVariablesFromObject(
        inputVariables,
        {user: UserFragment},
        {user: 'zuck'},
      )).toFailInvariant(
        'RelaySelector: Expected value for fragment `RelaySelector_user` to be an ' +
        'object, got `"zuck"`.'
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
        'RelaySelector: Expected object to contain data for fragment ' +
        '`%s`, got `%s`. Make sure that the parent ' +
        'operation/fragment included fragment `...%s`.',
        'RelaySelector_user',
        '{}',
        'RelaySelector_user',
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

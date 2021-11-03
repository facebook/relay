/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {OperationDescriptor} from '../RelayStoreTypes';

const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
  createRequestDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  areEqualSelectors,
  createNormalizationSelector,
  createReaderSelector,
  getDataIDsFromObject,
  getPluralSelector,
  getSelectorsFromObject,
  getSingularSelector,
  getVariablesFromObject,
} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {createMockEnvironment, matchers} = require('relay-test-utils-internal');
const warning = require('warning');

describe('RelayModernSelector', () => {
  let UserFragment;
  let UserQuery;
  let UsersFragment;
  let environment;
  let zuck;
  let variables;
  let operationVariables;
  let operationDescriptor: OperationDescriptor;
  let owner;

  beforeEach(() => {
    // $FlowFixMe[incompatible-call]
    expect.extend(matchers);
    jest.mock('warning');

    environment = createMockEnvironment();
    UserQuery = getRequest(graphql`
      query RelayModernSelectorTestUserQuery(
        $id: ID!
        $size: [Int]
        $cond: Boolean!
      ) {
        node(id: $id) {
          ...RelayModernSelectorTestUserFragment
          ...RelayModernSelectorTestUsersFragment
        }
      }
    `);
    UserFragment = getFragment(graphql`
      fragment RelayModernSelectorTestUserFragment on User {
        id
        name
        profilePicture(size: $size) @include(if: $cond) {
          uri
        }
      }
    `);
    UsersFragment = getFragment(graphql`
      fragment RelayModernSelectorTestUsersFragment on User
      @relay(plural: true) {
        id
        name
        profilePicture(size: $size) @include(if: $cond) {
          uri
        }
      }
    `);
    const dataID = ROOT_ID;
    variables = {id: '4', size: null, cond: false};
    operationVariables = variables;
    const requestDescriptor = createRequestDescriptor(UserQuery, variables);
    const fragment = createReaderSelector(
      UserQuery.fragment,
      dataID,
      variables,
      requestDescriptor,
    );
    const root = createNormalizationSelector(
      UserQuery.operation,
      dataID,
      variables,
    );
    operationDescriptor = {
      fragment,
      request: requestDescriptor,
      root,
    };

    environment.commitPayload(operationDescriptor, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    zuck = (environment.lookup(
      createReaderSelector(
        UserQuery.fragment,
        ROOT_ID,
        {id: '4'},
        operationDescriptor.request,
      ),
    ).data: $FlowFixMe).node;
    variables = {
      size: null,
      cond: false,
    };
  });

  describe('getSingularSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getSingularSelector(UserFragment, 'zuck')).toThrowError(
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to ' +
          'be an object, got `"zuck"`.',
      );
      expect(() => getSingularSelector(UserFragment, [zuck])).toThrowError(
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to be an object, got ' +
          '`[{"__fragments":{"RelayModernSelectorTestUserFragment":{},"RelayModernSelectorTestUsersFragment":{}},"__id":"4","__fragmentOwner":' +
          JSON.stringify(operationDescriptor.request) +
          ',"__isWithinUnmatchedTypeRefinement":false}]`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      const selector = getSingularSelector(UserFragment, {});
      expect(warning).toHaveBeenCalledWith(
        false,
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'RelayModernSelectorTestUserFragment',
        '{}',
        'RelayModernSelectorTestUserFragment',
      );
      expect(selector).toBe(null);
    });

    it('returns a selector', () => {
      const queryNode = UserQuery;
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;

      const selector = getSingularSelector(UserFragment, zuck);
      expect(selector).toEqual(
        createReaderSelector(UserFragment, '4', variables, owner.request),
      );
      expect(selector?.owner).toBe(owner.request);
    });

    it('uses variables from owner', () => {
      const queryNode = UserQuery;
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;

      const selector = getSingularSelector(UserFragment, zuck);
      expect(selector).toEqual(
        createReaderSelector(
          UserFragment,
          '4',
          {
            size: 16,
            cond: true,
          },
          owner.request,
        ),
      );
      expect(selector?.owner).toBe(owner.request);
    });
  });

  describe('getPluralSelector()', () => {
    it('throws for invalid inputs', () => {
      expect(() => getPluralSelector(UserFragment, ['zuck'])).toThrowError(
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to be ' +
          'an object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      const selectors = getPluralSelector(UserFragment, [{}]);
      expect(warning).toHaveBeenCalledWith(
        false,
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'RelayModernSelectorTestUserFragment',
        '{}',
        'RelayModernSelectorTestUserFragment',
      );
      expect(selectors).toBe(null);
    });

    it('returns selectors', () => {
      const queryNode = UserQuery;
      owner = createOperationDescriptor(queryNode, operationVariables);
      zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;

      const selector = getPluralSelector(UserFragment, [zuck]);
      expect(selector).toEqual({
        kind: 'PluralReaderSelector',
        selectors: [
          createReaderSelector(UserFragment, '4', variables, owner.request),
        ],
      });
    });

    it('uses owner variables', () => {
      const queryNode = UserQuery;
      // Pass owner with different variables
      owner = createOperationDescriptor(queryNode, {
        id: '4',
        size: 16,
        cond: true,
      });
      zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;

      const selector = getPluralSelector(UserFragment, [zuck]);
      expect(selector).toEqual({
        kind: 'PluralReaderSelector',
        selectors: [
          createReaderSelector(
            UserFragment,
            '4',
            {
              size: 16,
              cond: true,
            },
            owner.request,
          ),
        ],
      });
    });
  });

  describe('getSelectorsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getSelectorsFromObject({user: UserFragment}, {user: 'zuck'}),
      ).toThrowError(
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      const selectors = getSelectorsFromObject(
        {user: UserFragment},
        {user: {}},
      );
      expect(warning).toHaveBeenCalledWith(
        false,
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'RelayModernSelectorTestUserFragment',
        '{}',
        'RelayModernSelectorTestUserFragment',
      );
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
        user: createReaderSelector(
          UserFragment,
          '4',
          variables,
          operationDescriptor.request,
        ),
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
        user: createReaderSelector(
          UserFragment,
          '4',
          variables,
          operationDescriptor.request,
        ),
      });
    });

    it('returns plural selectors', () => {
      const selectors = getSelectorsFromObject(
        {user: UsersFragment},
        {user: [zuck]},
      );
      expect(selectors).toEqual({
        user: {
          kind: 'PluralReaderSelector',
          selectors: [
            createReaderSelector(
              UsersFragment,
              '4',
              variables,
              operationDescriptor.request,
            ),
          ],
        },
      });
    });

    describe('with fragment owner', () => {
      beforeEach(() => {
        const queryNode = UserQuery;
        owner = createOperationDescriptor(queryNode, operationVariables);
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
      });

      it('returns singular selectors', () => {
        const selectors = getSelectorsFromObject(
          {user: UserFragment},
          {user: zuck},
        );
        expect(selectors).toEqual({
          user: createReaderSelector(
            UserFragment,
            '4',
            variables,
            owner.request,
          ),
        });
      });

      it('returns singular selector and uses variables from owner', () => {
        const queryNode = UserQuery;
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
        const selectors = getSelectorsFromObject(
          {user: UserFragment},
          {user: zuck},
        );
        expect(selectors).toEqual({
          user: createReaderSelector(
            UserFragment,
            '4',
            {
              size: 16,
              cond: true,
            },
            owner.request,
          ),
        });
      });

      it('returns plural selectors', () => {
        const selectors = getSelectorsFromObject(
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(selectors).toEqual({
          user: {
            kind: 'PluralReaderSelector',
            selectors: [
              createReaderSelector(
                UsersFragment,
                '4',
                variables,
                owner.request,
              ),
            ],
          },
        });
      });

      it('returns plural selectors and uses variables from owner', () => {
        const queryNode = UserQuery;
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: true,
        });
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
        const selectors = getSelectorsFromObject(
          {user: UsersFragment},
          {user: [zuck]},
        );
        expect(selectors).toEqual({
          user: {
            kind: 'PluralReaderSelector',
            selectors: [
              createReaderSelector(
                UsersFragment,
                '4',
                {
                  size: 16,
                  cond: true,
                },
                owner.request,
              ),
            ],
          },
        });
      });
    });
  });

  describe('getDataIDsFromObject()', () => {
    it('throws for invalid inputs', () => {
      expect(() =>
        getDataIDsFromObject({user: UserFragment}, {user: 'zuck'}),
      ).toThrowError(
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns null and warns for unfetched fragment data', () => {
      const ids = getDataIDsFromObject({user: UserFragment}, {user: {}});
      expect(warning).toHaveBeenCalledWith(
        false,
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'RelayModernSelectorTestUserFragment',
        '{}',
        'RelayModernSelectorTestUserFragment',
      );
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
        'RelayModernSelector: Expected value for fragment `RelayModernSelectorTestUserFragment` to be an ' +
          'object, got `"zuck"`.',
      );
    });

    it('returns empty variables and warns for unfetched fragment data', () => {
      const fragmentVariables = getVariablesFromObject(
        {user: UserFragment},
        {user: {}},
      );
      expect(warning).toHaveBeenCalledWith(
        false,
        'RelayModernSelector: Expected object to contain data for fragment ' +
          '`%s`, got `%s`. Make sure that the parent ' +
          'operation/fragment included fragment `...%s` without `@relay(mask: false)`.',
        'RelayModernSelectorTestUserFragment',
        '{}',
        'RelayModernSelectorTestUserFragment',
      );
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
        const queryNode = UserQuery;
        owner = createOperationDescriptor(queryNode, inputVariables);
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
      });

      it('returns variables for singular props', () => {
        variables = getVariablesFromObject({user: UserFragment}, {user: zuck});
        expect(variables).toEqual({
          cond: true,
          size: 42,
        });
      });
      it('returns variables for singular props and uses variables from owner', () => {
        const queryNode = UserQuery;
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
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
        const queryNode = UserQuery;
        // Pass owner with different variables
        owner = createOperationDescriptor(queryNode, {
          id: '4',
          size: 16,
          cond: false,
        });
        zuck = (environment.lookup(owner.fragment).data: $FlowFixMe).node;
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
      const selector = createReaderSelector(
        UserFragment,
        '4',
        variables,
        operationDescriptor.request,
      );
      const clone = {
        ...selector,
        // $FlowFixMe[cannot-spread-interface]
        variables: {...selector.variables},
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);
    });

    it('returns false for equivalent selectors but with different owners', () => {
      const queryNode = UserQuery;
      owner = createOperationDescriptor(queryNode, operationVariables);
      const selector = createReaderSelector(
        UserFragment,
        '4',
        variables,
        owner.request,
      );
      // When the owner is different, areEqualSelectors should return false
      // even if the 2 selectors represent the same selection
      const differentOwner = {
        ...selector,
        owner: {...owner.request},
      };
      expect(areEqualSelectors(selector, differentOwner)).toBe(false);
    });

    it('returns true for equivalent selectors with same owners', () => {
      const queryNode = UserQuery;
      owner = createOperationDescriptor(queryNode, operationVariables);
      const selector = createReaderSelector(
        UserFragment,
        '4',
        variables,
        owner.request,
      );
      const clone = {
        ...selector,
        // $FlowFixMe[cannot-spread-interface]
        variables: {...selector.variables},
      };
      expect(areEqualSelectors(selector, selector)).toBe(true);
      expect(areEqualSelectors(selector, clone)).toBe(true);
    });

    it('returns false for different selectors', () => {
      const selector = createReaderSelector(
        UserFragment,
        '4',
        variables,
        operationDescriptor.request,
      );
      const differentID = {
        ...selector,
        dataID: 'beast',
      };
      const differentNode = {
        ...selector,
        node: {...selector.node},
      };
      const differentVars = {
        ...selector,
        variables: {},
      };
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
    });

    it('returns false for different selectors with owners', () => {
      const queryNode = UserQuery;
      owner = createOperationDescriptor(queryNode, operationVariables);
      const selector = createReaderSelector(
        UserFragment,
        '4',
        variables,
        owner.request,
      );
      const differentID = {
        ...selector,
        dataID: 'beast',
      };
      const differentNode = {
        ...selector,
        node: {...selector.node},
      };
      const differentVars = {
        ...selector,
        variables: {},
      };
      const differentOwner = {
        ...selector,
        owner: {...owner.request},
      };
      expect(areEqualSelectors(selector, differentID)).toBe(false);
      expect(areEqualSelectors(selector, differentNode)).toBe(false);
      expect(areEqualSelectors(selector, differentVars)).toBe(false);
      expect(areEqualSelectors(selector, differentOwner)).toBe(false);
    });
  });
});

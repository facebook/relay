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

const RelayModernTestUtils = require('RelayModernTestUtils');

const {
  getFragment,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  isFragment,
  isRequest,
} = require('../RelayModernGraphQLTag');

describe('RelayModernRefetchableFragment', () => {
  const {generateAndCompile} = RelayModernTestUtils;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('isFragment/getFragment()', () => {
    let fragment;

    beforeEach(() => {
      ({UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User {
          name
        }
      `));
    });

    it('returns concrete fragments as-is', () => {
      expect(isFragment(fragment)).toBe(true);
      expect(getFragment(fragment)).toBe(fragment);
    });

    it('returns fragments wrapped in a thunk', () => {
      expect(isFragment(() => fragment)).toBe(true);
      expect(getFragment(() => fragment)).toBe(fragment);
    });

    it('returns fragments wrapped in a compat object', () => {
      const taggedNode = {
        modern: () => fragment,
        classic: jest.fn(),
      };
      expect(isFragment(taggedNode)).toBe(true);
      expect(getFragment(taggedNode)).toBe(fragment);
    });
  });

  describe('isRequest/getRequest()', () => {
    let query;

    beforeEach(() => {
      ({Query: query} = generateAndCompile(`
        query Query {
          me {
            id
          }
        }
      `));
    });

    it('returns concrete queries as-is', () => {
      expect(isRequest(query)).toBe(true);
      expect(getRequest(query)).toBe(query);
    });

    it('returns queries wrapped in a thunk', () => {
      expect(isRequest(() => query)).toBe(true);
      expect(getRequest(() => query)).toBe(query);
    });

    it('returns queries wrapped in a compat object', () => {
      const taggedNode = {
        modern: () => query,
        classic: jest.fn(),
      };
      expect(isRequest(taggedNode)).toBe(true);
      expect(getRequest(taggedNode)).toBe(query);
    });
  });

  describe('getRefetchableFragment()', () => {
    it('returns null for non-refetchable fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User {
          name
        }
      `);
      expect(getRefetchableFragment(fragment)).toBe(null);
    });

    it('returns refetchable fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User
          @refetchable(queryName: "UserFragmentRefetchQuery") {
          id
          name
        }
      `);
      const refetchable = getRefetchableFragment(fragment);
      expect(refetchable).toBe(fragment);
    });

    it('returns refetchable pagination fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User
          @refetchable(queryName: "UserFragmentRefetchQuery") {
          id
          name
          friends(after: $after, first: $first)
            @connection(key: "UserFragment_friends") {
            edges {
              node {
                id
              }
            }
          }
        }
      `);
      const refetchable = getRefetchableFragment(fragment);
      expect(refetchable).toBe(fragment);
    });
  });

  describe('getPaginationFragment()', () => {
    it('returns null for non-refetchable fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User {
          name
        }
      `);
      expect(getPaginationFragment(fragment)).toBe(null);
    });

    it('returns null for refetchable fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User
          @refetchable(queryName: "UserFragmentRefetchQuery") {
          id
          name
        }
      `);
      expect(getPaginationFragment(fragment)).toBe(null);
    });

    it('returns refetchable pagination fragments', () => {
      const {UserFragment: fragment} = generateAndCompile(`
        fragment UserFragment on User
          @refetchable(queryName: "UserFragmentRefetchQuery") {
          id
          name
          friends(after: $after, first: $first)
            @connection(key: "UserFragment_friends") {
            edges {
              node {
                id
              }
            }
          }
        }
      `);
      const refetchable = getPaginationFragment(fragment);
      expect(refetchable).toBe(fragment);
    });
  });
});

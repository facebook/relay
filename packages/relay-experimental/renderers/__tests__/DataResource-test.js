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

'use strict';

jest.mock('../../utils/fetchQueryUtils');

const invariant = require('invariant');
const {getCacheForEnvironment} = require('../DataResource');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {createOperationSelector, getFragment} = require('relay-runtime');

const {
  fetchQuery,
  getPromiseForRequestInFlight,
} = require('../../utils/fetchQueryUtils');

describe('DataResource', () => {
  let environment;
  let DataResource;
  let fetchPolicy;
  let gqlQuery;
  let query;
  let queryMissingData;
  let gqlQueryMissingData;
  const variables = {
    id: '4',
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    DataResource = getCacheForEnvironment(environment);
    gqlQuery = generateAndCompile(
      `query UserQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            id
          }
        }
      }
    `,
    ).UserQuery;
    gqlQueryMissingData = generateAndCompile(
      `query UserQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            id
            name
          }
        }
      }
    `,
    ).UserQuery;

    queryMissingData = createOperationSelector(gqlQueryMissingData, variables);
    query = createOperationSelector(gqlQuery, variables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '4',
      },
    });
  });

  afterEach(() => {
    (fetchQuery: any).mockReset();
    (getPromiseForRequestInFlight: any).mockReset();
  });

  describe('readQuery', () => {
    describe('fetchPolicy: store-or-network', () => {
      beforeEach(() => {
        fetchPolicy = 'store-or-network';
      });

      it('should read data (if all data is available) without network request', () => {
        const result = DataResource.readQuery({
          environment,
          query,
          fetchPolicy,
        });
        expect(fetchQuery).not.toBeCalled();
        expect(result.data).toMatchObject({
          node: {
            id: '4',
          },
        });
      });

      it('should send a network request (and throw promise) if data is missing for the query', () => {
        let thrown = false;
        try {
          DataResource.readQuery({
            environment,
            query: queryMissingData,
            fetchPolicy,
          });
        } catch (p) {
          thrown = true;
          expect(p).toBeInstanceOf(Promise);
        }
        expect(thrown).toBe(true);
        expect(fetchQuery).toBeCalled();
      });

      describe('when using fragments', () => {
        it('should read data (if all data is available) without network request', () => {
          const {UserQuery} = generateAndCompile(
            `
              fragment UserFragment on User {
                id
              }
              query UserQuery($id: ID!) {
                node(id: $id) {
                  __typename
                  ...UserFragment
                }
              }
            `,
          );
          const queryWithFragments = createOperationSelector(
            UserQuery,
            variables,
          );

          const result = DataResource.readQuery({
            environment,
            query: queryWithFragments,
            fetchPolicy,
          });
          expect(fetchQuery).not.toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              __fragments: {
                UserFragment: {},
              },
              __id: '4',
              __typename: 'User',
            },
          });
        });

        it(
          'should read query without throwing a promise, and also start a ' +
            'network request when some data is missing in fragment',
          () => {
            const {UserQuery} = generateAndCompile(
              `
                fragment UserFragment on User {
                  id
                  username
                }
                query UserQuery($id: ID!) {
                  node(id: $id) {
                    __typename
                    ...UserFragment
                  }
                }
              `,
            );
            const queryWithFragments = createOperationSelector(
              UserQuery,
              variables,
            );

            // In this case a promise isn't thrown because the query
            // doesn't have any missing fields, so it can be read.
            // The fragment itself is the one that has a missing field, so
            // attempting to read the fragment should throw, but that's not
            // being tested here.
            const result = DataResource.readQuery({
              environment,
              query: queryWithFragments,
              fetchPolicy,
            });
            expect(fetchQuery).toBeCalled();
            expect(result.data).toMatchObject({
              node: {
                __fragments: {
                  UserFragment: {},
                },
                __id: '4',
                __typename: 'User',
              },
            });
          },
        );
      });
    });

    describe('fetchPolicy: store-and-network', () => {
      beforeEach(() => {
        fetchPolicy = 'store-and-network';
      });
      it('should read data and send a network request', () => {
        const result = DataResource.readQuery({
          environment,
          query,
          fetchPolicy,
        });
        expect(fetchQuery).toBeCalled();
        expect(result.data).toMatchObject({
          node: {
            id: '4',
          },
        });
      });

      it('should generate a network request if data is missing for the query', () => {
        let thrown = false;
        try {
          DataResource.readQuery({
            environment,
            query: queryMissingData,
            fetchPolicy,
          });
        } catch (p) {
          thrown = true;
          expect(p).toBeInstanceOf(Promise);
        }
        expect(thrown).toBe(true);
        expect(fetchQuery).toBeCalled();
      });
    });

    describe('fetchPolicy: network-only', () => {
      beforeEach(() => {
        fetchPolicy = 'network-only';
      });
      it('should send a network request and throw a promise (always)', () => {
        let thrown = false;
        try {
          DataResource.readQuery({
            environment,
            query,
            fetchPolicy,
          });
        } catch (promise) {
          expect(promise).toBeInstanceOf(Promise);
          thrown = true;
        }
        expect(fetchQuery).toBeCalled();
        expect(thrown).toBe(true);
      });
    });

    describe('fetchPolicy: store-only', () => {
      beforeEach(() => {
        fetchPolicy = 'store-only';
      });
      it('should return data from the store (if available)', () => {
        const result = DataResource.readQuery({
          environment,
          query,
          fetchPolicy,
        });
        expect(fetchQuery).not.toBeCalled();
        expect(result.data).toMatchObject({
          node: {
            id: '4',
          },
        });
      });

      it('should throw a network request promise if data is missing (and we have pending request)', () => {
        (getPromiseForRequestInFlight: any).mockReturnValueOnce(
          Promise.resolve(),
        );
        let promiseThrown = false;
        try {
          DataResource.readQuery({
            environment,
            query: queryMissingData,
            fetchPolicy,
          });
        } catch (p) {
          promiseThrown = true;
          expect(p).toBeInstanceOf(Promise);
        }
        expect(promiseThrown).toBe(true);
        expect(fetchQuery).not.toBeCalled();
      });

      it('should throw an error if data is missing and there are no pending requests', () => {
        let errorThrown = false;
        try {
          DataResource.readQuery({
            environment,
            query: queryMissingData,
            fetchPolicy,
          });
        } catch (e) {
          errorThrown = true;
          expect(e).toBeInstanceOf(Error);
        }
        expect(fetchQuery).not.toBeCalled();
        expect(errorThrown).toBe(true);
      });
    });
  });

  describe('readFragmentSpec', () => {
    it('should read data for the fragment (if all data is available)', () => {
      const {UserQuery, UserFragment} = generateAndCompile(
        `
          fragment UserFragment on User {
            id
          }
          query UserQuery($id: ID!) {
            node(id: $id) {
              __typename
              ...UserFragment
            }
          }
        `,
      );
      const parentQuery = createOperationSelector(UserQuery, variables);

      const result = DataResource.readFragmentSpec({
        environment,
        variables,
        parentQuery,
        fragmentNodes: {
          user: getFragment(UserFragment),
        },
        fragmentRefs: {
          user: {
            __id: '4',
            __fragments: {
              UserFragment,
            },
          },
        },
      });
      invariant(result.user != null, 'Expected to be able to read fragment');
      expect((result.user.data: any).id).toBe('4');
    });

    it('should return null data if fragment reference is not provided', () => {
      const {UserQuery, UserFragment} = generateAndCompile(
        `
          fragment UserFragment on User {
            id
          }
          query UserQuery($id: ID!) {
            node(id: $id) {
              __typename
              ...UserFragment
            }
          }
        `,
      );
      const parentQuery = createOperationSelector(UserQuery, variables);

      const result = DataResource.readFragmentSpec({
        environment,
        variables,
        parentQuery,
        fragmentNodes: {
          user: getFragment(UserFragment),
        },
        fragmentRefs: {
          user: null,
        },
      });
      expect(result.user).toBe(null);
    });

    it('should throw a promise if reading missing data (if there is a pending network request)', () => {
      (getPromiseForRequestInFlight: any).mockReturnValueOnce(
        Promise.resolve(),
      );
      const {UserQuery, UserFragment} = generateAndCompile(
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
      );
      const parentQuery = createOperationSelector(UserQuery, variables);

      let thrown = false;
      try {
        DataResource.readFragmentSpec({
          environment,
          variables,
          parentQuery,
          fragmentNodes: {
            user: getFragment(UserFragment),
          },
          fragmentRefs: {
            user: {
              __id: '4',
              __fragments: {
                UserFragment,
              },
            },
          },
        });
      } catch (p) {
        expect(p).toBeInstanceOf(Promise);
        thrown = true;
      }
      expect(thrown).toBe(true);
    });

    it('should throw an error if data is missing and no pending requests', () => {
      const {UserQuery, UserFragment} = generateAndCompile(
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
      );
      const parentQuery = createOperationSelector(UserQuery, variables);
      let thrown = false;
      try {
        DataResource.readFragmentSpec({
          environment,
          variables,
          parentQuery,
          fragmentNodes: {
            user: getFragment(UserFragment),
          },
          fragmentRefs: {
            user: {
              __id: '4',
              __fragments: {
                UserFragment,
              },
            },
          },
        });
      } catch (p) {
        expect(p).toBeInstanceOf(Error);
        thrown = true;
      }
      expect(thrown).toBe(true);
    });
  });
});

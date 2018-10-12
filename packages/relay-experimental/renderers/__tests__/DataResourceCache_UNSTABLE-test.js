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

jest.mock('../../helpers/fetchQuery_UNSTABLE');

const {getCacheForEnvironment} = require('../DataResourceCache_UNSTABLE');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {createOperationSelector, getFragment} = require('relay-runtime');

const {
  fetchQuery_UNSTABLE,
  getPromiseForRequestInFlight_UNSTABLE,
} = require('../../helpers/fetchQuery_UNSTABLE');

describe('DataResourceCache', () => {
  let environment;
  let DataResourceCache;
  let fetchPolicy;
  let readPolicy;
  let query;
  let queryMissingData;
  const variables = {
    id: '4',
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    DataResourceCache = getCacheForEnvironment(environment);
    query = generateAndCompile(
      `query UserQuery($id: ID!) {
        node(id: $id) {
          ... on User {
            id
          }
        }
      }
    `,
    ).UserQuery;
    queryMissingData = generateAndCompile(
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
    const operationSelector = createOperationSelector(query, variables);
    environment.commitPayload(operationSelector, {
      node: {
        __typename: 'User',
        id: '4',
      },
    });
  });

  afterEach(() => {
    (fetchQuery_UNSTABLE: any).mockReset();
    (getPromiseForRequestInFlight_UNSTABLE: any).mockReset();
  });

  describe('readQuery', () => {
    describe('readPolicy: lazy', () => {
      beforeEach(() => {
        readPolicy = 'lazy';
      });
      describe('fetchPolicy: store-or-network', () => {
        beforeEach(() => {
          fetchPolicy = 'store-or-network';
        });

        it('should read data (if all data is available) without network request', () => {
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('throw a promise (fetch query) when some data is missing ', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(thrown).toBe(true);
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

            const result = DataResourceCache.readQuery({
              environment,
              query: UserQuery,
              variables,
              fetchPolicy,
              readPolicy,
            });
            expect(fetchQuery_UNSTABLE).not.toBeCalled();
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

          it('throw a promise (fetch query) when some data is missing ', () => {
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
            let thrown = false;
            try {
              DataResourceCache.readQuery({
                environment,
                query: UserQuery,
                variables,
                fetchPolicy,
                readPolicy,
              });
            } catch (promise) {
              expect(promise).toBeInstanceOf(Promise);
              thrown = true;
            }
            expect(fetchQuery_UNSTABLE).toBeCalled();
            expect(thrown).toBe(true);
          });
        });
      });

      describe('fetchPolicy: store-and-network', () => {
        beforeEach(() => {
          fetchPolicy = 'store-and-network';
        });

        it('should read data (if all data is available) and send a network request', () => {
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('should send a network request and throw a promise (if data is missing)', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(thrown).toBe(true);
        });
      });

      describe('fetchPolicy: network-only', () => {
        beforeEach(() => {
          fetchPolicy = 'network-only';
        });
        it('should send a network request and throw a promise', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(thrown).toBe(true);
        });

        it('should send a network request and throw a promise (if data is missing)', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(thrown).toBe(true);
        });
      });

      describe('fetchPolicy: store-only', () => {
        beforeEach(() => {
          fetchPolicy = 'store-only';
        });
        it('should return data from the store (if available)', () => {
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('should throw a promise if request is in progress', () => {
          DataResourceCache.preloadQuery({
            environment,
            query: queryMissingData,
            variables,
          });
          expect(fetchQuery_UNSTABLE).toBeCalled();
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(thrown).toBe(true);
        });

        it('should throw an error if data is missing and there is no pending requests', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(thrown).toBe(true);
        });
      });
    });

    describe('readPolicy: eager', () => {
      beforeEach(() => {
        readPolicy = 'eager';
      });

      describe('fetchPolicy: store-or-network', () => {
        beforeEach(() => {
          fetchPolicy = 'store-or-network';
        });

        it('should read data (if all data is available) without network request', () => {
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('should send a network request (and throw promise) if data is missing for the query', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (p) {
            thrown = true;
            expect(p).toBeInstanceOf(Promise);
          }
          expect(thrown).toBe(true);
          expect(fetchQuery_UNSTABLE).toBeCalled();
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

            const result = DataResourceCache.readQuery({
              environment,
              query: UserQuery,
              variables,
              fetchPolicy,
              readPolicy,
            });
            expect(fetchQuery_UNSTABLE).not.toBeCalled();
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
              // In this case a promise isn't thrown because the query
              // doesn't have any missing fields, so it can be read.
              // The fragment itself is the one that has a missing field, so
              // attempting to read the fragment should throw, but that's not
              // being tested here.
              const result = DataResourceCache.readQuery({
                environment,
                query: UserQuery,
                variables,
                fetchPolicy,
                readPolicy,
              });
              expect(fetchQuery_UNSTABLE).toBeCalled();
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
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('should generate a network request if data is missing for the query', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (p) {
            thrown = true;
            expect(p).toBeInstanceOf(Promise);
          }
          expect(thrown).toBe(true);
          expect(fetchQuery_UNSTABLE).toBeCalled();
        });
      });

      describe('fetchPolicy: network-only', () => {
        beforeEach(() => {
          fetchPolicy = 'network-only';
        });
        it('should send a network request and throw a promise (always)', () => {
          let thrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (promise) {
            expect(promise).toBeInstanceOf(Promise);
            thrown = true;
          }
          expect(fetchQuery_UNSTABLE).toBeCalled();
          expect(thrown).toBe(true);
        });
      });

      describe('fetchPolicy: store-only', () => {
        beforeEach(() => {
          fetchPolicy = 'store-only';
        });
        it('should return data from the store (if available)', () => {
          const result = DataResourceCache.readQuery({
            environment,
            query,
            variables,
            fetchPolicy,
            readPolicy,
          });
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(result.data).toMatchObject({
            node: {
              id: '4',
            },
          });
        });

        it('should throw a network request promise if data is missing (and we have pending request)', () => {
          (getPromiseForRequestInFlight_UNSTABLE: any).mockReturnValueOnce(
            Promise.resolve(),
          );
          let promiseThrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (p) {
            promiseThrown = true;
            expect(p).toBeInstanceOf(Promise);
          }
          expect(promiseThrown).toBe(true);
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
        });

        it('should throw an error if data is missing and there are no pending requests', () => {
          let errorThrown = false;
          try {
            DataResourceCache.readQuery({
              environment,
              query: queryMissingData,
              variables,
              fetchPolicy,
              readPolicy,
            });
          } catch (e) {
            errorThrown = true;
            expect(e).toBeInstanceOf(Error);
          }
          expect(fetchQuery_UNSTABLE).not.toBeCalled();
          expect(errorThrown).toBe(true);
        });
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

      const result = DataResourceCache.readFragmentSpec({
        environment,
        parentQuery: UserQuery,
        variables,
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
      expect((result.user.data: any).id).toBe('4');
    });

    it('should throw a promise if reading missing data (if there is a pending network request)', () => {
      (getPromiseForRequestInFlight_UNSTABLE: any).mockReturnValueOnce(
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
      let thrown = false;
      try {
        DataResourceCache.readFragmentSpec({
          environment,
          parentQuery: UserQuery,
          variables,
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
      let thrown = false;
      try {
        DataResourceCache.readFragmentSpec({
          environment,
          parentQuery: UserQuery,
          variables,
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

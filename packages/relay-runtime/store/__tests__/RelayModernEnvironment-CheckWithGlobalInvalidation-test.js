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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  getActorIdentifier,
  MultiActorEnvironment,
} = require('../../multi-actor-environment');
const {graphql, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {disallowWarnings, expectToWarn} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'check() with global invalidation',
  environmentType => {
    let environment;
    let operation;
    let ParentQuery;
    let source;
    let store;
    let complete;
    let error;
    let next;
    let callbacks;
    let dataSource;
    let fetch;

    describe(environmentType, () => {
      beforeEach(() => {
        ParentQuery = getRequest(graphql`
          query RelayModernEnvironmentCheckWithGlobalInvalidationTest1ParentQuery(
            $size: [Int]!
          ) {
            me {
              id
              name
              profilePicture(size: $size) {
                uri
              }
            }
          }
        `);
        operation = createOperationDescriptor(ParentQuery, {size: 32});

        complete = jest.fn();
        error = jest.fn();
        next = jest.fn();
        callbacks = {complete, error, next};
        fetch = (_query, _variables, _cacheConfig) => {
          return RelayObservable.create(sink => {
            dataSource = sink;
          });
        };
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                store,
              });
      });

      describe('when store is invalidated before query has ever been written to the store', () => {
        it('returns available after receiving query from the server', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: 'https://...',
                },
              },
            },
          };
          const fetchTime = Date.now();
          jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
          dataSource.next(payload);
          dataSource.complete();
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({
            status: 'available',
            fetchTime,
          });
        });

        it('returns missing if some data is missing after receiving query from the server', () => {
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: undefined,
                },
              },
            },
          };
          expectToWarn(
            'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
            () => {
              dataSource.next(payload);
            },
          );
          dataSource.complete();
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({status: 'missing'});
        });
      });

      describe('when store is invalidated after query has been written to the store', () => {
        it('returns stale even if full query is cached', () => {
          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: 'https://...',
                },
              },
            },
          };
          dataSource.next(payload);
          dataSource.complete();
          jest.runAllTimers();

          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          // Should return stale even if all data is cached since
          // store was invalidated after query completed
          expect(environment.check(operation)).toEqual({status: 'stale'});
        });

        it('returns stale if some data is missing', () => {
          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: undefined,
                },
              },
            },
          };
          expectToWarn(
            'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
            () => {
              dataSource.next(payload);
            },
          );
          dataSource.complete();
          jest.runAllTimers();

          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          expect(environment.check(operation)).toEqual({status: 'stale'});
        });
      });

      describe('when query is refetched after store is invalidated', () => {
        it('returns available if data is available after refetch', () => {
          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          let payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: 'https://...',
                },
              },
            },
          };
          dataSource.next(payload);
          dataSource.complete();
          jest.runAllTimers();

          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          // Expect data to not be available after invalidation
          expect(environment.check(operation)).toEqual({status: 'stale'});

          environment.execute({operation}).subscribe(callbacks);
          payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: 'https://...',
                },
              },
            },
          };
          const fetchTime = Date.now();
          jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
          dataSource.next(payload);
          dataSource.complete();
          jest.runAllTimers();

          // Expect data be available after refetch
          expect(environment.check(operation)).toEqual({
            status: 'available',
            fetchTime,
          });
        });

        it('returns missing if data is not available after refetch', () => {
          environment.retain(operation);
          environment.execute({operation}).subscribe(callbacks);
          let payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: undefined,
                },
              },
            },
          };
          expectToWarn(
            'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
            () => {
              dataSource.next(payload);
            },
          );
          dataSource.complete();
          jest.runAllTimers();

          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          // Expect data to not be available after invalidation
          expect(environment.check(operation)).toEqual({status: 'stale'});

          environment.execute({operation}).subscribe(callbacks);
          payload = {
            data: {
              me: {
                __typename: 'User',
                id: '4',
                name: 'Zuck',
                profilePicture: {
                  uri: undefined,
                },
              },
            },
          };
          expectToWarn(
            'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
            () => {
              dataSource.next(payload);
            },
          );
          dataSource.complete();
          jest.runAllTimers();

          expect(environment.check(operation)).toEqual({status: 'missing'});
        });
      });

      describe('when query has incremental payloads', () => {
        beforeEach(() => {
          ParentQuery = getRequest(graphql`
            query RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery(
              $size: [Int]!
            ) {
              me {
                id
                name
                ...RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment
                  @defer(label: "UserFragment")
              }
            }
          `);
          graphql`
            fragment RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment on User {
              profilePicture(size: $size) {
                uri
              }
            }
          `;
          operation = createOperationDescriptor(ParentQuery, {size: 32});
        });

        describe('when store is invalidated before query has been written to the store', () => {
          it('returns available after receiving payloads from the server', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            const fetchTime = Date.now();
            jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
            dataSource.next({
              data: {
                id: '1',
                __typename: 'User',
                profilePicture: {
                  uri: 'https://...',
                },
              },
              label:
                'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
              path: ['me'],
            });
            dataSource.complete();
            jest.runAllTimers();

            // Data for whole query should be available now
            expect(environment.check(operation)).toEqual({
              status: 'available',
              fetchTime,
            });
          });

          it('returns missing after receiving payloads from the server if data is still missing', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            expectToWarn(
              'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
              () => {
                dataSource.next({
                  data: {
                    id: '1',
                    __typename: 'User',
                    profilePicture: {
                      uri: undefined,
                    },
                  },
                  label:
                    'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
                  path: ['me'],
                });
              },
            );
            dataSource.complete();
            jest.runAllTimers();

            // Data is still missing
            expect(environment.check(operation)).toEqual({status: 'missing'});
          });
        });

        describe('when store is invalidated in between incremental payloads', () => {
          it('returns stale after receiving payloads from the server', () => {
            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            // Invalidate the store in between incremental payloads
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            dataSource.next({
              data: {
                id: '1',
                __typename: 'User',
                profilePicture: {
                  uri: 'https://...',
                },
              },
              label:
                'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
              path: ['me'],
            });
            dataSource.complete();
            jest.runAllTimers();

            // Should return false even if all data is cached since
            // store was invalidated after first payload was written
            expect(environment.check(operation)).toEqual({status: 'stale'});
          });

          it('returns stale after receiving payloads from the server and data is still missing', () => {
            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            // Invalidate the store in between incremental payloads
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            expectToWarn(
              'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
              () => {
                dataSource.next({
                  data: {
                    id: '1',
                    __typename: 'User',
                    profilePicture: {
                      uri: undefined,
                    },
                  },
                  label:
                    'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
                  path: ['me'],
                });
              },
            );
            dataSource.complete();
            jest.runAllTimers();

            expect(environment.check(operation)).toEqual({status: 'stale'});
          });
        });

        describe('when store is invalidated after all incremental payloads have been written to the store', () => {
          it('returns stale after receiving payloads from the server', () => {
            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            dataSource.next({
              data: {
                id: '1',
                __typename: 'User',
                profilePicture: {
                  uri: 'https://...',
                },
              },
              label:
                'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
              path: ['me'],
            });
            dataSource.complete();
            jest.runAllTimers();

            // Invalidate the store after query has completed
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            // Should return stale even if all data is cached since
            // store was invalidated after query completed
            expect(environment.check(operation)).toEqual({status: 'stale'});
          });

          it('returns stale after receiving payloads from the server and data is still missing', () => {
            environment.retain(operation);
            environment.execute({operation}).subscribe(callbacks);
            const payload = {
              data: {
                me: {
                  __typename: 'User',
                  id: '4',
                  name: 'Zuck',
                },
              },
            };
            dataSource.next(payload);
            jest.runAllTimers();
            next.mockClear();

            // Still missing incremental payload
            expect(environment.check(operation)).toEqual({status: 'missing'});

            expectToWarn(
              'RelayResponseNormalizer: Payload did not contain a value for field `uri: uri`. Check that you are parsing with the same query that was used to fetch the payload.',
              () => {
                dataSource.next({
                  data: {
                    id: '1',
                    __typename: 'User',
                    profilePicture: {
                      uri: undefined,
                    },
                  },
                  label:
                    'RelayModernEnvironmentCheckWithGlobalInvalidationTest2ParentQuery$defer$UserFragment',
                  path: ['me'],
                });
              },
            );
            dataSource.complete();
            jest.runAllTimers();

            // Invalidate the store after query has completed
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });

            expect(environment.check(operation)).toEqual({status: 'stale'});
          });
        });
      });
    });
  },
);

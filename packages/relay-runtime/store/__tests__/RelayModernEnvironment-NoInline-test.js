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

'use strict';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

const Query = getRequest(graphql`
  query RelayModernEnvironmentNoInlineTestQuery(
    $size: [Int]
    $preset: PhotoSize
  ) {
    me {
      ...RelayModernEnvironmentNoInlineTest_noInline
    }
  }
`);

const NoInlineFragment = getFragment(graphql`
  fragment RelayModernEnvironmentNoInlineTest_noInline on Actor @no_inline {
    ... on User {
      profile_picture: profilePicture2(
        size: $size
        preset: $preset
        fileExtension: PNG
      ) {
        uri
      }
    }
    ...RelayModernEnvironmentNoInlineTest_inner
      @arguments(cond: true, preset: $preset, fileExtension: JPG)
  }
`);

const InnerFragment = getFragment(graphql`
  fragment RelayModernEnvironmentNoInlineTest_inner on User
  @argumentDefinitions(
    cond: {type: "Boolean!"}
    preset: {type: "PhotoSize"}
    fileExtension: {type: "FileExtension"}
  ) {
    ... @include(if: $cond) {
      profile_picture_inner: profilePicture2(
        # accesses a global directly
        size: $size

        # accesses a local that is passed a global
        preset: $preset

        # accesses a local that is passed a constant
        fileExtension: $fileExtension
      ) {
        uri
      }
    }
  }
`);

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  '@no_inline',
  environmentType => {
    describe(environmentType, () => {
      let environment;
      let fetch;
      let store;
      let source;
      let subject;
      let operation;
      let callbacks;

      beforeEach(() => {
        fetch = jest.fn((_query, _variables, _cacheConfig) =>
          RelayObservable.create(sink => {
            subject = sink;
          }),
        );
        callbacks = {
          complete: jest.fn(),
          error: jest.fn(),
          next: jest.fn(),
        };
        source = RelayRecordSource.create();
        store = new RelayModernStore(source, {gcReleaseBufferSize: 0});
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
        operation = createOperationDescriptor(Query, {size: [1]});
      });

      it('executes and reads back results (fragment type matches)', () => {
        environment.execute({operation}).subscribe(callbacks);
        subject.next({
          data: {
            me: {
              __isActor: 'User',
              id: '1',
              profile_picture: {
                uri: 'https://profile.png',
              },
              profile_picture_inner: {
                uri: 'https://profile.jpg',
              },
            },
          },
          extensions: {
            is_final: true,
          },
        });
        expect(
          (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
        ).toEqual([]);
        expect(callbacks.next).toBeCalledTimes(1);
        expect(callbacks.complete).toBeCalledTimes(0);
        subject.complete();
        expect(callbacks.complete).toBeCalledTimes(1);

        const queryData = environment.lookup(operation.fragment);
        expect(queryData.data).toEqual({
          me: {
            __id: '1',
            __fragments: {
              [NoInlineFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });

        // noInline fragment data is present
        const selector = nullthrows(
          getSingularSelector(
            NoInlineFragment,
            (queryData.data: $FlowFixMe).me,
          ),
        );
        const selectorData = environment.lookup(selector);
        expect(selectorData.data).toEqual({
          __id: '1',
          __fragments: {
            [InnerFragment.name]: expect.anything(),
          },
          __fragmentOwner: operation.request,
          __isWithinUnmatchedTypeRefinement: false,
          profile_picture: {
            uri: 'https://profile.png',
          },
        });

        // Inner (normal, inlined) fragment data is present
        const innerSelector = nullthrows(
          getSingularSelector(InnerFragment, (selectorData.data: $FlowFixMe)),
        );
        const innerSelectorData = environment.lookup(innerSelector);
        expect(innerSelectorData.isMissingData).toBe(false);
        expect(innerSelectorData.data).toEqual({
          profile_picture_inner: {
            uri: 'https://profile.jpg',
          },
        });

        // available before a GC
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // available after GC if the query is retained
        const retain = environment.retain(operation);
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // missing after being freed plus a GC run
        retain.dispose();
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      it('executes and reads back results (fragment type does not match)', () => {
        environment.execute({operation}).subscribe(callbacks);
        subject.next({
          data: {
            me: {
              id: '1',
              // pretend that the object doesn't implement Actor
              // (so exclude __isActor and other Actor-conditional fields)
            },
          },
          extensions: {
            is_final: true,
          },
        });
        expect(
          (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
        ).toEqual([]);
        expect(callbacks.next).toBeCalledTimes(1);
        expect(callbacks.complete).toBeCalledTimes(0);
        subject.complete();
        expect(callbacks.complete).toBeCalledTimes(1);

        const queryData = environment.lookup(operation.fragment);
        expect(queryData.data).toEqual({
          me: {
            __id: '1',
            __fragments: {
              [NoInlineFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });

        // Data for the noInline fragment should still be read since reader always
        // attempts to read fragments even if the fragment type doesn't match the
        // record
        const selector = nullthrows(
          getSingularSelector(
            NoInlineFragment,
            (queryData.data: $FlowFixMe).me,
          ),
        );
        const selectorData = environment.lookup(selector);
        expect(selectorData.data).toEqual({
          __id: '1',
          __fragments: {
            [InnerFragment.name]: expect.anything(),
          },
          __fragmentOwner: operation.request,
          __isWithinUnmatchedTypeRefinement: true, // fragment type didn't match
        });

        // Inner data should be missing bc the type didn't match
        const innerSelector = nullthrows(
          getSingularSelector(InnerFragment, (selectorData.data: $FlowFixMe)),
        );
        const innerSelectorData = environment.lookup(innerSelector);
        expect(innerSelectorData.isMissingData).toBe(false);
        expect(innerSelectorData.data).toEqual({});

        // available before a GC
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // available after GC if the query is retained
        const retain = environment.retain(operation);
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          fetchTime: null,
          status: 'available',
        });

        // missing after being freed plus a GC run
        retain.dispose();
        (environment.getStore(): $FlowFixMe).scheduleGC();
        jest.runAllTimers();
        expect(environment.check(operation)).toEqual({
          status: 'missing',
        });
      });

      describe('with arguments', () => {
        it('executes and reads back results with no-inline fragments on the same level', () => {
          const QueryWithArgs = getRequest(graphql`
            query RelayModernEnvironmentNoInlineTestWithArgsQuery(
              $size: [Int]
              $preset: PhotoSize
            ) {
              me {
                ...RelayModernEnvironmentNoInlineTestWithArgs_noInline
                  @arguments(cond: true)
              }
              username(name: "Zuck") {
                ...RelayModernEnvironmentNoInlineTestWithArgs_noInline
                  @arguments(cond: false)
              }
            }
          `);
          const NoInlineFragmentWithArgs = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTestWithArgs_noInline on Actor
            @no_inline
            @argumentDefinitions(
              cond: {type: "Boolean!"}
              fileExtension: {type: "FileExtension!", defaultValue: JPG}
            ) {
              ... on User {
                profile_picture: profilePicture2(
                  size: $size
                  preset: $preset
                  fileExtension: PNG
                ) {
                  uri
                }
              }
              ...RelayModernEnvironmentNoInlineTest_inner
                @arguments(
                  cond: $cond
                  preset: $preset
                  fileExtension: $fileExtension
                )
            }
          `);
          operation = createOperationDescriptor(QueryWithArgs, {
            size: [1],
          });
          environment.execute({operation}).subscribe(callbacks);

          subject.next({
            data: {
              me: {
                __isActor: 'User',
                id: '1',
                profile_picture: {
                  uri: 'https://profile.png',
                },
                profile_picture_inner: {
                  uri: 'https://profile.jpg',
                },
              },
              username: {
                __typename: 'User',
                __isActor: 'User',
                id: '2',
                profile_picture: {
                  uri: 'https://profile.png',
                },
                profile_picture_inner: {
                  uri: 'https://profile.jpg',
                },
              },
            },
            extensions: {
              is_final: true,
            },
          });
          expect(
            (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
          ).toEqual([]);
          expect(callbacks.next).toBeCalledTimes(1);
          expect(callbacks.complete).toBeCalledTimes(0);
          subject.complete();
          expect(callbacks.complete).toBeCalledTimes(1);

          const queryData = environment.lookup(operation.fragment);
          expect(queryData.data).toEqual({
            me: {
              __id: '1',
              __fragments: {
                [NoInlineFragmentWithArgs.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
            username: {
              __id: '2',
              __fragments: {
                [NoInlineFragmentWithArgs.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
          });

          // noInline fragment data for `me` and `username` is present
          const selector = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithArgs,
              (queryData.data: $FlowFixMe).me,
            ),
          );
          const selectorData = environment.lookup(selector);
          expect(selectorData.data).toEqual({
            __id: '1',
            __fragments: {
              [InnerFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
            profile_picture: {
              uri: 'https://profile.png',
            },
          });

          const selectorUsername = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithArgs,
              (queryData.data: $FlowFixMe).username,
            ),
          );
          const selectorUsernameData = environment.lookup(selectorUsername);
          expect(selectorUsernameData.data).toEqual({
            __id: '2',
            __fragments: {
              [InnerFragment.name]: expect.anything(),
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
            profile_picture: {
              uri: 'https://profile.png',
            },
          });

          // Inner (normal, inlined) fragment data is present
          const innerSelector = nullthrows(
            getSingularSelector(InnerFragment, (selectorData.data: $FlowFixMe)),
          );
          const innerSelectorData = environment.lookup(innerSelector);
          expect(innerSelectorData.isMissingData).toBe(false);
          expect(innerSelectorData.data).toEqual({
            profile_picture_inner: {
              uri: 'https://profile.jpg',
            },
          });

          // The inner fragment data for `username` should be empty
          // because the `$cond` on `@include` is `false`
          const innerSelectorUsername = nullthrows(
            getSingularSelector(
              InnerFragment,
              (selectorUsernameData.data: $FlowFixMe),
            ),
          );
          const innerSelectorUsernameData = environment.lookup(
            innerSelectorUsername,
          );
          expect(innerSelectorUsernameData.isMissingData).toBe(false);
          expect(innerSelectorUsernameData.data).toEqual({});

          // available before a GC
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // available after GC if the query is retained
          const retain = environment.retain(operation);
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // missing after being freed plus a GC run
          retain.dispose();
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
        });

        it('executes and reads back results with nested no-inline fragments', () => {
          const QueryNested = getRequest(graphql`
            query RelayModernEnvironmentNoInlineTestNestedQuery(
              $global_cond: Boolean!
            ) {
              ...RelayModernEnvironmentNoInlineTest_nestedNoInlineParent
                @arguments(cond: true)
            }
          `);

          const NoInlineFragmentNestedParent = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTest_nestedNoInlineParent on Query
            @no_inline
            @argumentDefinitions(cond: {type: "Boolean!"}) {
              mark: username(name: "Mark") {
                ...RelayModernEnvironmentNoInlineTest_nestedNoInline
                  @arguments(cond: $global_cond)
              }
              zuck: username(name: "Zuck") {
                ...RelayModernEnvironmentNoInlineTest_nestedNoInline
                  @arguments(cond: false)
              }
              joe: username(name: "Joe") {
                ...RelayModernEnvironmentNoInlineTest_nestedNoInline
                  @arguments(cond: $cond)
              }
            }
          `);
          const NoInlineFragmentNested = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTest_nestedNoInline on User
            @no_inline
            @argumentDefinitions(cond: {type: "Boolean!"}) {
              ... @include(if: $cond) {
                name
              }
            }
          `);

          operation = createOperationDescriptor(QueryNested, {
            global_cond: false,
          });
          environment.execute({operation}).subscribe(callbacks);

          subject.next({
            data: {
              mark: {
                __typename: 'User',
                __isActor: 'User',
                id: '1',
                name: 'Zuck',
              },
              zuck: {
                __typename: 'User',
                __isActor: 'User',
                id: '2',
                name: 'Zuck',
              },
              joe: {
                __typename: 'User',
                __isActor: 'User',
                id: '3',
                name: 'Joe',
              },
            },
            extensions: {
              is_final: true,
            },
          });
          expect(
            (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
          ).toEqual([]);
          expect(callbacks.next).toBeCalledTimes(1);
          expect(callbacks.complete).toBeCalledTimes(0);
          subject.complete();
          expect(callbacks.complete).toBeCalledTimes(1);

          const queryData = environment.lookup(operation.fragment);
          const selector = nullthrows(
            getSingularSelector(
              NoInlineFragmentNestedParent,
              (queryData.data: $FlowFixMe),
            ),
          );
          const selectorData = environment.lookup(selector);
          expect(selectorData.data).toEqual({
            mark: {
              __id: '1',
              __fragments: {
                [NoInlineFragmentNested.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
            zuck: {
              __id: '2',
              __fragments: {
                [NoInlineFragmentNested.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
            joe: {
              __id: '3',
              __fragments: {
                [NoInlineFragmentNested.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
          });

          // $cond is set to $global_cond which is false
          const selector1 = nullthrows(
            getSingularSelector(
              NoInlineFragmentNested,
              // $FlowFixMe
              selectorData.data.mark,
            ),
          );
          const selector1Data = environment.lookup(selector1);
          expect(selector1Data.isMissingData).toBe(false);
          expect(selector1Data.data).toEqual({});

          // $cond is set to literal false
          const selector2 = nullthrows(
            getSingularSelector(
              NoInlineFragmentNested,
              // $FlowFixMe
              selectorData.data.zuck,
            ),
          );
          const selector2Data = environment.lookup(selector2);
          expect(selector2Data.isMissingData).toBe(false);
          expect(selector2Data.data).toEqual({});

          // $cond is set to local $cond which is true
          const selector3 = nullthrows(
            getSingularSelector(
              NoInlineFragmentNested,
              // $FlowFixMe
              selectorData.data.joe,
            ),
          );
          const selector3Data = environment.lookup(selector3);
          expect(selector3Data.isMissingData).toBe(false);
          expect(selector3Data.data).toEqual({name: 'Joe'});

          // available before a GC
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // available after GC if the query is retained
          const retain = environment.retain(operation);
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // missing after being freed plus a GC run
          retain.dispose();
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
        });
      });

      describe('with @stream and @defer', () => {
        it('executes and reads back results with stream', () => {
          const QueryWithStream = getRequest(graphql`
            query RelayModernEnvironmentNoInlineTestStreamQuery(
              $cond: Boolean!
            ) {
              node(id: "1") {
                ...RelayModernEnvironmentNoInlineTestStream_feedback
                  @arguments(cond: $cond)
              }
            }
          `);
          const NoInlineFragmentWithStream = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTestStream_feedback on Feedback
            @no_inline
            @argumentDefinitions(cond: {type: "Boolean!", defaultValue: true}) {
              actors @stream(label: "actors", initial_count: 0) {
                ... @include(if: $cond) {
                  name
                }
              }
            }
          `);
          operation = createOperationDescriptor(QueryWithStream, {
            cond: false,
          });
          environment.execute({operation}).subscribe(callbacks);

          subject.next({
            data: {
              node: {
                __typename: 'Feedback',
                id: '1',
                actors: [],
              },
            },
          });

          subject.next({
            data: {
              __typename: 'User',
              id: '2',
              name: 'Alice',
            },
            label:
              'RelayModernEnvironmentNoInlineTestStream_feedback$stream$actors',
            path: ['node', 'actors', 0],
          });
          expect(
            (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
          ).toEqual([]);
          expect(callbacks.next).toBeCalledTimes(2);
          expect(callbacks.complete).toBeCalledTimes(0);
          subject.complete();
          expect(callbacks.complete).toBeCalledTimes(1);

          const queryData = environment.lookup(operation.fragment);
          expect(queryData.data).toEqual({
            node: {
              __id: '1',
              __fragments: {
                [NoInlineFragmentWithStream.name]: expect.anything(),
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
          });

          const selector = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithStream,
              (queryData.data: $FlowFixMe).node,
            ),
          );
          const selectorData = environment.lookup(selector);
          // `name` should not be normalized because $cond is false
          expect(selectorData.data).toEqual({
            actors: [{}],
          });

          // available before a GC
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // available after GC if the query is retained
          const retain = environment.retain(operation);
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // missing after being freed plus a GC run
          retain.dispose();
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });

          // Set cond to true and the name should be normalized
          operation = createOperationDescriptor(QueryWithStream, {
            cond: true,
          });
          environment.execute({operation}).subscribe(callbacks);
          subject.next({
            data: {
              node: {
                __typename: 'Feedback',
                id: '1',
                actors: [],
              },
            },
          });
          subject.next({
            data: {
              __typename: 'User',
              id: '2',
              name: 'Alice',
            },
            label:
              'RelayModernEnvironmentNoInlineTestStream_feedback$stream$actors',
            path: ['node', 'actors', 0],
          });
          const queryData2 = environment.lookup(operation.fragment);
          const selector2 = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithStream,
              (queryData2.data: $FlowFixMe).node,
            ),
          );
          const selectorData2 = environment.lookup(selector2);
          expect(selectorData2.data).toEqual({
            actors: [{name: 'Alice'}],
          });
        });

        it('executes and reads back results with defer and stream', () => {
          const QueryWithDeferredStream = getRequest(graphql`
            query RelayModernEnvironmentNoInlineTestDeferredStreamQuery(
              $cond: Boolean!
              $enableStream: Boolean
            ) {
              viewer {
                ...RelayModernEnvironmentNoInlineTestDeferredStreamParent
                  @arguments(cond: $cond, enableStream: $enableStream)
              }
            }
          `);
          const NoInlineFragmentWithDeferredStreamParent = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTestDeferredStreamParent on Viewer
            @argumentDefinitions(
              cond: {type: "Boolean!"}
              enableStream: {type: "Boolean"}
            ) {
              ...RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed
                @arguments(cond: $cond, enableStream: $enableStream)
                @defer(label: "FeedFragment")
            }
          `);
          const NoInlineFragmentWithDeferredStream = getFragment(graphql`
            fragment RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed on Viewer
            @no_inline
            @argumentDefinitions(
              cond: {type: "Boolean!", defaultValue: true}
              enableStream: {type: "Boolean", defaultValue: false}
            ) {
              newsFeed(first: 2) {
                edges
                  @stream(
                    label: "newsFeed"
                    if: $enableStream
                    initial_count: 0
                  ) {
                  node {
                    ... @include(if: $cond) {
                      feedback {
                        author {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `);
          operation = createOperationDescriptor(QueryWithDeferredStream, {
            cond: false,
            enableStream: true,
          });
          environment.execute({operation}).subscribe(callbacks);

          subject.next({
            data: {
              viewer: {
                __typename: 'Viewer',
              },
            },
          });

          subject.next({
            data: {
              newsFeed: {
                edges: [],
              },
            },
            label:
              'RelayModernEnvironmentNoInlineTestDeferredStreamParent$defer$FeedFragment',
            path: ['viewer'],
          });

          subject.next({
            data: {
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  author: {
                    id: 'actor-1',
                    __typename: 'User',
                    name: 'Alice',
                  },
                },
              },
            },
            label:
              'RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$stream$newsFeed',
            path: ['viewer', 'newsFeed', 'edges', 0],
          });

          expect(
            (callbacks.error: $FlowFixMe).mock.calls.map(call => call[0].stack),
          ).toEqual([]);
          expect(callbacks.next).toBeCalledTimes(3);
          expect(callbacks.complete).toBeCalledTimes(0);
          subject.complete();
          expect(callbacks.complete).toBeCalledTimes(1);

          const queryData = environment.lookup(operation.fragment);
          expect(queryData.data).toEqual({
            viewer: {
              __id: 'client:root:viewer',
              __fragments: {
                [NoInlineFragmentWithDeferredStreamParent.name]: {
                  cond: false,
                  enableStream: true,
                },
              },
              __fragmentOwner: operation.request,
              __isWithinUnmatchedTypeRefinement: false,
            },
          });

          const parentSelector = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithDeferredStreamParent,
              (queryData.data: $FlowFixMe).viewer,
            ),
          );
          const parentSelectorData = environment.lookup(parentSelector);
          const selector = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithDeferredStream,
              (parentSelectorData.data: $FlowFixMe),
            ),
          );
          const selectorData = environment.lookup(selector);
          // `feedback` should not be normalized because $cond is false
          expect(selectorData.data).toEqual({
            newsFeed: {edges: [{node: {}}]},
          });

          // available before a GC
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // available after GC if the query is retained
          const retain = environment.retain(operation);
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // missing after being freed plus a GC run
          retain.dispose();
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });

          // normalize `feedback` and disable stream
          operation = createOperationDescriptor(QueryWithDeferredStream, {
            cond: true,
            enableStream: false,
          });
          environment.execute({operation}).subscribe(callbacks);
          subject.next({
            data: {
              viewer: {
                __typename: 'Viewer',
              },
            },
          });
          subject.next({
            data: {
              newsFeed: {
                edges: [
                  {
                    node: {
                      __typename: 'Story',
                      id: '1',
                      feedback: {
                        id: 'feedback-1',
                        author: {
                          id: 'actor-1',
                          __typename: 'User',
                          name: 'Alice',
                        },
                      },
                    },
                  },
                ],
              },
            },
            label:
              'RelayModernEnvironmentNoInlineTestDeferredStreamParent$defer$FeedFragment',
            path: ['viewer'],
          });
          // The following data should not be normalized because stream is disabled
          subject.next({
            data: {
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  author: {
                    id: 'actor-2',
                    __typename: 'User',
                    name: 'Bob',
                  },
                },
              },
            },
            label:
              'RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$stream$newsFeed',
            path: ['viewer', 'newsFeed', 'edges', 1],
          });
          const queryData2 = environment.lookup(operation.fragment);
          const parentSelector2 = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithDeferredStreamParent,
              (queryData2.data: $FlowFixMe).viewer,
            ),
          );
          const parentSelectorData2 = environment.lookup(parentSelector2);
          const selector2 = nullthrows(
            getSingularSelector(
              NoInlineFragmentWithDeferredStream,
              (parentSelectorData2.data: $FlowFixMe),
            ),
          );
          const selectorData2 = environment.lookup(selector2);
          expect(selectorData2.data).toEqual({
            newsFeed: {
              edges: [{node: {feedback: {author: {name: 'Alice'}}}}],
            },
          });
        });
      });

      describe('with @module', () => {
        let resolveFragment;
        let operationLoader;
        let fragmentToReturn;

        const QueryWithModule = getRequest(graphql`
          query RelayModernEnvironmentNoInlineTestModuleQuery($cond: Boolean!) {
            node(id: "1") {
              ... on User {
                nameRenderer {
                  ...RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name
                    @module(name: "MarkdownUserNameRenderer.react")
                    @arguments(cond: $cond)
                }
              }
            }
          }
        `);
        const NoInlineFragmentMarkdownUserNameRenderer = getFragment(graphql`
          fragment RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name on MarkdownUserNameRenderer
          @argumentDefinitions(cond: {type: "Boolean!"}) {
            markdown @skip(if: $cond)
            data @include(if: $cond) {
              markup
            }
          }
        `);
        const markdownRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization.graphql');

        beforeEach(() => {
          fragmentToReturn = null;
          operationLoader = {
            load: jest.fn(moduleName => {
              return new Promise(resolve => {
                resolveFragment = resolve;
              });
            }),
            get: jest.fn(() => fragmentToReturn),
          };
          store = new RelayModernStore(source, {
            gcReleaseBufferSize: 0,
            operationLoader,
          });
          environment = new RelayModernEnvironment({
            network: RelayNetwork.create(fetch),
            store,
            operationLoader,
          });
        });

        it('executes and reads back results for the MarkdownUserNameRenderer', () => {
          operation = createOperationDescriptor(QueryWithModule, {
            cond: true,
          });
          environment.execute({operation}).subscribe(callbacks);

          subject.next({
            data: {
              node: {
                id: '1',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentNoInlineTestModuleQuery:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentNoInlineTestModuleQuery:
                    'RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    id: 'data-1',
                    markup: '<markup/>',
                  },
                },
              },
            },
          });
          expect(callbacks.complete).toBeCalledTimes(0);
          expect(callbacks.error).toBeCalledTimes(0);
          expect(callbacks.next).toBeCalledTimes(1);
          expect(operationLoader.load).toBeCalledTimes(1);

          const queryData = environment.lookup(operation.fragment);
          expect(queryData.data).toEqual({
            node: {
              nameRenderer: {
                __id: 'client:1:nameRenderer',
                __fragments: {
                  [NoInlineFragmentMarkdownUserNameRenderer.name]: {
                    cond: true,
                  },
                },
                __fragmentOwner: operation.request,
                __isWithinUnmatchedTypeRefinement: false,
                __fragmentPropName: 'name',
                __module_component: 'MarkdownUserNameRenderer.react',
              },
            },
          });

          const selector = nullthrows(
            getSingularSelector(
              NoInlineFragmentMarkdownUserNameRenderer,
              (queryData.data: $FlowFixMe).node.nameRenderer,
            ),
          );
          const initialSelectorData = environment.lookup(selector);
          expect(initialSelectorData.isMissingData).toBe(true);
          expect(initialSelectorData.data).toEqual({
            markdown: undefined,
          });

          // Include `markup` and skip `markdown` becasue $cond is true
          resolveFragment(markdownRendererNormalizationFragment);
          jest.runAllTimers();
          const selectorData = environment.lookup(selector);
          expect(selectorData.data).toEqual({
            data: {
              markup: '<markup/>',
            },
          });
          expect(selectorData.isMissingData).toBe(false);

          // available before a GC
          fragmentToReturn = markdownRendererNormalizationFragment;
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // `markdown` field is not normalized
          const operationCondTrue = createOperationDescriptor(QueryWithModule, {
            cond: false,
          });
          expect(environment.check(operationCondTrue)).toEqual({
            status: 'missing',
          });

          // available after GC if the query is retained
          const retain = environment.retain(operation);
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            fetchTime: null,
            status: 'available',
          });

          // missing after being freed plus a GC run
          retain.dispose();
          (environment.getStore(): $FlowFixMe).scheduleGC();
          jest.runAllTimers();
          expect(environment.check(operation)).toEqual({
            status: 'missing',
          });
        });
      });
    });
  },
);

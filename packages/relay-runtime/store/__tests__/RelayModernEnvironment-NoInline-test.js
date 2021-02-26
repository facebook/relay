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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {graphql, getFragment, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');

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

describe('@no_inline', () => {
  let environment;
  let fetch;
  let store;
  let source;
  let subject;
  let operation;
  let callbacks;

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = true;
  });
  afterEach(() => {
    RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT = false;
  });

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
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create((fetch: $FlowFixMe)),
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
      getSingularSelector(NoInlineFragment, (queryData.data: $FlowFixMe).me),
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
      getSingularSelector(NoInlineFragment, (queryData.data: $FlowFixMe).me),
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
});

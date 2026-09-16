/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {LiveState} from '../RelayStoreTypes';

const RelayModernRecord = require('../RelayModernRecord');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');

// Private to LiveResolverCache; duplicated here so the test exercises the same
// record shape the cache writes.
const RELAY_RESOLVER_LIVE_STATE_VALUE = '__resolverLiveStateValue';

const LIVE_STATE_ID = 'client:live-state-1';

function storeWithLiveState(liveState: LiveState<unknown>) {
  const record = RelayModernRecord.create(LIVE_STATE_ID, 'LiveResolver');
  RelayModernRecord.setValue(
    record,
    RELAY_RESOLVER_LIVE_STATE_VALUE,
    liveState,
  );
  const source = RelayRecordSource.create();
  source.set(LIVE_STATE_ID, record);
  return new RelayModernStore(source);
}

function displayNameOfPromiseFor(liveState: LiveState<unknown>): unknown {
  const store = storeWithLiveState(liveState);
  // $FlowFixMe[prop-missing] Expando to annotate Promises.
  return store.getLiveResolverPromise(LIVE_STATE_ID).displayName;
}

describe('getSuspenseDisplayName', () => {
  it('names the suspense promise with what the LiveState reports', () => {
    expect(
      displayNameOfPromiseFor({
        read: () => null,
        subscribe: () => () => {},
        getSuspenseDisplayName: () => 'RelayEverywhere(mySelector)',
      }),
    ).toBe('RelayEverywhere(mySelector)');
  });

  it('is opt-in: a LiveState that does not implement it leaves the promise unnamed', () => {
    expect(
      displayNameOfPromiseFor({
        read: () => null,
        subscribe: () => () => {},
      }),
    ).toBe(undefined);
  });

  it('tolerates a LiveState that returns no name for the current value', () => {
    // Assigned straight through, so the promise carries `null` rather than
    // being left unset. Consumers test for a string, so the two are the same
    // to them.
    expect(
      displayNameOfPromiseFor({
        read: () => null,
        subscribe: () => () => {},
        getSuspenseDisplayName: () => null,
      }),
    ).toBe(null);
  });

  it('a throwing implementation leaves the promise unnamed rather than propagating', () => {
    const liveState = {
      read: () => null,
      subscribe: () => () => {},
      getSuspenseDisplayName: () => {
        throw new Error('producer bug');
      },
    };
    const store = storeWithLiveState(liveState);

    expect(() => store.getLiveResolverPromise(LIVE_STATE_ID)).not.toThrow();
    expect(displayNameOfPromiseFor(liveState)).toBe(undefined);
  });

  it('still subscribes for resolution when it supplies a name', () => {
    let notify = () => {};
    const store = storeWithLiveState({
      read: () => null,
      subscribe: cb => {
        notify = cb;
        return () => {};
      },
      getSuspenseDisplayName: () => 'Named',
    });

    const promise = store.getLiveResolverPromise(LIVE_STATE_ID);
    notify();
    return promise;
  });
});

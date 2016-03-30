/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest.dontMock('RelayFragmentTracker');

require('configureForRelayOSS');

const RelayFragmentTracker = require('RelayFragmentTracker');

const ID1 = 'id1';
const ID2 = 'id2';
const HASH1 = 'hash1';
const HASH2 = 'hash2';

describe('RelayFragmentTracker', () => {
  let tracker;

  beforeEach(() => {
    jest.resetModuleRegistry();

    tracker = new RelayFragmentTracker();
  });

  it('tracks nothing initially', () => {
    expect(tracker.isTracked(ID1, HASH1)).toBe(false);
  });

  it('tracks a key', () => {
    tracker.track(ID1, HASH1);
    expect(tracker.isTracked(ID1, HASH1)).toBe(true);
    expect(tracker.isTracked(ID2, HASH1)).toBe(false);
    expect(tracker.isTracked(ID1, HASH2)).toBe(false);
  });

  it('tracks multiple keys', () => {
    tracker.track(ID1, HASH1);
    tracker.track(ID1, HASH2);
    expect(tracker.isTracked(ID1, HASH1)).toBe(true);
    expect(tracker.isTracked(ID1, HASH2)).toBe(true);
  });

  it('untracks records by dataID', () => {
    tracker.track(ID1, HASH1);
    tracker.track(ID2, HASH1);
    expect(tracker.isTracked(ID1, HASH1)).toBe(true);
    tracker.untrack(ID1);
    expect(tracker.isTracked(ID1, HASH1)).toBe(false);
    expect(tracker.isTracked(ID2, HASH1)).toBe(true);
  });
});

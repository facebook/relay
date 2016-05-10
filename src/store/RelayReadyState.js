/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayReadyState
 * @flow
 */

'use strict';

import type {
  ReadyState,
  ReadyStateChangeCallback,
} from 'RelayTypes';

const resolveImmediate = require('resolveImmediate');
const warning = require('warning');

type PartialReadyState = {
  aborted?: boolean;
  done?: boolean;
  error?: Error;
  ready?: boolean;
  stale?: boolean;
};

/**
 * @internal
 */
class RelayReadyState {
  _onReadyStateChange: ReadyStateChangeCallback;
  _readyState: ReadyState;
  _scheduled: boolean;

  constructor(onReadyStateChange: ReadyStateChangeCallback) {
    this._onReadyStateChange = onReadyStateChange;
    this._readyState = {
      aborted: false,
      done: false,
      error: null,
      ready: false,
      stale: false,
    };
    this._scheduled = false;
  }

  update(nextReadyState: PartialReadyState): void {
    const prevReadyState = this._readyState;
    if (prevReadyState.aborted) {
      return;
    }
    if (prevReadyState.done || prevReadyState.error) {
      if (nextReadyState.stale) {
        if (prevReadyState.error) {
          this._mergeState(nextReadyState);
        }
        // Do nothing if stale data comes after server data.
      } else if (!nextReadyState.aborted) {
        warning(
          false,
          'RelayReadyState: Invalid state change from `%s` to `%s`.',
          JSON.stringify(prevReadyState),
          JSON.stringify(nextReadyState)
        );
      }
      return;
    }
    this._mergeState(nextReadyState);
  }

  _mergeState(nextReadyState: PartialReadyState): void {
    this._readyState = {
      ...this._readyState,
      ...nextReadyState,
    };
    if (this._scheduled) {
      return;
    }
    this._scheduled = true;
    resolveImmediate(() => {
      this._scheduled = false;
      this._onReadyStateChange(this._readyState);
    });
  }
}

module.exports = RelayReadyState;

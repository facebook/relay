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

const resolveImmediate = require('resolveImmediate');
const warning = require('warning');

import type {
  ReadyState,
  ReadyStateChangeCallback,
  ReadyStateEvent,
} from 'RelayTypes';

type PartialReadyState = {
  aborted?: boolean,
  done?: boolean,
  error?: Error,
  events?: Array<ReadyStateEvent>,
  ready?: boolean,
  stale?: boolean,
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
      events: [],
      ready: false,
      stale: false,
    };
    this._scheduled = false;
  }

  update(
    nextReadyState: PartialReadyState,
    newEvents?: Array<ReadyStateEvent>,
  ): void {
    const prevReadyState = this._readyState;
    if (prevReadyState.aborted) {
      return;
    }
    if (prevReadyState.done || prevReadyState.error) {
      if (nextReadyState.stale) {
        if (prevReadyState.error) {
          this._mergeState(nextReadyState, newEvents);
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
    this._mergeState(nextReadyState, newEvents);
  }

  _mergeState(
    nextReadyState: PartialReadyState,
    newEvents: ?Array<ReadyStateEvent>
  ): void {
    this._readyState = {
      ...this._readyState,
      ...nextReadyState,
      events: newEvents && newEvents.length ?
        [...this._readyState.events, ...newEvents] :
        this._readyState.events,
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

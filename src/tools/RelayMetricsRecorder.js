/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMetricsRecorder
 * @typechecks
 * @flow
 */

'use strict';

var GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
var RelayProfiler = require('RelayProfiler');

var checkRelayQueryData = require('checkRelayQueryData');
var diffRelayQuery = require('diffRelayQuery');
var flattenRelayQuery = require('flattenRelayQuery');
var invariant = require('invariant');
var getRelayQueries = require('getRelayQueries');
var performanceNow = require('performanceNow');
var printRelayQuery = require('printRelayQuery');
var readRelayQueryData = require('readRelayQueryData');
var splitDeferredRelayQueries = require('splitDeferredRelayQueries');
var subtractRelayQuery = require('subtractRelayQuery');
var writeRelayQueryPayload = require('writeRelayQueryPayload');
var writeRelayUpdatePayload = require('writeRelayUpdatePayload');

// Singleton methods:
var INSTRUMENTED_METHODS = [
  GraphQLStoreChangeEmitter.addListenerForIDs,
  GraphQLStoreChangeEmitter.broadcastChangeForID,
  GraphQLStoreChangeEmitter._processSubscribers,
  GraphQLStoreQueryResolver.prototype.resolve,
  checkRelayQueryData,
  diffRelayQuery,
  flattenRelayQuery,
  getRelayQueries,
  printRelayQuery,
  readRelayQueryData,
  splitDeferredRelayQueries,
  subtractRelayQuery,
  writeRelayQueryPayload,
  writeRelayUpdatePayload,
];

// Non-singleton (e.g. `prototype`) methods:
var INSTRUMENTED_AGGREGATE_METHODS = [
  'RelayContainer.prototype.componentWillMount',
  'RelayContainer.prototype.componentWillReceiveProps',
  'RelayContainer.prototype.shouldComponentUpdate',
];

// Runtime "profiles" registered with `RelayProfiler.profile()`:
var INSTRUMENTED_PROFILES = [
  'RelayContainer.handleDeferredFailure',
  'RelayContainer.handleDeferredSuccess',
  'RelayContainer.handleFragmentDataUpdate',
  'RelayContainer.update',
];

var measurementDefaults = {
  aggregateTime: 0,
  callCount: 0,
};

type Measurement = {
  aggregateTime: number;
  callCount: number;
};
type Metrics = {
  fetchTime: number;
  measurements: {[name: string]: Measurement};
  recordingTime: number;
  totalTime: number;
};

/**
 * Collects timing information from key Relay subsystems. For metrics on all
 * functions, call `RelayProfiler.setEnableProfile(true)` on app initialization.
 *
 * Example:
 *
 * ```
 * var recorder = new RelayMetricsRecorder();
 * recorder.start();
 * // ... do work ...
 * recorder.stop();
 * var metrics = recorder.getMetrics();
 * ```
 *
 * Metrics:
 * - `fetchTime`: the total time spent fetching data from the network.
 * - `recordingTime`: the total time spent recording (between calls to `start()`
 *   and `stop()`).
 * - `totalTime`: the total time spent inside profiled Relay functions.
 * - `measurements`: an object mapping names of profiled functions to profiling
 *   data including:
 *   - `aggregateTime`: total time spent in the method.
 *   - `callCount`: number of times the method was called.
 */
class RelayMetricsRecorder {
  _fetchTime: number;
  _isEnabled: boolean;
  _measurements: {[key: string]: Measurement};
  _profileStack: Array<number>;
  _recordingStartTime: number;
  _recordingTotalTime: number;
  _startTimesStack: Array<number>;

  constructor() {
    this._fetchTime = 0;
    this._isEnabled = false;
    this._measurements = {};
    this._profileStack = [];
    this._recordingStartTime = 0;
    this._recordingTotalTime = 0;
    this._startTimesStack = [];

    (this: any)._measure = this._measure.bind(this);
    (this: any)._profileFetchRelayQuery =
      this._profileFetchRelayQuery.bind(this);
    (this: any)._profileInstrumentedMethod =
      this._profileInstrumentedMethod.bind(this);
    (this: any)._startMeasurement = this._startMeasurement.bind(this);
    (this: any)._stopMeasurement = this._stopMeasurement.bind(this);
  }

  start(): void {
    invariant(
      __DEV__,
      'RelayMetricsRecorder: Recording metrics requires `__DEV__`.'
    );
    if (this._isEnabled) {
      return;
    }
    this._recordingStartTime = performanceNow();
    this._isEnabled = true;
    this._profileStack = [0];
    this._startTimesStack = [0];

    INSTRUMENTED_METHODS.forEach(method => {
      invariant(
        method && method.attachHandler,
        'RelayMetricsRecorder: Attempted to measure an invalid method.'
      );
      method.attachHandler(this._measure);
    });
    INSTRUMENTED_AGGREGATE_METHODS.forEach(name => {
      RelayProfiler.attachAggregateHandler(name, this._measure);
    });
    INSTRUMENTED_PROFILES.forEach(name => {
      RelayProfiler.attachProfileHandler(name, this._profileInstrumentedMethod);
    });

    RelayProfiler.attachProfileHandler(
      'fetchRelayQuery',
      this._profileFetchRelayQuery
    );
  }

  stop(): void {
    if (!this._isEnabled) {
      return;
    }
    this._isEnabled = false;
    this._recordingTotalTime += performanceNow() - this._recordingStartTime;

    INSTRUMENTED_METHODS.forEach(method => {
      (method: any).detachHandler(this._measure);
    });
    INSTRUMENTED_AGGREGATE_METHODS.forEach(name => {
      RelayProfiler.detachAggregateHandler(name, this._measure);
    });
    INSTRUMENTED_PROFILES.forEach(name => {
      RelayProfiler.detachProfileHandler(name, this._profileInstrumentedMethod);
    });

    RelayProfiler.detachProfileHandler(
      'fetchRelayQuery',
      this._profileFetchRelayQuery
    );
  }

  getMetrics(): Metrics {
    var {_measurements} = this;
    var totalTime = 0;
    var sortedMeasurements = {};
    Object.keys(_measurements)
      .sort((a, b) => {
        return _measurements[b].aggregateTime - _measurements[a].aggregateTime;
      })
      .forEach(name => {
        totalTime += _measurements[name].aggregateTime;
        sortedMeasurements[name] = _measurements[name];
      });

    return {
      fetchTime: this._fetchTime,
      measurements: sortedMeasurements,
      recordingTime: this._recordingTotalTime,
      totalTime,
    };
  }

  _measure(name: string, callback: Function): void {
    this._startMeasurement(name);
    callback();
    this._stopMeasurement(name);
  }

  _profileFetchRelayQuery(): () => void {
    var startTime = performanceNow();
    return () => {
      this._fetchTime += performanceNow() - startTime;
    };
  }

  _profileInstrumentedMethod(name: string): () => void {
    this._startMeasurement(name);
    return () => this._stopMeasurement(name);
  }

  _startMeasurement(name: string): void {
    this._measurements[name] =
      this._measurements[name] || {...measurementDefaults};
    this._profileStack.unshift(0);
    this._startTimesStack.unshift(performanceNow());
  }

  _stopMeasurement(name: string): void {
    var innerTime = this._profileStack.shift();
    var start = this._startTimesStack.shift();
    var totalTime = performanceNow() - start;

    this._measurements[name].aggregateTime += totalTime - innerTime;
    this._measurements[name].callCount++;

    this._profileStack[0] += totalTime;
  }
}

module.exports = RelayMetricsRecorder;

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

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');

const buildRQL = require('buildRQL');
const checkRelayQueryData = require('checkRelayQueryData');
const diffRelayQuery = require('diffRelayQuery');
const flattenRelayQuery = require('flattenRelayQuery');
const invariant = require('invariant');
const getRelayQueries = require('getRelayQueries');
const performanceNow = require('performanceNow');
const printRelayQuery = require('printRelayQuery');
const readRelayQueryData = require('readRelayQueryData');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');
const subtractRelayQuery = require('subtractRelayQuery');
const writeRelayQueryPayload = require('writeRelayQueryPayload');
const writeRelayUpdatePayload = require('writeRelayUpdatePayload');

// Singleton methods:
const INSTRUMENTED_METHODS = [
  buildRQL.Fragment,
  buildRQL.Query,
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
  RelayQuery.Field.prototype.getStorageKey,
  RelayQuery.Field.prototype.getSerializationKey,
  RelayQuery.Node.prototype.clone,
  RelayQuery.Node.prototype.equals,
  RelayQuery.Node.prototype.getChildren,
  RelayQuery.Node.prototype.getDirectives,
  RelayQuery.Node.prototype.hasDeferredDescendant,
  RelayQuery.Node.prototype.getFieldByStorageKey,
  RelayNetworkLayer.sendMutation,
  RelayNetworkLayer.sendQueries,
];

// There is no static RelayContainer.prototype instance, so methods are
// profiled by name:
const INSTRUMENTED_AGGREGATE_METHODS = [
  'RelayContainer.prototype.componentWillMount',
  'RelayContainer.prototype.componentWillReceiveProps',
  'RelayContainer.prototype.shouldComponentUpdate',
];

// Runtime "profiles" registered with `RelayProfiler.profile()`:
const INSTRUMENTED_PROFILES = [
  'fetchRelayQuery',
  'fetchRelayQuery.query',
  'GraphQLQueryRunner.primeCache',
  'GraphQLQueryRunner.forceFetch',
  'RelayContainer.handleDeferredFailure',
  'RelayContainer.handleDeferredSuccess',
  'RelayContainer.handleFragmentDataUpdate',
  'RelayContainer.update',
  'RelayStoreData.runWithDiskCache',
  'RelayStoreData.readFromDiskCache',
  'RelayStoreData.handleQueryPayload',
  'RelayStoreData.handleUpdatePayload',
];

const measurementDefaults = {
  aggregateTime: 0,
  callCount: 0,
};

type Measurement = {
  aggregateTime: number;
  callCount: number;
};
type Metrics = {
  measurements: {[name: string]: Measurement};
  profiles: Array<ProfileEvent>;
  recordingTime: number;
  totalTime: number;
};
type ProfileEvent = {
  endTime: number;
  name: string;
  startTime: number;
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
 * - `recordingTime`: the total time spent recording (between calls to `start()`
 *   and `stop()`).
 * - `totalTime`: the total time spent inside profiled Relay functions.
 * - `measurements`: an object mapping names of profiled functions to profiling
 *   data including:
 *   - `aggregateTime`: total time spent in the method.
 *   - `callCount`: number of times the method was called.
 */
class RelayMetricsRecorder {
  _isEnabled: boolean;
  _measurements: {[key: string]: Measurement};
  _profiles: Array<ProfileEvent>;
  _profileStack: Array<number>;
  _recordingStartTime: number;
  _recordingTotalTime: number;
  _startTimesStack: Array<number>;

  constructor() {
    this._isEnabled = false;
    this._measurements = {};
    this._profiles = [];
    this._profileStack = [];
    this._recordingStartTime = 0;
    this._recordingTotalTime = 0;
    this._startTimesStack = [];

    (this: any)._measure = this._measure.bind(this);
    (this: any)._instrumentProfile = this._instrumentProfile.bind(this);
    (this: any)._startMeasurement = this._startMeasurement.bind(this);
    (this: any)._stopMeasurement = this._stopMeasurement.bind(this);
  }

  start(): void {
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
      RelayProfiler.attachProfileHandler(name, this._instrumentProfile);
    });
  }

  stop(): void {
    if (!this._isEnabled) {
      return;
    }
    this._recordingTotalTime += performanceNow() - this._recordingStartTime;
    this._isEnabled = false;

    INSTRUMENTED_METHODS.forEach(method => {
      (method: any).detachHandler(this._measure);
    });
    INSTRUMENTED_AGGREGATE_METHODS.forEach(name => {
      RelayProfiler.detachAggregateHandler(name, this._measure);
    });
    INSTRUMENTED_PROFILES.forEach(name => {
      RelayProfiler.detachProfileHandler(name, this._instrumentProfile);
    });
  }

  getMetrics(): Metrics {
    const {_measurements} = this;
    let totalTime = 0;
    const sortedMeasurements = {};
    Object.keys(_measurements)
      .sort((a, b) => {
        return _measurements[b].aggregateTime - _measurements[a].aggregateTime;
      })
      .forEach(name => {
        totalTime += _measurements[name].aggregateTime;
        sortedMeasurements[name] = _measurements[name];
      });
    const sortedProfiles = this._profiles.sort((a, b) => {
      if (a.startTime < b.startTime) {
        return -1;
      } else if (a.startTime > b.startTime) {
        return 1;
      } else {
        // lower duration first
        return (a.endTime - a.startTime) - (b.endTime - b.startTime);
      }
    });

    return {
      measurements: sortedMeasurements,
      profiles: sortedProfiles,
      recordingTime: this._recordingTotalTime,
      totalTime,
    };
  }

  _measure(name: string, callback: Function): void {
    this._startMeasurement(name);
    callback();
    this._stopMeasurement(name);
  }

  _instrumentProfile(name: string): () => void {
    const startTime = performanceNow();
    return () => {
      this._profiles.push({
        endTime: performanceNow(),
        name,
        startTime,
      });
    };
  }

  _startMeasurement(name: string): void {
    this._measurements[name] =
      this._measurements[name] || {...measurementDefaults};
    this._profileStack.unshift(0);
    this._startTimesStack.unshift(performanceNow());
  }

  _stopMeasurement(name: string): void {
    const innerTime = this._profileStack.shift();
    const start = this._startTimesStack.shift();
    const totalTime = performanceNow() - start;

    this._measurements[name].aggregateTime += totalTime - innerTime;
    this._measurements[name].callCount++;

    this._profileStack[0] += totalTime;
  }
}

module.exports = RelayMetricsRecorder;

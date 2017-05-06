/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMetricsRecorder
 * @flow
 * @format
 */

'use strict';

const RelayProfiler = require('RelayProfiler');

const performanceNow = require('performanceNow');

const measurementDefaults = {
  aggregateTime: 0,
  callCount: 0,
};

type Measurement = {
  aggregateTime: number,
  callCount: number,
};
type Metrics = {
  measurements: {[name: string]: Measurement},
  profiles: Array<ProfileEvent>,
  recordingTime: number,
  totalTime: number,
};
type ProfileEvent = {
  endTime: number,
  name: string,
  startTime: number,
};

/**
 * Collects timing information from key Relay subsystems.
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

    RelayProfiler.attachAggregateHandler('*', this._measure);
    RelayProfiler.attachProfileHandler('*', this._instrumentProfile);
  }

  stop(): void {
    if (!this._isEnabled) {
      return;
    }
    this._recordingTotalTime += performanceNow() - this._recordingStartTime;
    this._isEnabled = false;

    RelayProfiler.detachAggregateHandler('*', this._measure);
    RelayProfiler.detachProfileHandler('*', this._instrumentProfile);
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
        return a.endTime - a.startTime - (b.endTime - b.startTime);
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
    this._measurements[name] = this._measurements[name] || {
      ...measurementDefaults,
    };
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

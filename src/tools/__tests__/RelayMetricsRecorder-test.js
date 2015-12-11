/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest
  .autoMockOff()
  .mock('performanceNow');

const Relay = require('Relay');
const RelayProfiler = require('RelayProfiler');
const RelayMetricsRecorder = require('RelayMetricsRecorder');
const RelayTestUtils = require('RelayTestUtils');

const performanceNow = require('performanceNow');

describe('RelayMetricsRecorder', () => {
  var query;

  beforeEach(() => {
    window.__DEV__ = true;
    jest.resetModuleRegistry();

    var {getNode} = RelayTestUtils;
    query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ... on User {
            name
          }
        }
      }
    `);
  });

  function mockPerformanceNowSequence(times) {
    var index = 0;
    performanceNow.mockImplementation(() => {
      var time = times[index++];
      expect(time).not.toBe(undefined);
      return time;
    });
  }

  it('returns empty metrics until methods are called', () => {
    var recorder = new RelayMetricsRecorder();
    performanceNow.mockReturnValue(0);
    recorder.start();
    performanceNow.mockReturnValue(1000);
    recorder.stop();
    expect(recorder.getMetrics()).toEqual({
      measurements: {},
      profiles: [],
      recordingTime: 1000,
      totalTime: 0,
    });
  });

  it('returns timing for synchronous methods', () => {
    var recorder = new RelayMetricsRecorder();
    performanceNow.mockReturnValue(0);
    recorder.start();
    mockPerformanceNowSequence([1, 101]);
    query.getChildren();
    performanceNow.mockReturnValue(3000);
    recorder.stop();

    expect(recorder.getMetrics()).toEqual({
      measurements: {
        '@RelayQueryNode.prototype.getChildren': {
          aggregateTime: 100,
          callCount: 1,
        },
      },
      profiles: [],
      recordingTime: 3000,
      totalTime: 100,
    });
  });

  it('returns timing for asynchronous events', () => {
    var recorder = new RelayMetricsRecorder();
    performanceNow.mockReturnValue(0);
    recorder.start();

    performanceNow.mockReturnValue(1);
    var {stop} = RelayProfiler.profile('fetchRelayQuery');
    performanceNow.mockReturnValue(1001);
    stop();
    performanceNow.mockReturnValue(2000);
    recorder.stop();

    expect(recorder.getMetrics()).toEqual({
      measurements: {},
      profiles: [
        {
          endTime: 1001,
          name: 'fetchRelayQuery',
          startTime: 1,
        },
      ],
      recordingTime: 2000,
      totalTime: 0,
    });
  });

  describe('__DEV__ false', () => {
    beforeEach(() => {
      window.__DEV__ = false;
      jest.resetModuleRegistry();
    });

    it('records profiles only', () => {
      var recorder = new RelayMetricsRecorder();
      performanceNow.mockReturnValue(0);
      recorder.start();
      query.getChildren(); // not recorded
      performanceNow.mockReturnValue(1);
      var {stop} = RelayProfiler.profile('fetchRelayQuery');
      performanceNow.mockReturnValue(11);
      stop();
      performanceNow.mockReturnValue(1000);
      recorder.stop();

      expect(recorder.getMetrics()).toEqual({
        measurements: {},
        profiles: [
          {
            endTime: 11,
            name: 'fetchRelayQuery',
            startTime: 1,
          },
        ],
        recordingTime: 1000,
        totalTime: 0,
      });
    });
  });
});

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

var Relay = require('Relay');
var RelayProfiler = require('RelayProfiler');
var RelayMetricsRecorder = require('RelayMetricsRecorder');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayTestUtils = require('RelayTestUtils');

var fetchRelayQuery = require('fetchRelayQuery');
var flattenRelayQuery = require('flattenRelayQuery');
var performanceNow = require('performanceNow');

RelayProfiler.setEnableProfile(true);

describe('RelayMetricsRecorder', () => {
  var query;

  beforeEach(() => {
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
      fetchTime: 0,
      measurements: {},
      recordingTime: 1000,
      totalTime: 0,
    });
  });

  it('returns timing for executed methods', () => {
    var recorder = new RelayMetricsRecorder();
    performanceNow.mockReturnValue(0);
    recorder.start();
    mockPerformanceNowSequence([1, 1001]);
    flattenRelayQuery(query);
    performanceNow.mockReturnValue(3000);
    recorder.stop();

    expect(recorder.getMetrics()).toEqual({
      fetchTime: 0,
      measurements: {
        flattenRelayQuery: {
          aggregateTime: 1000,
          callCount: 1,
        },
      },
      recordingTime: 3000,
      totalTime: 1000,
    });
  });

  it('returns total fetch time', () => {
    var recorder = new RelayMetricsRecorder();
    RelayNetworkLayer.sendQueries = jest.genMockFunction();
    performanceNow.mockReturnValue(0);
    recorder.start();

    mockPerformanceNowSequence([1, 1001]);
    fetchRelayQuery(query);
    jest.runAllTimers();
    var requests = RelayNetworkLayer.sendQueries.mock.calls[0][0];
    expect(requests.length).toBe(1);
    requests[0].resolve();
    jest.runAllTimers();

    performanceNow.mockReturnValue(3000);
    recorder.stop();

    expect(recorder.getMetrics()).toEqual({
      fetchTime: 1000,
      measurements: {},
      recordingTime: 3000,
      totalTime: 0,
    });
  });
});

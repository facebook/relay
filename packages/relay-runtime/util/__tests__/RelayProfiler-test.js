/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const RelayProfiler = require('../RelayProfiler');

beforeEach(() => {
  jest.resetModules();
});

it('invokes attached profile handlers', () => {
  const actualOrdering = [];

  RelayProfiler.attachProfileHandler('mockBehavior', name => {
    expect(name).toBe('mockBehavior');
    actualOrdering.push('1: beforeEnd');
    return () => {
      actualOrdering.push('1: afterEnd');
    };
  });

  RelayProfiler.attachProfileHandler('mockBehavior', name => {
    expect(name).toBe('mockBehavior');
    actualOrdering.push('2: beforeEnd');
    return () => {
      actualOrdering.push('2: afterEnd');
    };
  });

  const profiler = RelayProfiler.profile('mockBehavior');

  expect(actualOrdering).toEqual(['2: beforeEnd', '1: beforeEnd']);

  profiler.stop();

  expect(actualOrdering).toEqual([
    '2: beforeEnd',
    '1: beforeEnd',
    '1: afterEnd',
    '2: afterEnd',
  ]);
});

it('does not invoke detached profile handlers', () => {
  const mockStop = jest.fn();
  const mockStart = jest.fn(() => mockStop);

  RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
  RelayProfiler.detachProfileHandler('mockBehavior', mockStart);
  RelayProfiler.profile('mockBehavior');

  expect(mockStop).not.toBeCalled();
  expect(mockStart).not.toBeCalled();
});

it('passes state to each profile handler', () => {
  const mockStop = jest.fn();
  const mockStart = jest.fn(() => mockStop);
  const state = {};

  RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
  const profiler = RelayProfiler.profile('mockBehavior', state);
  profiler.stop();

  expect(mockStart).toBeCalledWith('mockBehavior', state);
  expect(mockStop).toBeCalled();
  expect(mockStop.mock.calls[0].length).toBe(1);
  expect(mockStop.mock.calls[0][0]).toEqual(undefined);
});

it('passes error to each stop handler', () => {
  const mockStop = jest.fn();
  const mockStart = jest.fn(() => mockStop);
  const state = {};

  RelayProfiler.attachProfileHandler('mockBehavior', mockStart);
  const profiler = RelayProfiler.profile('mockBehavior', state);
  const error = new Error();
  profiler.stop(error);

  expect(mockStart).toBeCalledWith('mockBehavior', state);
  expect(mockStop).toBeCalledWith(error);
});

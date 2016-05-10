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

jest.mock('warning');

const RelayReadyState = require('RelayReadyState');
const RelayTestUtils = require('RelayTestUtils');

const warning = require('warning');

describe('RelayReadyState', () => {
  let onReadyStateChange;
  let readyState;

  beforeEach(() => {
    jest.resetModuleRegistry();

    onReadyStateChange = jest.fn();
    readyState = new RelayReadyState(onReadyStateChange);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('invokes the callback asynchronously when state changes', () => {
    readyState.update({ready: true});

    expect(onReadyStateChange).not.toBeCalled();

    jest.runAllTimers();

    expect(onReadyStateChange.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: true, stale: false}],
    ]);
  });

  it('invokes the callback once per immediate', () => {
    readyState.update({ready: true, stale: true});
    readyState.update({ready: true, stale: false});
    readyState.update({done: true, ready: true});
    jest.runAllTimers();

    expect(onReadyStateChange.mock.calls).toEqual([
      [{aborted: false, done: true, error: null, ready: true, stale: false}],
    ]);
  });

  it('ignores asynchronous state changes after being aborted', () => {
    readyState.update({aborted: true});
    jest.runAllTimers();

    readyState.update({ready: true});
    jest.runAllTimers();

    expect(onReadyStateChange.mock.calls).toEqual([
      [{aborted: true, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('ignores synchronous state changes after being aborted', () => {
    readyState.update({aborted: true});
    readyState.update({ready: true});
    jest.runAllTimers();

    expect(onReadyStateChange.mock.calls).toEqual([
      [{aborted: true, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('warns about state changes after being done', () => {
    readyState.update({done: true, ready: true});
    jest.runAllTimers();
    readyState.update({ready: true});

    expect([
      'RelayReadyState: Invalid state change from `%s` to `%s`.',
      JSON.stringify(
        {aborted: false, done: true, error: null, ready: true, stale: false}
      ),
      JSON.stringify({ready: true}),
    ]).toBeWarnedNTimes(1);

    expect(onReadyStateChange.mock.calls.length).toBe(1);
    jest.runAllTimers();
    expect(onReadyStateChange.mock.calls.length).toBe(1);
  });

  it('warns about state changes after encountering errors', () => {
    const error = new Error('Expected error.');
    readyState.update({error});
    jest.runAllTimers();
    readyState.update({ready: true});

    expect([
      'RelayReadyState: Invalid state change from `%s` to `%s`.',
      JSON.stringify(
        {aborted: false, done: false, error, ready: false, stale: false}
      ),
      JSON.stringify({ready: true}),
    ]).toBeWarnedNTimes(1);

    expect(onReadyStateChange.mock.calls.length).toBe(1);
    jest.runAllTimers();
    expect(onReadyStateChange.mock.calls.length).toBe(1);
  });

  it('ignores state changed to aborted when done', () => {
    readyState.update({done: true, ready: true});
    jest.runAllTimers();

    readyState.update({aborted: true});
    jest.runAllTimers();

    expect(warning).not.toBeCalled();
    expect(onReadyStateChange.mock.calls.length).toBe(1);
  });

  it('ignores state changed to aborted when an error occurred', () => {
    readyState.update({error: new Error('Expected error.')});
    jest.runAllTimers();

    readyState.update({aborted: true});
    jest.runAllTimers();

    expect(warning).not.toBeCalled();
    expect(onReadyStateChange.mock.calls.length).toBe(1);
  });

  it('ignores stale ready state change after being done', () => {
    readyState.update({done: true, ready: true});
    jest.runAllTimers();
    readyState.update({ready: true, stale: true});
    jest.runAllTimers();

    expect(warning).not.toBeCalled();
    expect(onReadyStateChange.mock.calls.length).toBe(1);
  });

  it('invokes stale ready state change after an error occurred', () => {
    const error =  new Error('Expected error.');
    readyState.update({error});
    jest.runAllTimers();
    readyState.update({ready: true, stale: true});
    jest.runAllTimers();

    expect(warning).not.toBeCalled();
    expect(onReadyStateChange.mock.calls.length).toBe(2);
    expect(onReadyStateChange.mock.calls[1]).toEqual(
      [{aborted: false, done: false, error, ready: true, stale: true}]
    );
  });
});

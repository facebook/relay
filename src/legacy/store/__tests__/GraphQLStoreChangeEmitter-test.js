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

jest.dontMock('GraphQLStoreChangeEmitter');

const ErrorUtils = require('ErrorUtils');
const GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
const GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');

describe('GraphQLStoreChangeEmitter', () => {
  let changeEmitter;
  let mockCallback;
  let rangeData;

  beforeEach(() => {
    jest.resetModuleRegistry();

    rangeData = new GraphQLStoreRangeUtils();
    changeEmitter = new GraphQLStoreChangeEmitter(rangeData);

    rangeData.getCanonicalClientID.mockImplementation(id => id);

    ErrorUtils.applyWithGuard.mockImplementation(callback => {
      try {
        callback();
      } catch (guarded) {}
    });
    mockCallback = jest.fn();
  });

  it('should broadcast changes asynchronously', () => {
    changeEmitter.addListenerForIDs(['foo'], mockCallback);
    changeEmitter.broadcastChangeForID('foo');

    expect(mockCallback).not.toBeCalled();
    jest.runAllTimers();
    expect(mockCallback).toBeCalled();
  });

  it('should broadcast exclusively to subscribed IDs', () => {
    changeEmitter.addListenerForIDs(['foo'], mockCallback);
    changeEmitter.broadcastChangeForID('bar');

    jest.runAllTimers();

    expect(mockCallback).not.toBeCalled();
  });

  it('should not broadcast to removed callbacks', () => {
    changeEmitter.addListenerForIDs(['foo'], mockCallback).remove();
    changeEmitter.broadcastChangeForID('foo');

    jest.runAllTimers();

    expect(mockCallback).not.toBeCalled();
  });

  it('should only invoke callbacks subscribed at the time of broadcast', () => {
    changeEmitter.broadcastChangeForID('foo');
    changeEmitter.addListenerForIDs(['foo'], mockCallback);

    jest.runAllTimers();

    expect(mockCallback).not.toBeCalled();
  });

  it('should only broadcast once per execution loop', () => {
    changeEmitter.addListenerForIDs(['foo', 'bar'], mockCallback);
    changeEmitter.broadcastChangeForID('foo');
    changeEmitter.broadcastChangeForID('bar');

    jest.runAllTimers();

    expect(mockCallback.mock.calls.length).toBe(1);

    changeEmitter.broadcastChangeForID('bar');
    changeEmitter.broadcastChangeForID('foo');

    jest.runAllTimers();

    expect(mockCallback.mock.calls.length).toBe(2);
  });

  it('should correctly broadcast changes to range IDs', () => {
    rangeData.getCanonicalClientID.mockImplementation(
      id => id === 'baz_first(5)' ? 'baz' : id
    );

    changeEmitter.addListenerForIDs(['baz_first(5)'], mockCallback);
    changeEmitter.broadcastChangeForID('baz');

    jest.runAllTimers();

    expect(mockCallback).toBeCalled();
  });

  it('should guard against callback errors', () => {
    const mockThrowingCallback = jest.fn(() => {
      throw new Error();
    });

    changeEmitter.addListenerForIDs(['foo'], mockThrowingCallback);
    changeEmitter.addListenerForIDs(['foo'], mockCallback);
    changeEmitter.broadcastChangeForID('foo');

    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();

    expect(mockThrowingCallback).toBeCalled();
    expect(mockCallback).toBeCalled();
  });

  it('should use the injected strategy to batch updates', () => {
    let mockBatching = false;
    const mockBatchingStrategy = jest.fn(
      callback => {
        mockBatching = true;
        callback();
        mockBatching = false;
      }
    );
    changeEmitter.injectBatchingStrategy(mockBatchingStrategy);

    mockCallback.mockImplementation(() => {
      expect(mockBatching).toBe(true);
    });

    changeEmitter.addListenerForIDs(['foo'], mockCallback);
    changeEmitter.broadcastChangeForID('foo');

    expect(mockBatchingStrategy.mock.calls.length).toBe(0);
    jest.runAllTimers();
    expect(mockBatchingStrategy.mock.calls.length).toBe(1);
  });

  it('schedules changes during broadcasts in the next execution loop', () => {
    const mockBatchingStrategy = jest.fn(
      callback => callback()
    );
    changeEmitter.injectBatchingStrategy(mockBatchingStrategy);

    changeEmitter.addListenerForIDs(['foo'], () => {
      changeEmitter.broadcastChangeForID('bar');
    });
    changeEmitter.addListenerForIDs(['bar'], mockCallback);
    changeEmitter.broadcastChangeForID('foo');

    jest.runAllTimers();

    expect(mockCallback).toBeCalled();
    // Jest does not allow running only one tick, so just assert that broadcasts
    // occurring twice means `mockCallback` was invoked separately.
    expect(mockBatchingStrategy.mock.calls.length).toBe(2);
  });
});

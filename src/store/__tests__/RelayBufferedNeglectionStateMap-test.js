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

var RelayBufferedNeglectionStateMap = require('RelayBufferedNeglectionStateMap');
var RelayNeglectionStateMap = require('RelayNeglectionStateMap');
var RelayTestUtils = require('RelayTestUtils');

describe('RelayNeglectionStateMap', () => {
  var neglectionStateMap;

  beforeEach(() => {
    jest.resetModuleRegistry();

    neglectionStateMap = new RelayNeglectionStateMap();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('buffers registration of data IDs', () => {
    var bufferedMap = new RelayBufferedNeglectionStateMap(neglectionStateMap);
    bufferedMap.register('a');
    expect(neglectionStateMap.size()).toBe(0);
    expect(neglectionStateMap.register).not.toBeCalled();
    bufferedMap.flushBuffer();
    expect(neglectionStateMap.size()).toBe(1);
    expect(bufferedMap.size()).toBe(1);
    expect(neglectionStateMap.register).toBeCalledWith('a');
  });

  it('buffers increasing of data IDs', () => {
    var bufferedMap = new RelayBufferedNeglectionStateMap(neglectionStateMap);
    bufferedMap.register('a');
    bufferedMap.increaseSubscriptionsFor('a');
    expect(neglectionStateMap.size()).toBe(0);
    expect(neglectionStateMap.increaseSubscriptionsFor).not.toBeCalled();
    bufferedMap.flushBuffer();
    expect(neglectionStateMap.size()).toBe(1);
    expect(bufferedMap.size()).toBe(1);
    expect(neglectionStateMap.increaseSubscriptionsFor).toBeCalledWith('a');
  });

  it('buffers decreasing of data IDs', () => {
    var bufferedMap = new RelayBufferedNeglectionStateMap(neglectionStateMap);
    bufferedMap.register('a');
    bufferedMap.increaseSubscriptionsFor('a');
    bufferedMap.decreaseSubscriptionsFor('a');
    expect(neglectionStateMap.decreaseSubscriptionsFor).not.toBeCalled();
    expect(neglectionStateMap.size()).toBe(0);
    bufferedMap.flushBuffer();
    expect(neglectionStateMap.size()).toBe(1);
    expect(bufferedMap.size()).toBe(1);
    expect(neglectionStateMap.decreaseSubscriptionsFor).toBeCalledWith('a');
  });

  it('buffers removing data IDs', () => {
    var bufferedMap = new RelayBufferedNeglectionStateMap(neglectionStateMap);
    bufferedMap.register('a');
    bufferedMap.remove('a');
    expect(neglectionStateMap.remove).not.toBeCalled();
    bufferedMap.flushBuffer();
    expect(neglectionStateMap.size()).toBe(0);
    expect(bufferedMap.size()).toBe(0);
    expect(neglectionStateMap.remove).toBeCalledWith('a');
  });
});

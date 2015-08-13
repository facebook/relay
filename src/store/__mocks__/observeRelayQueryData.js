/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

 /* eslint no-shadow: 1 */

'use strict';
var actualImplementation = require.requireActual('observeRelayQueryData');

var mockImplementation = jest.genMockFunction().mockImplementation(
  (...args) => {
    var observer = actualImplementation(...args);
    observer.subscriptions = [];
    var actualSubscribe = observer.subscribe.bind(observer);
    observer.subscribe = jest.genMockFunction().mockImplementation(
      (...args) => {
        var subscription = actualSubscribe(...args);
        var actualDispose = subscription.dispose.bind(subscription);
        subscription.dispose = jest.genMockFunction().mockImplementation(
          actualDispose
        );
        subscription.callbacks = args[0];
        observer.subscriptions.push(subscription);
        return subscription;
      }
    );
    var index = mockImplementation.mock.calls.length - 1;
    mockImplementation.mock.observers[index] = observer;
    return observer;
  }
);

mockImplementation.mock.observers = [];

module.exports = mockImplementation;

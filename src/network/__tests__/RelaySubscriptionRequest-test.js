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

const RelaySubscriptionRequest = require('RelaySubscriptionRequest');
const RelayTestUtils = require('RelayTestUtils');

describe('RelaySubscriptionRequest', () => {
  var disposable;
  var request;

  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers(RelayTestUtils.matchers);

    var subscription = {};
    request = new RelaySubscriptionRequest(subscription);
    disposable = {
      dispose: jest.genMockFunction(),
    };
    request.setDisposable(disposable);
  });

  describe('subscribe', () => {
    it('returns a subscription', () => {
      const subscriber = {};

      const subscription = request.subscribe(subscriber);
      expect(typeof subscription.dispose).toBe('function');
    });

    it('throws if the request has been disposed', () => {
      request.dispose();

      const subscriber = {};

      expect(() => {
        request.subscribe(subscriber);
      }).toFailInvariant('RelaySubscriptionRequest: Cannot subscribe to disposed subscription.');
    });
  });

  describe('subscriptions', () => {
    it('can only be diposed once', () => {
      const subscriber = {};

      const subscription = request.subscribe(subscriber);
      subscription.dispose();
      expect(() => {
        subscription.dispose();
      }).toFailInvariant('RelaySubscriptionRequest: Subscriptions may only be disposed once.');
    });

    it('disposes the request when the last subscription unsubscribes', () => {
      const subscriberA = {};
      const subscriberB = {};

      const subscriptionA = request.subscribe(subscriberA);
      const subscriptionB = request.subscribe(subscriberB);
      subscriptionA.dispose();
      expect(disposable.dispose).not.toBeCalled();
      subscriptionB.dispose();
      expect(disposable.dispose).toBeCalled();
    });
  });

  describe('onNext', () => {
    it('calls onNext of each subscriber', () => {
      const subscriberA = {
        onNext: jest.genMockFunction(),
      };
      const subscriberB = {
        onNext: jest.genMockFunction(),
      };

      request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      const data = {response: {}};
      request.onNext(data);

      expect(subscriberA.onNext).toBeCalledWith(data);
      expect(subscriberB.onNext).toBeCalledWith(data);
    });

    it('handles a subscriber without an onNext', () => {
      const subscriber = {};
      request.subscribe(subscriber);

      request.onNext({response: {}});
    });

    it('does not call onNext of a subscriber who has unsubscribed', () => {
      const subscriberA = {
        onNext: jest.genMockFunction(),
      };
      const subscriberB = {
        onNext: jest.genMockFunction(),
      };

      const subscriptionA = request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      const dataOne = {response: 1};
      request.onNext(dataOne);

      expect(subscriberA.onNext).toBeCalledWith(dataOne);
      expect(subscriberB.onNext).toBeCalledWith(dataOne);

      subscriptionA.dispose();

      const dataTwo = {response: 2};
      request.onNext(dataTwo);

      expect(subscriberA.onNext).not.toBeCalledWith(dataTwo);
      expect(subscriberB.onNext).toBeCalledWith(dataTwo);
    });

    it('does not call onNext of subscribers if the request has errored', () => {
      const subscriber = {
        onNext: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onError('error');

      request.onNext({response: {}});

      expect(subscriber.onNext).not.toBeCalled();
    });

    it('does not call onNext of subscribers if the request is completed', () => {
      const subscriber = {
        onNext: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onCompleted();

      request.onNext({response: {}});

      expect(subscriber.onNext).not.toBeCalled();
    });

    it('does not call onNext of subscribers if the request is disposed', () => {
      const subscriber = {
        onNext: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.dispose();

      request.onNext({response: {}});

      expect(subscriber.onNext).not.toBeCalled();
    });

    it('disposes the request if onNext throws', () => {
      const subscriber = {
        onNext: (data) => { throw Error('subscriber error'); },
      };

      request.subscribe(subscriber);

      const data = {response: {}};
      expect(() => request.onNext(data)).toThrowError('subscriber error');

      expect(disposable.dispose).toBeCalled();
    });
  });

  describe('onError', () => {
    it('calls onError of each subscriber', () => {
      const subscriberA = {
        onError: jest.genMockFunction(),
      };
      const subscriberB = {
        onError: jest.genMockFunction(),
      };

      request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      const error = 'an error';
      request.onError(error);

      expect(subscriberA.onError).toBeCalledWith(error);
      expect(subscriberB.onError).toBeCalledWith(error);
    });

    it('handles a subscriber without an onError', () => {
      const subscriber = {};
      request.subscribe(subscriber);

      request.onError('an error');
    });

    it('does not call onError of a subscriber who has unsubscribed', () => {
      const subscriberA = {
        onError: jest.genMockFunction(),
      };
      const subscriberB = {
        onError: jest.genMockFunction(),
      };

      const subscriptionA = request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      subscriptionA.dispose();

      const error = 'error';
      request.onError(error);

      expect(subscriberA.onError).not.toBeCalledWith(error);
      expect(subscriberB.onError).toBeCalledWith(error);
    });

    it('does not call onError of subscribers if the request has already errored', () => {
      const subscriber = {
        onError: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onError('error 1');
      expect(subscriber.onError).toBeCalledWith('error 1');

      request.onError('error 2');
      expect(subscriber.onError).not.toBeCalledWith('error 2');
    });

    it('does not call onError of subscribers if the request is completed', () => {
      const subscriber = {
        onError: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onCompleted();

      request.onError('error');

      expect(subscriber.onError).not.toBeCalled();
    });

    it('does not call onError of subscribers if the request is disposed', () => {
      const subscriber = {
        onError: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.dispose();

      request.onError('error');

      expect(subscriber.onError).not.toBeCalled();
    });

    it('disposes the request if onError throws', () => {
      const subscriber = {
        onError: (data) => { throw Error('subscriber error'); },
      };

      request.subscribe(subscriber);

      expect(() => request.onError('error')).toThrowError('subscriber error');

      expect(disposable.dispose).toBeCalled();
    });
  });

  describe('onCompleted', () => {
    it('calls onCompleted of each subscriber', () => {
      const subscriberA = {
        onCompleted: jest.genMockFunction(),
      };
      const subscriberB = {
        onCompleted: jest.genMockFunction(),
      };

      request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      request.onCompleted();

      expect(subscriberA.onCompleted).toBeCalled();
      expect(subscriberB.onCompleted).toBeCalled();
    });

    it('handles a subscriber without an onCompleted', () => {
      const subscriber = {};
      request.subscribe(subscriber);

      request.onCompleted();
    });

    it('does not call onCompleted of a subscriber who has unsubscribed', () => {
      const subscriberA = {
        onCompleted: jest.genMockFunction(),
      };
      const subscriberB = {
        onCompleted: jest.genMockFunction(),
      };

      const subscriptionA = request.subscribe(subscriberA);
      request.subscribe(subscriberB);

      subscriptionA.dispose();

      request.onCompleted();

      expect(subscriberA.onCompleted).not.toBeCalledWith();
      expect(subscriberB.onCompleted).toBeCalledWith();
    });

    it('does not call onCompleted of subscribers if the request has already errored', () => {
      const subscriber = {
        onCompleted: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onError('error');

      request.onCompleted();
      expect(subscriber.onCompleted).not.toBeCalled();
    });

    it('does not call onCompleted of subscribers if the request is completed', () => {
      const subscriber = {
        onCompleted: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.onCompleted();

      request.onCompleted();

      expect(subscriber.onCompleted.mock.calls.length).toBe(1);
    });

    it('does not call onCompleted of subscribers if the request is disposed', () => {
      const subscriber = {
        onCompleted: jest.genMockFunction(),
      };

      request.subscribe(subscriber);
      request.dispose();

      request.onCompleted();

      expect(subscriber.onCompleted).not.toBeCalled();
    });

    it('disposes the request if onCompleted throws', () => {
      const subscriber = {
        onCompleted: () => { throw Error('subscriber error'); },
      };

      request.subscribe(subscriber);

      expect(() => request.onCompleted()).toThrowError('subscriber error');

      expect(disposable.dispose).toBeCalled();
    });
  });

  describe('setDisposable', () => {
    it('should call the disposable when the request is disposed', () => {
      request.dispose();
      expect(disposable.dispose).toBeCalled();
    });

    it('should call the disposable if the request is already disposed', () => {
      request = new RelaySubscriptionRequest({});
      request.dispose();

      expect(disposable.dispose).not.toBeCalled();
      request.setDisposable(disposable);
      expect(disposable.dispose).toBeCalled();
    });

    it('throws when setting the disposable more than once', () => {
      expect(() => {
        request.setDisposable(disposable);
      }).toFailInvariant('RelaySubscriptionRequest: attempting to set disposable more than once');
    });
  });

});

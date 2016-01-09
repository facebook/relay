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

jest.dontMock('RelayTaskScheduler');

const RelayTaskQueue = require('RelayTaskQueue');
const RelayTaskScheduler = require('RelayTaskScheduler');

describe('RelayTaskScheduler', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
  });

  describe('enqueue()', () => {
    describe('having had no scheduler injected', () => {
      it('causes a queue to be created the first time it\'s used', () => {
        expect(RelayTaskQueue.mock.instances.length).toBe(0);
        RelayTaskScheduler.enqueue(() => {});
        expect(RelayTaskQueue.mock.instances.length).toBe(1);
        expect(RelayTaskQueue.prototype.constructor).toBeCalledWith(undefined);
        RelayTaskScheduler.enqueue(() => {});
        expect(RelayTaskQueue.mock.instances.length).toBe(1);
      });
    });

    describe('having had a scheduler injected', () => {
      let mockScheduler;

      beforeEach(() => {
        mockScheduler = jest.genMockFunction();
        RelayTaskScheduler.injectScheduler(mockScheduler);
      });

      it('causes a queue to be created the first time it\'s used', () => {
        expect(RelayTaskQueue.mock.instances.length).toBe(0);
        RelayTaskScheduler.enqueue(() => {});
        expect(RelayTaskQueue.mock.instances.length).toBe(1);
        expect(RelayTaskQueue.prototype.constructor).toBeCalledWith(
          mockScheduler
        );
        RelayTaskScheduler.enqueue(() => {});
        expect(RelayTaskQueue.mock.instances.length).toBe(1);
      });

      it('uses the injected scheduler to schedule tasks', () => {
        jest.dontMock('RelayTaskQueue');
        const mockTask = () => {};
        RelayTaskScheduler.enqueue(mockTask);
        expect(mockScheduler).toBeCalled();
      });
    });
  });
});

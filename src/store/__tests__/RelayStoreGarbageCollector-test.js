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
  .dontMock('GraphQLStoreDataHandler')
  .dontMock('RelayStoreData')
  .dontMock('RelayStoreGarbageCollector')
  .dontMock('performanceNow');

var GraphQLRange = require('GraphQLRange');
var RelayBufferedNeglectionStateMap = require('RelayBufferedNeglectionStateMap');
var RelayNeglectionStateMap = require('RelayNeglectionStateMap');
var RelayStoreData = require('RelayStoreData');
var RelayStoreGarbageCollector = require('RelayStoreGarbageCollector');
var RelayTaskScheduler = require('RelayTaskScheduler');
var RelayTestUtils = require('RelayTestUtils');
var forEachObject = require('forEachObject');

describe('RelayStoreGarbageCollector', () => {
  function createRelayStoreGarbageCollector(records, stepLength) {
    var relayStoreData = new RelayStoreData();
    var nodeData = relayStoreData.getNodeData();
    var queuedData = relayStoreData.getQueuedData();
    if (records) {
      forEachObject(records, (data, dataID) => {
        nodeData[dataID] = data;
        queuedData[dataID] = data;
      });
    }

    return {
      garbageCollector: new RelayStoreGarbageCollector(
        relayStoreData,
        stepLength
      ),
      storeData: relayStoreData,
    };
  }

  function isDataIDRegistered(dataID, collector) {
    var hasSubscriptions = true;
    var unregisteredError =
      'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
      'decrease subscriptions for unregistered record `' + dataID + '`.';
    var belowZeroError =
      'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
      'decrease subscriptions below 0 for record `' + dataID + '`.';

    try {
      collector.decreaseSubscriptionsFor(dataID);
      // Flushing the buffer changes
      RelayBufferedNeglectionStateMap.mock.instances.forEach(instance => {
        instance.flushBuffer();
      });
    } catch (error) {
      if (error.message === unregisteredError) {
        return false;
      } else if (error.message === belowZeroError) {
        hasSubscriptions = false;
      } else {
        // Nothing we can handle, pass it along
        throw error;
      }
    }

    // Leave no trace of this check
    if (hasSubscriptions) {
      collector.increaseSubscriptionsFor(dataID);
      // Flushing the buffer changes
      RelayBufferedNeglectionStateMap.mock.instances.forEach(instance => {
        instance.flushBuffer();
      });
    }
    return true;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it(
    'uses the buffered neglection state maps when not collecting garbage',
    () => {
      var {garbageCollector} = createRelayStoreGarbageCollector();
      var bufferedMap = RelayBufferedNeglectionStateMap.mock.instances[0];
      var map = RelayNeglectionStateMap.mock.instances[0];

      expect(bufferedMap.register).not.toBeCalled();
      expect(map.register).not.toBeCalled();
      garbageCollector.register('a');
      expect(bufferedMap.register).toBeCalledWith('a');
      expect(map.register).not.toBeCalled();

      expect(bufferedMap.increaseSubscriptionsFor).not.toBeCalled();
      expect(map.increaseSubscriptionsFor).not.toBeCalled();
      garbageCollector.increaseSubscriptionsFor('a');
      expect(bufferedMap.increaseSubscriptionsFor).toBeCalledWith('a');
      expect(map.increaseSubscriptionsFor).not.toBeCalled();

      expect(bufferedMap.decreaseSubscriptionsFor).not.toBeCalled();
      expect(map.decreaseSubscriptionsFor).not.toBeCalled();
      garbageCollector.decreaseSubscriptionsFor('a');
      expect(bufferedMap.decreaseSubscriptionsFor).toBeCalledWith('a');
      expect(map.decreaseSubscriptionsFor).not.toBeCalled();
    }
  );

  it(
    'uses the unbuffered neglection state maps when collecting garbage',
    () => {
      var {garbageCollector} = createRelayStoreGarbageCollector();
      // Using an asynchronous task scheduler so we can verify the behavior
      // during a collection.
      RelayTaskScheduler.injectScheduler(task => setTimeout(task, 0));
      garbageCollector.scheduleCollection();
      var bufferedMap = RelayBufferedNeglectionStateMap.mock.instances[0];
      var map = RelayNeglectionStateMap.mock.instances[0];

      expect(bufferedMap.register).not.toBeCalled();
      expect(map.register).not.toBeCalled();
      garbageCollector.register('a');
      expect(bufferedMap.register).not.toBeCalled();
      expect(map.register).toBeCalledWith('a');

      expect(bufferedMap.increaseSubscriptionsFor).not.toBeCalled();
      expect(map.increaseSubscriptionsFor).not.toBeCalled();
      garbageCollector.increaseSubscriptionsFor('a');
      expect(bufferedMap.increaseSubscriptionsFor).not.toBeCalled();
      expect(map.increaseSubscriptionsFor).toBeCalledWith('a');

      expect(bufferedMap.decreaseSubscriptionsFor).not.toBeCalled();
      expect(map.decreaseSubscriptionsFor).not.toBeCalled();
      garbageCollector.decreaseSubscriptionsFor('a');
      expect(bufferedMap.decreaseSubscriptionsFor).not.toBeCalled();
      expect(map.decreaseSubscriptionsFor).toBeCalledWith('a');
    }
  );

  /**
   * Tests if the collectability of a records is determined correctly
   */
  describe('rudimentary collect logic', () => {
    var garbageCollector;
    var storeData;

    beforeEach(() => {
      var records = {a: {__dataID__: 'a'}};
      (
        {garbageCollector, storeData} =
          createRelayStoreGarbageCollector(records)
      );
    });

    it('does not remove records when they are not collectible', () => {
      garbageCollector.register('a');
      garbageCollector.scheduleCollection();

      expect(storeData.getNodeData().a).toEqual({__dataID__: 'a'});
      expect(storeData.getQueuedData().a).toEqual({__dataID__: 'a'});
      expect(
        storeData.getQueryTracker().untrackNodesForID
      ).not.toBeCalled();
      // DataID is still registered
      expect(isDataIDRegistered('a', garbageCollector)).toBe(true);
    });

    it('only removes records when they are collectible', () => {
      garbageCollector.register('a');

      garbageCollector.scheduleCollection();
      // Collectible on DataID for `a` now set to true
      garbageCollector.scheduleCollection();

      expect(storeData.getNodeData().a).toBeUndefined();
      expect(storeData.getQueuedData().a).toBeUndefined();
      expect(
        storeData.getQueryTracker().untrackNodesForID
      ).toBeCalledWith('a');
      expect(isDataIDRegistered('a', garbageCollector)).toBe(false);
    });

    it('does not remove records when they have subscriptions', () => {
      garbageCollector.register('a');
      garbageCollector.increaseSubscriptionsFor('a');

      garbageCollector.scheduleCollection();
      // Collectible on DataID for `a` now set to true
      garbageCollector.scheduleCollection();

      expect(storeData.getNodeData().a).toEqual({__dataID__: 'a'});
      expect(storeData.getQueuedData().a).toEqual({__dataID__: 'a'});
      expect(
        storeData.getQueryTracker().untrackNodesForID
      ).not.toBeCalled();
      expect(isDataIDRegistered('a', garbageCollector)).toBe(true);
    });

    it('only removes records when they have no subscriptions', () => {
      garbageCollector.register('a');

      garbageCollector.scheduleCollection();
      // Collectible on DataID for `a` now set to true
      garbageCollector.increaseSubscriptionsFor('a');
      garbageCollector.scheduleCollection();
      // Data is still registered in the garbage collector since it has a
      // subscription
      garbageCollector.decreaseSubscriptionsFor('a');
      garbageCollector.scheduleCollection();

      expect(storeData.getNodeData().a).toBeUndefined();
      expect(storeData.getQueuedData().a).toBeUndefined();
      expect(
        storeData.getQueryTracker().untrackNodesForID
      ).toBeCalledWith('a');
      expect(isDataIDRegistered('a', garbageCollector)).toBe(false);
    });

    it(
      'only removes records that have a server-site DataID or contain a range',
      () => {
        var mockRange = new GraphQLRange();
        mockRange.getEdgeIDs = jest.genMockFunction().mockReturnValue([]);
        var records = {
          server: {__dataID__: 'server'},
          'client:1': {__dataID__: 'client:1'},
          'client:range': {
            __dataID__: 'client:range',
            __range__: mockRange,
          },
        };
        var {garbageCollector, storeData} =
          createRelayStoreGarbageCollector(records);

        garbageCollector.register('server');
        garbageCollector.register('client:1');
        garbageCollector.register('client:range');
        garbageCollector.scheduleCollection();
        // Collectible on all registered DataIDs now set to true
        garbageCollector.scheduleCollection();
        expect(storeData.getQueuedData()).toEqual({
          'client:1': {__dataID__: 'client:1'},
        });
      }
    );

    it(
      'marks all remaining records of the current collect-cycle as ' +
      'collectible if a new call to `collect` is invoked',
      () => {
        // We manually execute and keep track of the tasks so we can inspect
        // how many tasks are created and which state changed after a task was
        // run. Executing the last task will push a new task to the `tasks`
        // array if more tasks were scheduled.
        var tasks = [];
        RelayTaskScheduler.injectScheduler(task => tasks.push(task));
        var records = {
          a: {__dataID__: 'a'},
          b: {__dataID__: 'b'},
          c: {__dataID__: 'c'},
        };
        var {garbageCollector, storeData} =
          createRelayStoreGarbageCollector(records);
        garbageCollector.register('a');
        garbageCollector.register('b');
        garbageCollector.register('c');
        // No tasks were queued
        expect(tasks.length).toBe(0);
        garbageCollector.scheduleCollection(1);
        // First call to collect enqueues first step.
        expect(tasks.length).toBe(1);
        (tasks[0])();
        jest.runAllTimers();
        // No records were removed, `a` is marked collectible, a new step has
        // been enqueued.
        expect(tasks.length).toBe(2);
        garbageCollector.scheduleCollection(1);
        // A second collect-cycle was started, `b` and `c` will be marked as
        // collectible. Note that this was done in a single step even though the
        // step length is 1.
        (tasks[1])();
        jest.runAllTimers();
        expect(tasks.length).toBe(3);
        // First step of second collect-cycle, only `a` gets collected.
        (tasks[2])();
        jest.runAllTimers();
        expect(storeData.getQueuedData()).toEqual({
          b: {__dataID__: 'b'},
          c: {__dataID__: 'c'},
        });
        // Second step of the second collect-cycle. `b` will be removed.
        (tasks[3])();
        jest.runAllTimers();
        expect(storeData.getQueuedData()).toEqual({
          c: {__dataID__: 'c'},
        });
        // Executing the last step of the last collect-cycle, no more steps will
        // be queued after this step.
        expect(tasks.length).toBe(5);
        (tasks[4])();
        expect(storeData.getQueuedData()).toEqual({});
        // No new task was scheduled
        expect(tasks.length).toBe(5);
      }
    );

    it(
      'removes records in multiple steps if the number of registered records ' +
      'is larger than the allowed step length',
      () => {
        // Use an asynchronous task-scheduler so we can inspect the state of the
        // registered data when the collection threshold is met in a collection
        // step and a new step will be started.
        RelayTaskScheduler.injectScheduler(task => setTimeout(task, 0));
        function runTimersUntilDifferent(callback) {
          var initial = callback();
          for (var ii = 0; ii < 100; ii++) {
            if (initial !== callback()) {
              return;
            }
            jest.runOnlyPendingTimers();
          }
          throw new Error('Infinite loop in `runTimersUntilDifferent`.');
        }

        var records = {
          a: {
            __dataID__: 'a',
            field: {__dataID__: 'client:1'},
          },
          b: {__dataID__: 'b'},
          c: {
            __dataID__: 'c',
            field: {__dataID__: 'client:2'},
          },
          d: {__dataID__: 'd'},
          e: {__dataID__: 'e'},
          'client:1': {__dataID__: 'client:1'},
          'client:2': {__dataID__: 'client:2'},
        };
        var {garbageCollector, storeData} =
          createRelayStoreGarbageCollector(records);
        garbageCollector.register('a');
        garbageCollector.register('b');
        garbageCollector.register('c');
        garbageCollector.register('d');
        garbageCollector.register('e');
        // We queue two collect calls, the first one will only set all DataIDs
        // to collectible.
        garbageCollector.scheduleCollection(4);
        garbageCollector.scheduleCollection(4);
        runTimersUntilDifferent(() => {
          return Object.keys(storeData.getQueuedData()).length;
        });
        // Collection was done for 5 dataIDs while the limit is 4. A new step
        // will be scheduled and run asynchronously.
        expect(storeData.getQueuedData()).toEqual({
          d: {__dataID__: 'd'},
          e: {__dataID__: 'e'},
        });
        jest.runAllTimers();
        // Next collection step takes care of the remaining DataIDs `d` and `e`.
        expect(storeData.getQueuedData()).toEqual({});
      }
    );
  });

  /**
   * Tests if descendant records are collected correctly
   */
  describe('collecting descendant records logic', () => {
    it('removes descendant records with client-site DataIDs', () => {
      // For this test-case we set up the store-data with differing datasets for
      // queuedRecords and records to ensure garbage-collection removes
      // descendant records from both datasets.
      var storeData = new RelayStoreData();
      // Setup records
      var records = {
        a: {
          __dataID__: 'a',
          field1: {__dataID__: 'client:1'},
          field2: {__dataID__: 'client:2'},
        },
        'client:1': {__dataID__: 'client:1'},
        'client:2': {
          __dataID__: 'client:2',
          field3: {__dataID__: 'client:3' },
        },
        'client:3': {__dataID__: 'client:3'},
      };
      var nodeData = storeData.getNodeData();
      forEachObject(records, (data, dataID) => {
        nodeData[dataID] = data;
      });
      // Setup queued records
      var queuedRecords = {
        a: {
          __dataID__: 'a',
          field2: {__dataID__: 'client:4'},
        },
        'client:4': {__dataID__: 'client:4'},
        'client:5': {__dataID__: 'client:5'},
      };
      var queuedData = storeData.getQueuedData();
      forEachObject(queuedRecords, (data, dataID) => {
        queuedData[dataID] = data;
      });

      var garbageCollector = new RelayStoreGarbageCollector(storeData);

      garbageCollector.register('a');
      garbageCollector.scheduleCollection();
      // Collectible on DataID for `a` now set to true
      expect(storeData.getNodeData()).toEqual(records);
      expect(storeData.getQueuedData()).toEqual(queuedRecords);
      garbageCollector.scheduleCollection();
      expect(storeData.getNodeData()).toEqual({});
      expect(storeData.getQueuedData()).toEqual({
        'client:5': {__dataID__: 'client:5'},
      });
    });

    it(
      'does not removed descendant records with server-site DataIDs that ' +
      'have active subscriptions',
      () => {
        var records = {
          a: {
            __dataID__: 'a',
            b: {__dataID__: 'b'},
            field1: {__dataID__: 'client:1'},
          },
          b: {
            __dataID__: 'b',
            field2: {__dataID__: 'client:2'},
          },
          'client:1': {__dataID__: 'client:1'},
          'client:2': {__dataID__: 'client:2'},
        };
        var {garbageCollector, storeData} =
          createRelayStoreGarbageCollector(records);

        garbageCollector.register('a');
        garbageCollector.register('b');
        garbageCollector.increaseSubscriptionsFor('b');
        garbageCollector.scheduleCollection();
        // Collectible on DataID for `a` and `b` now set to true
        garbageCollector.scheduleCollection();
        expect(storeData.getQueuedData()).toEqual({
          b: {
            __dataID__: 'b',
            field2: {__dataID__: 'client:2'},
          },
          'client:2': {__dataID__: 'client:2'}
        });
      }
    );

    it('removes all edges when a range is removed', () => {
      var mockRange = new GraphQLRange();
      mockRange.getEdgeIDs = jest.genMockFunction().mockReturnValue([
        'client:1', 'client:2'
      ]);
      var records = {
        range: {__dataID__: 'range', __range__: mockRange},
        'client:1': {__dataID__: 'client:1'},
        'client:2': {__dataID__: 'client:2'},
      };
      var {garbageCollector, storeData} =
        createRelayStoreGarbageCollector(records);

      expect(storeData.getQueuedData()).toEqual({
        range: {__dataID__: 'range', __range__: mockRange},
        'client:1': {__dataID__: 'client:1'},
        'client:2': {__dataID__: 'client:2'},
      });

      garbageCollector.register('range');
      garbageCollector.scheduleCollection();
      // Collectible on DataID `range` now set to true
      garbageCollector.scheduleCollection();
      expect(storeData.getQueuedData()).toEqual({});
    });
  });
});

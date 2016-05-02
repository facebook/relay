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

require('configureForRelayOSS');

jest
  .unmock('GraphQLRange')
  .unmock('GraphQLSegment');

const Relay = require('Relay');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const forEachObject = require('forEachObject');
const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('RelayGarbageCollector', () => {
  const {getNode} = RelayTestUtils;
  const {HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayNodeInterface;

  function defaultScheduler(run) {
    // collect everything without pausing
    while (run()) {}
  }

  function createGC(records, scheduler) {
    scheduler = scheduler || defaultScheduler;

    const storeData = new RelayStoreData();
    storeData.initializeGarbageCollector(scheduler);
    const nodeData = storeData.getNodeData();
    if (records) {
      forEachObject(records, (data, dataID) => {
        nodeData[dataID] = data;
      });
    }

    return {
      garbageCollector: storeData.getGarbageCollector(),
      storeData,
    };
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('collect()', () => {
    it('collects all unreferenced nodes', () => {
      const records = {
        referenced: {__dataID__: 'referenced'},
        unreferenced: {__dataID__: 'unreferenced'},
      };
      const {garbageCollector, storeData} = createGC(records);
      garbageCollector.register('unreferenced');
      garbageCollector.incrementReferenceCount('unreferenced');
      garbageCollector.decrementReferenceCount('unreferenced');
      garbageCollector.register('referenced');
      garbageCollector.incrementReferenceCount('referenced');
      garbageCollector.collect();
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({
        referenced: records.referenced,
      });
    });
  });

  describe('collectFromNode()', () => {
    it('collects reachable unreferenced nodes', () => {
      const records = {
        a: {
          __dataID__: 'a',
          field: {__dataID__: 'b'},
        },
        b: {
          __dataID__: 'b',
          field: {__dataID__: 'c'},
        },
        c: {
          __dataID__: 'c',
        },
        unreachable: {
          __dataID__: 'unreachable',
        },
      };
      const {garbageCollector, storeData} = createGC(records);
      garbageCollector.register('a');
      garbageCollector.register('b');
      garbageCollector.register('c');
      garbageCollector.register('unreachable');

      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({
        unreachable: {__dataID__: 'unreachable'},
      });
    });

    it('skips referenced nodes', () => {
      const records = {
        a: {
          __dataID__: 'a',
          unreferenced: {__dataID__: 'unreferenced'},
          referenced: {__dataID__: 'referenced'},
        },
        unreferenced: {
          __dataID__: 'unreferenced',
        },
        referenced: {
          __dataID__: 'referenced',
        },
      };
      const {garbageCollector, storeData} = createGC(records);
      garbageCollector.register('a');
      garbageCollector.register('referenced');
      garbageCollector.register('unreferenced');
      garbageCollector.incrementReferenceCount('referenced');

      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({
        referenced: {__dataID__: 'referenced'},
      });
    });

    it('handles deleted/removed nodes', () => {
      const records = {
        a: {
          __dataID__: 'a',
          removed: {__dataID__: 'removed'},
          deleted: {__dataID__: 'deleted'},
          b: {__dataID__: 'b'},
        },
        deleted: null,
        b: {
          __dataID__: 'b',
        },
      };
      const {garbageCollector, storeData} = createGC(records);
      garbageCollector.register('a');
      garbageCollector.register('b');
      garbageCollector.register('deleted');

      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({});
    });

    it('collects connection edges and nodes', () => {
      const records = {
        unreachable: {
          __dataID__: 'unreachable',
        },
      };
      const {garbageCollector, storeData} = createGC(records);
      const payload = {
        viewer: {
          newsFeed: {
            edges: [
              {
                cursor: 'c1',
                node: {
                  id:'s1',
                  message:{
                    text:'s1',
                  },
                  __typename: 'Story',
                },
              },
            ],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      const query = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  message {
                    text
                  }
                }
              }
            }
          }
        }
      `);
      storeData.handleQueryPayload(
        query,
        transformRelayQueryPayload(query, payload)
      );
      const viewerID = storeData.getRecordStore().getDataID('viewer', null);
      garbageCollector.collectFromNode(viewerID);
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({
        unreachable: {__dataID__: 'unreachable'},
      });
    });
  });

  describe('acquireHold()', () => {
    it('collects nodes if no holds are acquired', () => {
      // base case
      const records = {
        a: {__dataID__: 'a'},
      };
      const {garbageCollector, storeData} = createGC(records);
      garbageCollector.register('a');
      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({});
    });

    it('waits to collect until holds are released', () => {
      const records = {
        a: {__dataID__: 'a'},
      };
      const {garbageCollector, storeData} = createGC(records);
      const {release} = garbageCollector.acquireHold();
      garbageCollector.register('a');
      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      // not collected while hold is active
      expect(storeData.getNodeData()).toEqual(records);
      release();
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual({});
    });

    it('throws if a hold is released more than once', () => {
      const {garbageCollector} = createGC({});
      const {release} = garbageCollector.acquireHold();
      release();
      expect(() => release()).toFailInvariant(
        'RelayGarbageCollector: hold can only be released once.'
      );
    });

    it('skips collection if a hold is active', () => {
      const records = {
        a: {__dataID__: 'a'},
      };
      let run = null;
      const {garbageCollector, storeData} = createGC(records, _run => {
          run = _run;
        }
      );
      garbageCollector.register('a');
      garbageCollector.collect();
      jest.runAllTimers();

      const {release} = garbageCollector.acquireHold();
      run();
      // not collected while hold is active
      expect(storeData.getNodeData()).toEqual(records);
      release();
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual(records);
      run();
      expect(storeData.getNodeData()).toEqual({});
    });
  });

  describe('scheduling', () => {
    it('does not call scheduler if there is nothing to collect', () => {
      const records = {
        a: {__dataID__: 'a'},
      };
      const scheduler = jest.fn();
      const {garbageCollector} = createGC(records, scheduler);
      garbageCollector.register('a');
      garbageCollector.incrementReferenceCount('a');
      garbageCollector.collectFromNode('a');
      expect(scheduler).not.toBeCalled();
    });

    it('does not call scheduler if no collections are enqueued', () => {
      const records = {
        a: {__dataID__: 'a'},
      };
      const scheduler = jest.fn();
      const {garbageCollector} = createGC(records, scheduler);
      garbageCollector.register('a');

      const {release} = garbageCollector.acquireHold();
      release();
      expect(scheduler).not.toBeCalled();
    });

    it('calls the injected scheduler and collects one record at a time', () => {
      const records = {
        a: {
          __dataID__: 'a',
          field: {__dataID__: 'b'},
        },
        b: {
          __dataID__: 'b',
          field: {__dataID__: 'c'},
        },
        c: {
          __dataID__: 'c',
          field: {__dataID__: 'd'},
        },
        d: {
          __dataID__: 'd',
        },
      };
      let run = null;
      const {garbageCollector, storeData} = createGC(records, _run => {
        run = _run;
      });
      garbageCollector.register('a');
      garbageCollector.register('b');
      garbageCollector.register('c');
      garbageCollector.register('d');

      garbageCollector.collectFromNode('a', 1);
      jest.runAllTimers();
      expect(storeData.getNodeData()).toEqual(records);
      expect(run()).toBe(true);
      expect(storeData.getNodeData()).toEqual({
        b: records.b,
        c: records.c,
        d: records.d,
      });
      expect(run()).toBe(true);
      expect(storeData.getNodeData()).toEqual({
        c: records.c,
        d: records.d,
      });
      expect(run()).toBe(true);
      expect(storeData.getNodeData()).toEqual({
        d: records.d,
      });
      expect(run()).toBe(false);
      expect(storeData.getNodeData()).toEqual({});
    });

    it('does not overlap collections', () => {
      const records = {
        a: {__dataID__: 'a'},
        b: {__dataID__: 'b'},
      };
      let run = null;
      const scheduler = jest.fn(_run => {
        run = _run;
      });
      const {garbageCollector} = createGC(records, scheduler);
      garbageCollector.register('a');
      garbageCollector.register('b');
      garbageCollector.collectFromNode('a');
      garbageCollector.collectFromNode('a');
      jest.runAllTimers();
      expect(scheduler.mock.calls.length).toBe(1);
      run();
      run(); // 'a' is enqueued twice
      scheduler.mockClear();
      garbageCollector.collectFromNode('b');
      jest.runAllTimers();
      jest.runAllTimers();
      expect(scheduler.mock.calls.length).toBe(1);
    });
  });

  describe('interaction with query tracking', () => {
    let garbageCollector;
    let records;
    let storeData;

    beforeEach(() => {
      records = {
        foo: {__dataID__: 'foo'},
      };
      ({garbageCollector, storeData} = createGC(records));
      garbageCollector.register('foo');
    });

    it('marks nodes as untracked when collected', () => {
      const tracker = storeData.getQueryTracker();
      tracker.untrackNodesForID = jest.fn();
      garbageCollector.collectFromNode('foo');
      jest.runAllTimers();
      expect(tracker.untrackNodesForID.mock.calls).toEqual([['foo']]);
    });

    it('behaves gracefully in the absence of a query tracker', () => {
      storeData.injectQueryTracker(null);
      expect(() => {
        garbageCollector.collectFromNode('foo');
        jest.runAllTimers();
      }).not.toThrow();
    });
  });
});

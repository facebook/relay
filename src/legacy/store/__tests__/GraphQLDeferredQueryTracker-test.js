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

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

jest.dontMock('GraphQLDeferredQueryTracker');

var GraphQLDeferredQueryTracker = require('GraphQLDeferredQueryTracker');
var Relay = require('Relay');
var RelayStoreData = require('RelayStoreData');
var flattenSplitRelayQueries = require('flattenSplitRelayQueries');
var splitDeferredRelayQueries = require('splitDeferredRelayQueries');

describe('GraphQLDeferredQueryTracker', () => {
  var {defer, getNode} = RelayTestUtils;

  var recordStore;
  var queryTracker;

  function splitQueries(query) {
    return flattenSplitRelayQueries(splitDeferredRelayQueries(query));
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    recordStore = RelayStoreData.getDefaultInstance().getRecordStore();
    queryTracker = new GraphQLDeferredQueryTracker(recordStore);
  });

  it('should fire callbacks when deferred data fails', () => {
    var mockFragment = Relay.QL`fragment on Node{name}`;
    var mockQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${defer(mockFragment)},
        }
      }
    `);
    var split = splitQueries(mockQuery);
    var mockDeferred = split[1];
    var dataID = '4';
    var fragmentID = getNode(mockFragment).getFragmentID();
    var onSuccess = jest.genMockFunction();
    var onFailure = jest.genMockFunction();

    queryTracker.addListenerForFragment(
      dataID,
      fragmentID,
      {
        onSuccess: onSuccess,
        onFailure: onFailure,
      }
    );
    queryTracker.recordQuery(mockDeferred);
    expect(onFailure).not.toBeCalled();

    var error = new Error();
    queryTracker.rejectQuery(mockDeferred, error);
    jest.runAllTimers();
    expect(onFailure).toBeCalled();
    expect(onFailure).toBeCalledWith(dataID, fragmentID, error);
    expect(onSuccess).not.toBeCalled();
  });

  it('should fire callbacks when deferred data resolves', () => {
    var mockFragment = Relay.QL`fragment on Node{name}`;
    var mockQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${defer(mockFragment)},
        }
      }
    `);
    var split = splitQueries(mockQuery);
    var mockDeferred = split[1];
    var dataID = '4';
    var fragmentID = getNode(mockFragment).getFragmentID();
    var onSuccess = jest.genMockFunction();
    var onFailure = jest.genMockFunction();

    queryTracker.addListenerForFragment(
      dataID,
      fragmentID,
      {
        onSuccess: onSuccess,
      }
    );
    queryTracker.recordQuery(mockDeferred);
    expect(onSuccess).not.toBeCalled();

    queryTracker.resolveQuery(mockDeferred);
    jest.runAllTimers();
    expect(onSuccess).toBeCalledWith(dataID, fragmentID);
    expect(onFailure).not.toBeCalled();
  });

  it('should not fire removed callbacks', () => {
    var mockFragment = Relay.QL`fragment on Node{name}`;
    var mockQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${defer(mockFragment)},
        }
      }
    `);
    var split = splitQueries(mockQuery);
    var mockDeferred = split[1];
    var dataID = '4';
    var fragmentID = getNode(mockFragment).getFragmentID();
    var onSuccess = jest.genMockFunction();
    var onFailure = jest.genMockFunction();

    var subscription = queryTracker.addListenerForFragment(
      dataID,
      fragmentID,
      {onSuccess, onFailure}
    );
    subscription.remove();
    queryTracker.recordQuery(mockDeferred);

    queryTracker.resolveQuery(mockDeferred);
    jest.runAllTimers();
    expect(onSuccess).not.toBeCalled();
    expect(onFailure).not.toBeCalled();
  });

  it('can only remove callback subscriptions once', () => {
    var onSuccess = jest.genMockFunction();
    var onFailure = jest.genMockFunction();
    var subscription = queryTracker.addListenerForFragment(
      '842472',
      'fragmentID',
      {onSuccess, onFailure}
    );
    subscription.remove();
    expect(() => subscription.remove()).toThrow();
  });

  it('should have a pending query if deferred query matches', () => {
    var mockFragment = Relay.QL`fragment on Node{name}`;
    var mockQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${defer(mockFragment)},
        }
      }
    `);
    var split = splitQueries(mockQuery);
    var mockDeferred = split[1];

    var dataID = '4';
    var fragmentID = getNode(mockFragment).getFragmentID();
    queryTracker.recordQuery(mockDeferred);
    expect(
      queryTracker.isQueryPending(dataID, fragmentID)
    ).toBe(true);

    queryTracker.resolveQuery(mockDeferred);
    expect(
      queryTracker.isQueryPending(dataID, fragmentID)
    ).toBe(false);
  });

  it('should not have a pending query if required query matches', () => {
    var mockFragment = Relay.QL`fragment on Node{name}`;
    var mockQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${mockFragment},
        }
      }
    `);
    var split = splitQueries(mockQuery);

    var dataID = '4';
    var fragmentID = getNode(mockFragment).getFragmentID();
    queryTracker.recordQuery(split[0]);
    expect(
      queryTracker.isQueryPending(dataID, fragmentID)
    ).toBe(false);

    queryTracker.resolveQuery(split[0]);
    expect(
      queryTracker.isQueryPending(dataID, fragmentID)
    ).toBe(false);
  });

  describe('deferred query with unknown ids for root call', () => {
    it('returns the correct pending status when parent query resolves', () => {
      var mockFragment = Relay.QL`fragment on Node{name}`;
      var mockQuery = getNode(Relay.QL`
        query {
          me {
            id,
            ${defer(mockFragment)},
          }
        }
      `);
      var split = splitQueries(mockQuery);
      var mockRequired = split[0];
      var mockDeferred = split[1];

      var dataID = '4';
      var fragmentID = getNode(mockFragment).getFragmentID();
      queryTracker.recordQuery(mockRequired);
      queryTracker.recordQuery(mockDeferred);

      // `isQueryPending` can only be used when the dataID is known. the dataID
      // of `me()` is unknown so the pending status is undetermined:
      // the tracker returns false because the id does not match a known query.
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);

      // resolving the parent query allows the tracker to determine the ID of
      // the unresolved deferred query
      recordStore.putDataID('me', null, dataID);
      queryTracker.resolveQuery(mockRequired);
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(true);

      queryTracker.resolveQuery(mockDeferred);
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);
    });

    it('returns the correct pending status when parent query fails', () => {
      var mockFragment = Relay.QL`fragment on Node{name}`;
      var mockQuery = getNode(Relay.QL`
        query {
          me {
            id,
            ${defer(mockFragment)},
          }
        }
      `);
      var split = splitQueries(mockQuery);
      var mockRequired = split[0];
      var mockDeferred = split[1];

      var dataID = '4';
      var fragmentID = getNode(mockFragment).getFragmentID();
      queryTracker.recordQuery(mockRequired);
      queryTracker.recordQuery(mockDeferred);

      // if the parent query fails the root call id is unresolved; the deferred
      // query's status cannot be determined and defaults to false
      // because the dataID/fragmentID cannot be matched to any pending
      // queries.
      queryTracker.rejectQuery(mockRequired, new Error('wtf'));
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);

      // the root call ID can also be resolved via the deferred query,
      // and we now know that the query is not pending.
      recordStore.putDataID('me', null, dataID);
      queryTracker.resolveQuery(mockDeferred);
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);
    });

    it(
      'returns the correct pending status when a parent resolves after the ' +
      'child query',
      () => {
        var mockFragment = Relay.QL`fragment on Node{name}`;
        var mockQuery = getNode(Relay.QL`
          query {
            me {
              id,
              ${defer(mockFragment)},
            }
          }
        `);
        var split = splitQueries(mockQuery);
        var mockRequired = split[0];
        var mockDeferred = split[1];

        var dataID = '4';

        var fragmentID = getNode(mockFragment).getFragmentID();
        queryTracker.recordQuery(mockRequired);
        queryTracker.recordQuery(mockDeferred);

        queryTracker.rejectQuery(mockDeferred, new Error('wtf'));
        recordStore.putDataID('me', null, dataID);
        queryTracker.resolveQuery(mockRequired);

        // deferred query should not be considered pending
        expect(
          queryTracker.isQueryPending(dataID, fragmentID)
        ).toBe(false);
      }
    );
  });

  describe('deferred query with ref params', () => {
    it('returns the correct pending status when parent query resolves', () => {
      var mockFragment = Relay.QL`fragment on Page{backgroundImage{uri}}`;
      var mockQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            name,
            hometown {
              ${defer(mockFragment)},
            },
          }
        }
      `);
      var split = splitQueries(mockQuery);
      var mockRequired = split[0];
      var mockDeferred = split[1];

      var dataID = 'pageID';
      var fragmentID = getNode(mockFragment).getFragmentID();
      queryTracker.recordQuery(mockRequired);
      queryTracker.recordQuery(mockDeferred);

      // `isQueryPending` can only be used when the dataID is known. the dataID
      // of `me()` is unknown so the pending status is undetermined:
      // the tracker returns false because the id does not match a known query.
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);

      // resolving the parent query allows the tracker to determine the ID of
      // the unresolved deferred query
      var response = {'4': {hometown: {id: dataID}}};
      queryTracker.resolveQuery(mockRequired, response);
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(true);

      queryTracker.resolveQuery(
        mockDeferred,
        null,
        {ref_q1: dataID}
      );
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);
    });

    it('returns the correct pending status when parent query fails', () => {
      var mockFragment = Relay.QL`fragment on Page{backgroundImage{uri}}`;
      var mockQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            name,
            hometown {
              ${defer(mockFragment)},
            },
          }
        }
      `);
      var split = splitQueries(mockQuery);
      var mockRequired = split[0];
      var mockDeferred = split[1];

      var dataID = 'pageID';
      var fragmentID = getNode(mockFragment).getFragmentID();
      queryTracker.recordQuery(mockRequired);
      queryTracker.recordQuery(mockDeferred);

      // if the parent query fails the root call id is unresolved; the deferred
      // query's status cannot be determined and defaults to false
      // because the dataID/fragmentID cannot be matched to any pending
      // queries.
      queryTracker.rejectQuery(mockRequired, new Error('wtf'));
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);

      // the child probably will not be remapped if the parent failed. Even if
      // the response somehow comes back, we will still think it is pending.
      queryTracker.resolveQuery(
        mockDeferred,
        null,
        {ref_q1: dataID}
      );
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);
    });
  });

  it(
    'returns the correct pending status when query is recorded after ' +
    'rootcall is associated with an id',
    () => {
      var mockFragment = Relay.QL`fragment on Node{name}`;
      var mockQuery = getNode(Relay.QL`
        query {
          me {
            id,
            ${defer(mockFragment)},
          }
        }
      `);
      var split = splitQueries(mockQuery);
      var mockDeferred = split[1];

      var dataID = '4';
      recordStore.putDataID('me', null, dataID);

      var fragmentID = getNode(mockFragment).getFragmentID();
      queryTracker.recordQuery(mockDeferred);

      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(true);

      queryTracker.resolveQuery(mockDeferred);
      expect(
        queryTracker.isQueryPending(dataID, fragmentID)
      ).toBe(false);
    }
  );
});

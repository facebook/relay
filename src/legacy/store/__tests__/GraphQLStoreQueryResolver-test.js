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

jest.dontMock('GraphQLStoreQueryResolver');

var Relay = require('Relay');
var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
var readRelayQueryData = require('readRelayQueryData');
var RelayStoreData = require('RelayStoreData');
var RelayStoreGarbageCollector = require('RelayStoreGarbageCollector');

describe('GraphQLStoreQueryResolver', () => {
  var mockCallback;
  var mockQueryFragment;
  var mockPluralQueryFragment;

  var {getNode} = RelayTestUtils;

  function mockReader(mockResult) {
    readRelayQueryData.mockImplementation((_, __, dataID) => {
      return {
        dataIDs: {[dataID]: true},
        data: mockResult[dataID],
      };
    });
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    mockCallback = jest.genMockFunction();
    mockQueryFragment = getNode(Relay.QL`fragment on Node{id,name}`);
    mockPluralQueryFragment = getNode(Relay.QL`
      fragment on Node @relay(plural:true) {
        id,
        name,
      }
    `);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('should resolve a pointer', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      '1038750002',
      mockQueryFragment
    );
    var mockResult = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    readRelayQueryData.mockReturnValue({data: mockResult});

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer, mockCallback);
    var resolved = resolver.resolve(fragmentPointer);

    expect(resolved).toBe(mockResult);

    expect(readRelayQueryData).toBeCalled();
    expect(readRelayQueryData.mock.calls[0][1]).toBe(mockQueryFragment);
    expect(readRelayQueryData.mock.calls[0][2]).toEqual(
      fragmentPointer.getDataID()
    );
  });

  it('should subscribe to IDs in resolved pointer', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      '1038750002',
      mockQueryFragment
    );
    var mockResult = {
      '1038750002': {__dataID__: '1038750002', id: '1038750002', name: 'Tim'},
    };
    mockReader(mockResult);

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );
    resolver.resolve(fragmentPointer);

    var addListenersForIDs = GraphQLStoreChangeEmitter.addListenerForIDs;
    expect(addListenersForIDs).toBeCalled();
    expect(addListenersForIDs.mock.calls[0][0]).toEqual(['1038750002']);
  });

  it('should not re-resolve pointers without change events', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      '1038750002',
      mockQueryFragment
    );
    var mockResultA = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    var mockResultB = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    readRelayQueryData.mockReturnValue({data: mockResultA});
    var resolvedA = resolver.resolve(fragmentPointer);

    readRelayQueryData.mockReturnValue({data: mockResultB});
    var resolvedB = resolver.resolve(fragmentPointer);

    expect(readRelayQueryData.mock.calls.length).toBe(1);
    expect(resolvedA).toBe(resolvedB);
  });

  it('should re-resolve pointers with change events', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      '1038750002',
      mockQueryFragment
    );
    var mockResultA = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    var mockResultB = {__dataID__: '1038750002', id: '1038750002', name: 'Tee'};

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    mockReader({
      [mockResultA.id]: mockResultA
    });
    var resolvedA = resolver.resolve(fragmentPointer);

    var callback = GraphQLStoreChangeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1038750002']);

    mockReader({
      [mockResultB.id]: mockResultB
    });
    var resolvedB = resolver.resolve(fragmentPointer);

    expect(readRelayQueryData.mock.calls.length).toBe(2);
    expect(resolvedA).toBe(mockResultA);
    expect(resolvedB).toBe(mockResultB);
  });

  it('should re-resolve pointers whose calls differ', () => {
    var fragmentPointerA = new GraphQLFragmentPointer(
      'client:123_first(10)',
      mockQueryFragment
    );
    var fragmentPointerB = new GraphQLFragmentPointer(
      'client:123_first(20)',
      mockQueryFragment
    );

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointerA,
      mockCallback
    );

    require('GraphQLStoreRangeUtils').getCanonicalClientID =
      // The canonical ID of a range customarily excludes the calls
      jest.genMockFunction().mockReturnValue('client:123');

    resolver.resolve(fragmentPointerA);
    resolver.resolve(fragmentPointerB);

    expect(readRelayQueryData.mock.calls.length).toBe(2);
  });

  it('should invoke the callback when change events fire', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      '1038750002',
      mockQueryFragment
    );
    var mockResult = {
      '1038750002': {__dataID__: '1038750002', id: '1038750002', name: 'Tim'},
    };

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    mockReader(mockResult);
    resolver.resolve(fragmentPointer);

    var callback = GraphQLStoreChangeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1038750002']);

    expect(mockCallback).toBeCalled();
  });

  it('should resolve an array of pointers', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      ['1', '2'],
      mockPluralQueryFragment
    );
    var mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'}
    };
    mockReader(mockResults);

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    var resolved = resolver.resolve(fragmentPointer);
    expect(resolved.length).toBe(2);
    expect(resolved[0]).toBe(mockResults['1']);
    expect(resolved[1]).toBe(mockResults['2']);

    expect(readRelayQueryData.mock.calls[0][2]).toEqual(
      fragmentPointer.getDataIDs()[0]
    );
    expect(readRelayQueryData.mock.calls[1][2]).toEqual(
      fragmentPointer.getDataIDs()[1]
    );
  });

  it('should not re-resolve if the pointer array has no changes', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      ['1', '2'],
      mockPluralQueryFragment
    );
    var mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'}
    };
    mockReader(mockResults);

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    var resolvedA = resolver.resolve(fragmentPointer);
    var resolvedB = resolver.resolve(fragmentPointer);

    expect(resolvedA).toBe(resolvedB);
  });

  it('should only re-resolve pointers with changes in an array', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      ['1', '2'],
      mockPluralQueryFragment
    );
    var mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'}
    };
    mockReader(mockResults);

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    var resolvedA = resolver.resolve(fragmentPointer);

    mockResults['1'] = {__dataID__: '1', name: 'Won'};
    var callback = GraphQLStoreChangeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1']);

    var resolvedB = resolver.resolve(fragmentPointer);

    expect(resolvedA).not.toBe(resolvedB);

    expect(resolvedB.length).toBe(2);
    expect(resolvedB[0]).toBe(mockResults['1']);
    expect(resolvedB[1]).toBe(mockResults['2']);

    expect(readRelayQueryData.mock.calls.length).toBe(3);
    expect(readRelayQueryData.mock.calls[2][2]).toEqual('1');
  });

  it('should create a new array if the pointer array shortens', () => {
    var fragmentPointer = new GraphQLFragmentPointer(
      ['1', '2'],
      mockPluralQueryFragment
    );
    var fragmentPointerB = new GraphQLFragmentPointer(
      ['1'],
      mockPluralQueryFragment
    );
    var mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'}
    };
    mockReader(mockResults);

    var resolver = new GraphQLStoreQueryResolver(
      fragmentPointer,
      mockCallback
    );

    var resolvedA = resolver.resolve(fragmentPointer);
    var resolvedB = resolver.resolve(fragmentPointerB);

    expect(resolvedA).not.toBe(resolvedB);

    expect(resolvedA.length).toBe(2);
    expect(resolvedB.length).toBe(1);
  });

  describe('garbage collection', () => {
    var garbageCollector;

    /**
     * Gets the first parameter passed into increaseSubscriptionsFor.
     */
    function getIncreaseSubscriptionsParameters(count) {
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls.length
      ).toBe(count);
      return garbageCollector.increaseSubscriptionsFor.mock.calls.map(
        call => call[0]
      ).sort();
    }

    /**
     * Gets the first parameter passed into decreaseSubscriptionsFor.
     */
    function getDecreaseSubscriptionsParameters(count) {
      expect(
        garbageCollector.decreaseSubscriptionsFor.mock.calls.length
      ).toBe(count);
      return garbageCollector.decreaseSubscriptionsFor.mock.calls.map(
        call => call[0]
      ).sort();
    }

    beforeEach(() => {
      // Prepare mock garbage collector and mock observable
      garbageCollector = new RelayStoreGarbageCollector();

      RelayStoreData.prototype.getGarbageCollector =
        jest.genMockFunction().mockReturnValue(garbageCollector);

      mockQueryFragment = getNode(Relay.QL`
        fragment on User {
          birthdate {
            day,
          },
          address {
            city
          },
        }
      `);
    });

    it('should adjust subscription-count in the garbage collector', () => {
      var fragmentPointer = new GraphQLFragmentPointer(
        'chris',
        mockQueryFragment
      );
      var mockResult = {
        __dataID__: 'chris',
        address: {__dataID__: 'address', city: 'menlo park'},
      };
      readRelayQueryData.mockReturnValue({
        data: mockResult,
        dataIDs: { chris: true, address: true },
      });

      var resolver = new GraphQLStoreQueryResolver(
        fragmentPointer,
        mockCallback
      );

      // Resolve the fragment pointer with the mocked data
      resolver.resolve(fragmentPointer);
      var callback =
        GraphQLStoreChangeEmitter.addListenerForIDs.mock.calls[0][1];
      // On first resolve we get data for all added ids
      expect(getIncreaseSubscriptionsParameters(2)).toEqual([
        'address', 'chris'
      ]);

      // New mock data for the resolve
      mockResult = {
        __dataID__: 'chris',
        birthdate: {__dataID__: 'date', day: 15},
      };
      readRelayQueryData.mockReturnValue({
        data: mockResult,
        dataIDs: { chris: true, date: true },
      });
      // Notify resolve that data has changed
      callback(['chris']);

      // We called this twice before, for chris and ship
      resolver.resolve(fragmentPointer);
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls.length
      ).toBe(3);
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls[2][0]
      ).toBe('date');
      expect(getDecreaseSubscriptionsParameters(1)).toEqual(['address']);
    });
  });
});

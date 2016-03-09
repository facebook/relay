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
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .dontMock('GraphQLStoreQueryResolver');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const Relay = require('Relay');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('readRelayQueryData');
const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('GraphQLStoreQueryResolver', () => {
  let changeEmitter;
  let storeData;

  let dataID;
  let mockCallback;
  let mockQueryFragment;
  let mockPluralQueryFragment;

  const {getNode} = RelayTestUtils;

  function mockReader(mockResult) {
    readRelayQueryData.mockImplementation((_, __, dataIDArg) => {
      return {
        dataIDs: {[dataIDArg]: true},
        data: mockResult[dataIDArg],
      };
    });
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    storeData = new RelayStoreData();
    changeEmitter = storeData.getChangeEmitter();

    dataID = '1038750002';
    mockCallback = jest.genMockFunction();
    mockQueryFragment = getNode(Relay.QL`fragment on Node{id,name}`);
    mockPluralQueryFragment = getNode(Relay.QL`
      fragment on Node @relay(plural:true) {
        id,
        name,
      }
    `);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('should resolve a pointer', () => {
    const mockResult = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    readRelayQueryData.mockReturnValue({data: mockResult});

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );
    const resolved = resolver.resolve(mockQueryFragment, dataID);

    expect(resolved).toBe(mockResult);

    expect(readRelayQueryData).toBeCalled();
    expect(readRelayQueryData.mock.calls[0][1]).toBe(mockQueryFragment);
    expect(readRelayQueryData.mock.calls[0][2]).toEqual(dataID);
  });

  it('should subscribe to IDs in resolved pointer', () => {
    const mockResult = {
      '1038750002': {__dataID__: '1038750002', id: '1038750002', name: 'Tim'},
    };
    mockReader(mockResult);

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );
    resolver.resolve(mockQueryFragment, dataID);

    const addListenersForIDs = changeEmitter.addListenerForIDs;
    expect(addListenersForIDs).toBeCalled();
    expect(addListenersForIDs.mock.calls[0][0]).toEqual(['1038750002']);
  });

  it('should not re-resolve pointers without change events', () => {
    const mockResultA = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    const mockResultB = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );

    readRelayQueryData.mockReturnValue({data: mockResultA});
    const resolvedA = resolver.resolve(mockQueryFragment, dataID);

    readRelayQueryData.mockReturnValue({data: mockResultB});
    const resolvedB = resolver.resolve(mockQueryFragment, dataID);

    expect(readRelayQueryData.mock.calls.length).toBe(1);
    expect(resolvedA).toBe(resolvedB);
  });

  it('should re-resolve pointers with change events', () => {
    const mockResultA = {__dataID__: '1038750002', id: '1038750002', name: 'Tim'};
    const mockResultB = {__dataID__: '1038750002', id: '1038750002', name: 'Tee'};

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );

    mockReader({
      [mockResultA.id]: mockResultA,
    });
    const resolvedA = resolver.resolve(mockQueryFragment, dataID);

    const callback = changeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1038750002']);

    mockReader({
      [mockResultB.id]: mockResultB,
    });
    const resolvedB = resolver.resolve(mockQueryFragment, dataID);

    expect(readRelayQueryData.mock.calls.length).toBe(2);
    expect(resolvedA).toBe(mockResultA);
    expect(resolvedB).toBe(mockResultB);
  });

  it('should re-resolve pointers whose calls differ', () => {
    const dataIDA = 'client:123_first(10)';
    const dataIDB = 'client:123_first(20)';

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );

    require('GraphQLStoreRangeUtils').getCanonicalClientID =
      // The canonical ID of a range customarily excludes the calls
      jest.genMockFunction().mockReturnValue('client:123');

    resolver.resolve(mockQueryFragment, dataIDA);
    resolver.resolve(mockQueryFragment, dataIDB);

    expect(readRelayQueryData.mock.calls.length).toBe(2);
  });

  it('should invoke the callback when change events fire', () => {
    const mockResult = {
      '1038750002': {__dataID__: '1038750002', id: '1038750002', name: 'Tim'},
    };

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback
    );

    mockReader(mockResult);
    resolver.resolve(mockQueryFragment, dataID);

    const callback = changeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1038750002']);

    expect(mockCallback).toBeCalled();
  });

  it('should resolve an array of pointers', () => {
    const mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'},
    };
    mockReader(mockResults);

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockPluralQueryFragment,
      mockCallback
    );

    const resolved = resolver.resolve(mockPluralQueryFragment, ['1', '2']);
    expect(resolved.length).toBe(2);
    expect(resolved[0]).toBe(mockResults['1']);
    expect(resolved[1]).toBe(mockResults['2']);

    expect(readRelayQueryData.mock.calls[0][2]).toEqual('1');
    expect(readRelayQueryData.mock.calls[1][2]).toEqual('2');
  });

  it('should not re-resolve if the pointer array has no changes', () => {
    const mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'},
    };
    mockReader(mockResults);

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockPluralQueryFragment,
      mockCallback
    );

    const resolvedA = resolver.resolve(mockPluralQueryFragment, ['1', '2']);
    const resolvedB = resolver.resolve(mockPluralQueryFragment, ['1', '2']);

    expect(resolvedA).toBe(resolvedB);
  });

  it('should only re-resolve pointers with changes in an array', () => {
    const mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'},
    };
    mockReader(mockResults);

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockPluralQueryFragment,
      mockCallback
    );

    const resolvedA = resolver.resolve(mockPluralQueryFragment, ['1', '2']);

    mockResults['1'] = {__dataID__: '1', name: 'Won'};
    const callback = changeEmitter.addListenerForIDs.mock.calls[0][1];
    callback(['1']);

    const resolvedB = resolver.resolve(mockPluralQueryFragment, ['1', '2']);

    expect(resolvedA).not.toBe(resolvedB);

    expect(resolvedB.length).toBe(2);
    expect(resolvedB[0]).toBe(mockResults['1']);
    expect(resolvedB[1]).toBe(mockResults['2']);

    expect(readRelayQueryData.mock.calls.length).toBe(3);
    expect(readRelayQueryData.mock.calls[2][2]).toEqual('1');
  });

  it('should create a new array if the pointer array shortens', () => {
    const mockResults = {
      '1': {__dataID__: '1', name: 'One'},
      '2': {__dataID__: '2', name: 'Two'},
    };
    mockReader(mockResults);

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockPluralQueryFragment,
      mockCallback
    );

    const resolvedA = resolver.resolve(mockPluralQueryFragment, ['1', '2']);
    const resolvedB = resolver.resolve(mockPluralQueryFragment, ['1']);

    expect(resolvedA).not.toBe(resolvedB);

    expect(resolvedA.length).toBe(2);
    expect(resolvedB.length).toBe(1);
  });

  describe('garbage collection', () => {
    let fragment;

    beforeEach(() => {
      storeData.initializeGarbageCollector(run => {
        while (run()) {}
      });
      const containerFragment = RelayTestUtils.createContainerFragment(Relay.QL`
        fragment on NewsFeedConnection {
          edges {
            node {
              id
            }
          }
        }
      `);
      const concreteFragment = Relay.QL`
        fragment on Viewer {
          actor {
            id
          }
          newsFeed(first: "1") {
            ${containerFragment}
          }
        }
      `;
      const query = getNode(Relay.QL`
        query {
          viewer {
            ${concreteFragment}
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            __typename: 'User',
            id: '123',
          },
          newsFeed: {
            edges: [
              {
                node: {
                  __typename: 'Story',
                  id: '456',
                },
              },
            ],
          },
        },
      };
      storeData.handleQueryPayload(
        query,
        transformRelayQueryPayload(query, payload),
        1
      );
      dataID = 'client:1';
      fragment = getNode(concreteFragment);
    });

    it('increments references to read data', () => {
      const queryResolver = new GraphQLStoreQueryResolver(
        storeData,
        fragment,
        jest.genMockFunction()
      );
      // read data and set up subscriptions
      queryResolver.resolve(fragment, dataID);
      // evict unreferenced nodes
      storeData.getGarbageCollector().collect();
      jest.runAllTimers();
      // nodes referenced by the fragment should not be evicted
      expect(Object.keys(storeData.getNodeData())).toEqual([
        '123',      // viewer.actor
        'client:1', // viewer
        'client:2', // viewer.newsFeed
      ]);
    });

    it('decrements references to previously read fields', () => {
      const queryResolver = new GraphQLStoreQueryResolver(
        storeData,
        fragment,
        jest.genMockFunction()
      );
      // read data and increment GC ref counts
      queryResolver.resolve(fragment, dataID);
      const callback =
        storeData.getChangeEmitter().addListenerForIDs.mock.calls[0][1];

      // Remove the link to viewer.actor and broadcast an update
      storeData.getRecordWriter().putField('client:1', 'actor', null);
      storeData.getRecordWriter().putField('client:1', 'newsFeed', null);
      callback(['client:1']);

      // re-read and increment/decrement GC ref counts
      queryResolver.resolve(fragment, dataID);

      // evict unreferenced nodes
      storeData.getGarbageCollector().collect();
      jest.runAllTimers();
      // nodes referenced by the fragment should not be evicted
      expect(Object.keys(storeData.getNodeData())).toEqual([
        // '123' (actor) is unreferenced and collected
        // 'client:2' (viewer.newsFeed) is unreferenced and collected
        'client:1', // viewer
      ]);
    });

    it('decrements references when disposed', () => {
      const queryResolver = new GraphQLStoreQueryResolver(
        storeData,
        fragment,
        jest.genMockFunction()
      );
      // read data and increment GC ref counts
      queryResolver.resolve(fragment, dataID);
      // reset the resolver; should unreference all nodes
      queryResolver.dispose();

      // evict unreferenced nodes
      storeData.getGarbageCollector().collect();
      jest.runAllTimers();
      // all nodes are unreferenced and should be removed
      expect(storeData.getNodeData()).toEqual({});
    });
  });
});

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest
  .mock('../../../store/readRelayQueryData')
  .mock('../GraphQLStoreChangeEmitter')
  .useFakeTimers();

const GraphQLStoreQueryResolver = require('../GraphQLStoreQueryResolver');
const RelayClassic = require('../../../RelayPublic');
const RelayStoreData = require('../../../store/RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('../../../store/readRelayQueryData');

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
    jest.resetModules();

    storeData = new RelayStoreData();
    changeEmitter = storeData.getChangeEmitter();

    dataID = '1038750002';
    mockCallback = jest.fn();
    mockQueryFragment = getNode(RelayClassic.QL`fragment on Node{id,name}`);
    mockPluralQueryFragment = getNode(
      RelayClassic.QL`
      fragment on Node @relay(plural:true) {
        id
        name
      }
    `,
    );

    expect.extend(RelayTestUtils.matchers);
  });

  it('should resolve a pointer', () => {
    const mockResult = {
      __dataID__: '1038750002',
      id: '1038750002',
      name: 'Tim',
    };
    readRelayQueryData.mockReturnValue({data: mockResult});

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback,
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
      mockCallback,
    );
    resolver.resolve(mockQueryFragment, dataID);

    const addListenersForIDs = changeEmitter.addListenerForIDs;
    expect(addListenersForIDs).toBeCalled();
    expect(addListenersForIDs.mock.calls[0][0]).toEqual(['1038750002']);
  });

  it('should not re-resolve pointers without change events', () => {
    const mockResultA = {
      __dataID__: '1038750002',
      id: '1038750002',
      name: 'Tim',
    };
    const mockResultB = {
      __dataID__: '1038750002',
      id: '1038750002',
      name: 'Tim',
    };

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback,
    );

    readRelayQueryData.mockReturnValue({data: mockResultA});
    const resolvedA = resolver.resolve(mockQueryFragment, dataID);

    readRelayQueryData.mockReturnValue({data: mockResultB});
    const resolvedB = resolver.resolve(mockQueryFragment, dataID);

    expect(readRelayQueryData.mock.calls.length).toBe(1);
    expect(resolvedA).toBe(resolvedB);
  });

  it('should re-resolve pointers with change events', () => {
    const mockResultA = {
      __dataID__: '1038750002',
      id: '1038750002',
      name: 'Tim',
    };
    const mockResultB = {
      __dataID__: '1038750002',
      id: '1038750002',
      name: 'Tee',
    };

    const resolver = new GraphQLStoreQueryResolver(
      storeData,
      mockQueryFragment,
      mockCallback,
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
      mockCallback,
    );

    require('../GraphQLStoreRangeUtils').getCanonicalClientID =
      // The canonical ID of a range customarily excludes the calls
      jest.fn(() => 'client:123');

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
      mockCallback,
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
      mockCallback,
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
      mockCallback,
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
      mockCallback,
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
      mockCallback,
    );

    const resolvedA = resolver.resolve(mockPluralQueryFragment, ['1', '2']);
    const resolvedB = resolver.resolve(mockPluralQueryFragment, ['1']);

    expect(resolvedA).not.toBe(resolvedB);

    expect(resolvedA.length).toBe(2);
    expect(resolvedB.length).toBe(1);
  });
});

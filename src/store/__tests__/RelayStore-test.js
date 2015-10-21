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
  .dontMock('RelayStore')
  .dontMock('RelayStoreData');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var RelayQueryResultObservable = require('RelayQueryResultObservable');
var RelayStoreData = require('RelayStoreData');
var readRelayQueryData = require('readRelayQueryData');

describe('RelayStore', () => {
  var RelayStore;

  var filter;
  var dataIDs;
  var queries;
  var callback;
  var recordStore;
  var queryRunner;

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayStore = require('RelayStore');

    filter = () => true;
    dataIDs = ['feedback_id', 'likers_id'];
    queries = {};
    callback = jest.genMockFunction();
    queryRunner = RelayStoreData.getDefaultInstance().getQueryRunner();
    recordStore = RelayStoreData.getDefaultInstance().getRecordStore();
  });

  describe('primeCache', () => {
    it('invokes `GraphQLQueryRunner#run`', () => {
      RelayStore.primeCache(queries, callback);

      expect(queryRunner.run).toBeCalled();
      expect(queryRunner.run.mock.calls[0][0]).toBe(queries);
      expect(queryRunner.run.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('forceFetch', () => {
    it('invokes `GraphQLQueryRunner#forceFetch`', () => {
      RelayStore.forceFetch(queries, callback);

      expect(queryRunner.forceFetch).toBeCalled();
      expect(queryRunner.forceFetch.mock.calls[0][0]).toBe(queries);
      expect(queryRunner.forceFetch.mock.calls[0][1]).toBe(callback);
    });
  });

  describe('read', () => {
    it('invokes `readRelayQueryData`', () => {
      RelayStore.read(queries, dataIDs[0]);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][1]).toEqual(queries);
      expect(readRelayQueryData.mock.calls[0][2]).toBe(dataIDs[0]);
      expect(readRelayQueryData.mock.calls[0][3]).toBeUndefined();
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      RelayStore.read(queries, dataIDs[0], filter);
      expect(readRelayQueryData).toBeCalled();
      expect(readRelayQueryData.mock.calls[0][3]).toBe(filter);
    });
  });

  describe('readAll', () => {
    it('invokes `readRelayQueryData`', () => {
      RelayStore.readAll(queries, dataIDs);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      expect(readRelayQueryData.mock.calls.map(call => call[2])).toEqual(
        dataIDs
      );
    });

    it('invokes `readRelayQueryData` with a filter', () => {
      RelayStore.readAll(queries, dataIDs, filter);
      expect(readRelayQueryData.mock.calls.length).toBe(dataIDs.length);
      readRelayQueryData.mock.calls.forEach((call) => {
        expect(call[3]).toBe(filter);
      });
    });
  });

  describe('readQuery', () => {
    it('accepts a query with no arguments', () => {
      recordStore.putDataID('viewer', null, 'client:1');
      RelayStore.readQuery(getNode(Relay.QL`query{viewer{actor{id}}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(1);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('client:1');
    });

    it('accepts a query with arguments', () => {
      RelayStore.readQuery(getNode(Relay.QL`query{nodes(ids:["123","456"]){id}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(2);
      expect(readRelayQueryData.mock.calls[0][2]).toBe('123');
      expect(readRelayQueryData.mock.calls[1][2]).toBe('456');
    });

    it('accepts a query with unrecognized arguments', () => {
      var result = RelayStore.readQuery(getNode(Relay.QL`query{username(name:"foo"){id}}`));
      expect(readRelayQueryData.mock.calls.length).toBe(0);
      expect(result).toEqual([undefined]);
    });
  });

  describe('observe', () => {
    it('instantiates RelayQueryResultObservable', () => {
      var fragment = getNode(Relay.QL`
        fragment on Node {
          id
        }
      `);
      readRelayQueryData.mockReturnValue({
        data: {
          __dataID__: '123',
          id: '123',
        },
        dataIDs: ['123'],
      });

      var observer = RelayStore.observe(fragment, '123');
      var onNext = jest.genMockFunction();
      expect(observer instanceof RelayQueryResultObservable).toBe(true);
      observer.subscribe({onNext});
      expect(onNext).toBeCalledWith({
        __dataID__: '123',
        id: '123',
      });
    });
  });
});

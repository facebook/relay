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

const Relay = require('Relay');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayQueryWriter = require('RelayQueryWriter');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

const {getNode} = RelayTestUtils;

describe('RelayQueryWriter', () => {
  let changeTracker;
  let node;
  let path;
  let payload;
  let recordID;
  let recordWriter;
  let records;
  let store;

  beforeEach(() => {
    records = {};
    store = new RelayRecordStore({records});
    recordWriter = new RelayRecordWriter(records, {}, false);
    changeTracker = new RelayChangeTracker();
    node = getNode(Relay.QL`query { me }`);
    path = RelayQueryPath.create(node);
    payload = {
      __typename: 'User',
      id: '660361306',
    };
    recordID = '660361306';
  });

  describe('query tracking', () => {
    it('tracks a node upon creation', () => {
      const queryTracker = new RelayQueryTracker();
      const trackNodeForID = queryTracker.trackNodeForID = jest.fn();
      const queryWriter = new RelayQueryWriter(
        store,
        recordWriter,
        queryTracker,
        changeTracker,
      );
      queryWriter.createRecordIfMissing(node, recordID, path, payload);

      // The interesting bit:
      expect(trackNodeForID).toBeCalledWith(node, recordID);

      // Sanity check.
      expect(records).toEqual({
        [recordID]: {
          __dataID__: recordID,
          __typename: 'User',
        },
      });
    });

    it('degrades gracefully in the absence of a configured tracker', () => {
      const queryWriter = new RelayQueryWriter(
        store,
        recordWriter,
        null,
        changeTracker,
      );

      // The interesting bit:
      expect(() => {
        queryWriter.createRecordIfMissing(node, recordID, path, payload);
      }).not.toThrow();

      // Sanity check.
      expect(records).toEqual({
        [recordID]: {
          __dataID__: recordID,
          __typename: 'User',
        },
      });
    });
  });
});

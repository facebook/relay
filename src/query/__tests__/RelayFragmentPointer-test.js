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

jest.dontMock('RelayFragmentPointer');

const RelayFragmentPointer = require('RelayFragmentPointer');
const Relay = require('Relay');
const RelayRecord = require('RelayRecord');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayFragmentPointer', () => {
  var {getNode, getRefNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
    jasmine.addMatchers({
      toEqualPointer() {
        return {
          compare(actual, expected) {
            return {
              pass: actual.equals(expected),
            };
          },
        };
      },
    });
  });

  describe('createForRoot', () => {
    var recordStore;

    beforeEach(() => {
      var records = {};
      recordStore = new RelayRecordStore({records});
    });

    it('creates a wrapped fragment pointer', () => {
      var rootFragment = Relay.QL`fragment on Node{id}`;
      var root = getNode(Relay.QL`query{node(id:"123"){${rootFragment}}}`);

      var result = RelayFragmentPointer.createForRoot(recordStore, root);
      expect(result).toEqual({
        __dataID__: '123',
        __fragments__: {
          [getNode(rootFragment).getConcreteFragmentID()]: '123',
        },
      });
    });

    it('throws if multiple root fragments are present', () => {
      var rootFragmentA = Relay.QL`fragment on Node{id}`;
      var rootFragmentB = Relay.QL`fragment on Node{id}`;
      var root = getNode(Relay.QL`
        query {
          username(name:"foo"){${rootFragmentA},${rootFragmentB}}
        }
      `);

      expect(() => {
        RelayFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root should contain exactly one fragment ' +
        '(e.g. `${Component.getFragment(\'...\')}`). Query ' +
        '`RelayFragmentPointer` contains more than one fragment.'
      );
    });

    it('throws if non-fragments are present', () => {
      var root = getNode(Relay.QL`query{username(name:"foo"){name}}`);

      expect(() => {
        RelayFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root should contain exactly one fragment ' +
        'and no fields. Query `RelayFragmentPointer` contains a field, ' +
        '`name`. If you need to fetch fields, declare them in a Relay ' +
        'container.',
      );
    });

    it('throws for unknown ref queries', () => {
      var rootFragment = Relay.QL`fragment on Node{id}`;
      var root = getRefNode(
        Relay.QL`query{nodes(ids:$ref_q0){${rootFragment}}}`,
        {path: '$.*.id'}
      );

      expect(() => {
        RelayFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root cannot have batch call variables. ' +
        'Query `RelayFragmentPointer` has a batch call variable, `ref_q0`.'
      );
    });

    it('returns null when the root call was not fetched', () => {
      // When a root call is not fetched since it only contained empty
      // fragments, we shouldn't throw.
      var ref = Relay.QL`fragment on Viewer { actor { id } }`;
      var root = getNode(Relay.QL`query{viewer{${ref}}}`);

      expect(
        RelayFragmentPointer.createForRoot(recordStore, root)
      ).toBeNull();
    });
  });

  describe('addFragment()', () => {
    let dataID;
    let fragment;
    let pluralFragment;

    beforeEach(() => {
      dataID = '123';
      fragment = getNode(Relay.QL`fragment on Node { id }`);
      pluralFragment = getNode(
        Relay.QL`fragment on Node @relay(plural:true) { id }`
      );
    });

    it('adds singular fragments to pointer objects', () => {
      const record = RelayRecord.create(dataID);
      RelayFragmentPointer.addFragment(record, fragment, dataID);

      expect(record).toEqual({
        __dataID__: dataID,
        __fragments__: {
          [fragment.getConcreteFragmentID()]: dataID,
        },
      });
    });

    it('adds plural fragments to pointer objects', () => {
      const record = RelayRecord.create(dataID);
      RelayFragmentPointer.addFragment(record, pluralFragment, dataID);

      expect(record).toEqual({
        __dataID__: dataID,
        __fragments__: {
          [pluralFragment.getConcreteFragmentID()]: dataID,
        },
      });
    });
  });
});

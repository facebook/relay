/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

jest.unmock('RelayFragmentPointer');

const RelayFragmentPointer = require('RelayFragmentPointer');
const Relay = require('Relay');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayFragmentPointer', () => {
  const {getNode, getRefNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);
    expect.extend({
      toEqualPointer(actual, expected) {
        return {
          pass: actual.equals(expected),
        };
      },
    });
  });

  describe('create()', () => {
    const dataID = '123';

    it('creates a fragment prop for a singular fragment', () => {
      const fragment = getNode(Relay.QL`fragment on Node { id }`);
      const fragmentProp = RelayFragmentPointer.create(dataID, fragment);
      expect(fragmentProp).toEqual({
        __dataID__: dataID,
        __fragments__: {
          [fragment.getConcreteFragmentID()]: [{}],
        },
      });
    });

    it('adds plural fragments to objects', () => {
      const pluralFragment = getNode(
        Relay.QL`fragment on Node @relay(plural:true) { id }`,
      );
      const fragmentProp = RelayFragmentPointer.create(dataID, pluralFragment);
      expect(fragmentProp).toEqual({
        __dataID__: dataID,
        __fragments__: {
          [pluralFragment.getConcreteFragmentID()]: [{}],
        },
      });
    });

    it('distinguishes fragments with different variables', () => {
      const fragment = Relay.QL`fragment on Node { id }`;
      const fragment1 = getNode(fragment, {foo: 'bar'});
      const fragment2 = getNode(fragment, {sizes: [42]});
      const fragmentProp = RelayFragmentPointer.create(dataID, fragment1);
      RelayFragmentPointer.addFragment(fragmentProp, fragment2, dataID);
      expect(fragmentProp).toEqual({
        __dataID__: dataID,
        __fragments__: {
          [fragment1.getConcreteFragmentID()]: [{foo: 'bar'}, {sizes: [42]}],
        },
      });
    });
  });

  describe('createForRoot', () => {
    let recordStore;

    beforeEach(() => {
      const records = {};
      recordStore = new RelayRecordStore({records});
    });

    it('creates a wrapped fragment pointer', () => {
      const rootFragment = Relay.QL`fragment on Node{id}`;
      const root = getNode(Relay.QL`query{node(id:"123"){${rootFragment}}}`);

      const result = RelayFragmentPointer.createForRoot(recordStore, root);
      expect(result).toEqual({
        __dataID__: '123',
        __fragments__: {
          [getNode(rootFragment).getConcreteFragmentID()]: [{}],
        },
      });
    });

    it('throws if multiple root fragments are present', () => {
      const rootFragmentA = Relay.QL`fragment on Node{id}`;
      const rootFragmentB = Relay.QL`fragment on Node{id}`;
      const root = getNode(
        Relay.QL`
        query {
          username(name:"foo"){${rootFragmentA},${rootFragmentB}}
        }
      `,
      );

      expect(() => {
        RelayFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root should contain exactly one fragment ' +
          "(e.g. `${Component.getFragment('...')}`). Query " +
          '`RelayFragmentPointer` contains more than one fragment.',
      );
    });

    it('throws if non-fragments are present', () => {
      const root = getNode(Relay.QL`query{username(name:"foo"){name}}`);

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
      const rootFragment = Relay.QL`fragment on Node{id}`;
      const root = getRefNode(
        Relay.QL`query{nodes(ids:$ref_q0){${rootFragment}}}`,
        {path: '$.*.id'},
      );

      expect(() => {
        RelayFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root cannot have batch call variables. ' +
          'Query `RelayFragmentPointer` has a batch call variable, `ref_q0`.',
      );
    });

    it('returns null when the root call was not fetched', () => {
      // When a root call is not fetched since it only contained empty
      // fragments, we shouldn't throw.
      const ref = Relay.QL`fragment on Viewer { actor { id } }`;
      const root = getNode(Relay.QL`query{viewer{${ref}}}`);

      expect(RelayFragmentPointer.createForRoot(recordStore, root)).toBeNull();
    });
  });

  describe('addFragment()', () => {
    const dataID = '123';
    let obj;

    beforeEach(() => {
      obj = {foo: 'bar'};
    });

    it('adds singular fragments to objects', () => {
      const fragment = getNode(Relay.QL`fragment on Node { id }`);
      RelayFragmentPointer.addFragment(obj, fragment, dataID);

      expect(obj).toEqual({
        foo: 'bar',
        __fragments__: {
          [fragment.getConcreteFragmentID()]: [{}],
        },
      });
    });

    it('adds plural fragments to objects', () => {
      const pluralFragment = getNode(
        Relay.QL`fragment on Node @relay(plural:true) { id }`,
      );
      RelayFragmentPointer.addFragment(obj, pluralFragment, dataID);

      expect(obj).toEqual({
        foo: 'bar',
        __fragments__: {
          [pluralFragment.getConcreteFragmentID()]: [{}],
        },
      });
    });
  });
});

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

jest.dontMock('GraphQLFragmentPointer');

describe('GraphQLFragmentPointer', () => {
  var GraphQLFragmentPointer;
  var Relay;

  var {getNode, getRefNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();
    GraphQLFragmentPointer = require('GraphQLFragmentPointer');
    Relay = require('Relay');

    jest.addMatchers(RelayTestUtils.matchers);
    jest.addMatchers({
      toEqualPointer(expected) {
        return this.actual.equals(expected);
      }
    });
  });

  describe('createForRoot', () => {
    var recordStore;

    beforeEach(() => {
      var RelayRecordStore = require('RelayRecordStore');

      var records = {};
      recordStore = new RelayRecordStore({records});
    });

    it('creates a wrapped fragment pointer', () => {
      var rootFragment = Relay.QL`fragment on Node{id}`;
      var root = getNode(Relay.QL`query{node(id:"123"){${rootFragment}}}`);

      var result = GraphQLFragmentPointer.createForRoot(recordStore, root);
      var resultKeys = Object.keys(result);
      expect(resultKeys.length).toBe(1);

      var fragmentPointer = result[resultKeys[0]];
      expect(fragmentPointer.getDataID()).toBe('123');
      expect(fragmentPointer.getFragment()).toEqualQueryNode(
        getNode(rootFragment)
      );
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
        GraphQLFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root should contain exactly one fragment ' +
        '(e.g. `${Component.getFragment(\'...\')}`). Query `UnknownFile` ' +
        'contains more than one fragment.'
      );
    });

    it('throws if non-fragments are present', () => {
      var root = getNode(Relay.QL`query{username(name:"foo"){name}}`);

      expect(() => {
        GraphQLFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root should contain exactly one fragment ' +
        'and no fields. Query `UnknownFile` contains a field, `name`. If ' +
        'you need to fetch fields, declare them in a Relay container.',
      );
    });

    it('throws for unknown ref queries', () => {
      var rootFragment = Relay.QL`fragment on Node{id}`;
      var root = getRefNode(
        Relay.QL`query{nodes(ids:$ref_q0){${rootFragment}}}`,
        {path: '$.*.id'}
      );

      expect(() => {
        GraphQLFragmentPointer.createForRoot(recordStore, root);
      }).toFailInvariant(
        'Queries supplied at the root cannot have batch call variables. ' +
        'Query `q0` has a batch call variable, `ref_q0`.'
      );
    });

    it('returns null when the root call was not fetched', () => {
      // When a root call is not fetched since it only contained empty
      // fragments, we shouldn't throw.
      var ref = Relay.QL`fragment on Viewer { actor { id } }`;
      var root = getNode(Relay.QL`query{viewer{${ref}}}`);

      expect(
        GraphQLFragmentPointer.createForRoot(recordStore, root)
      ).toBeNull();
    });
  });

  describe('plurality', () => {
    var variables;
    var singular;
    var singularFragment;
    var plural;
    var pluralFragment;

    beforeEach(() => {
      variables = {a: true, b: 1, c: ''};
      singular = Relay.QL`fragment on Node{id,name}`;
      singularFragment = getNode(singular, variables);
      plural = Relay.QL`fragment on Node @relay(plural:true){id,name}`;
      pluralFragment = getNode(plural, variables);
    });

    it('creates singular pointers', () => {
      var pointer = new GraphQLFragmentPointer('123', singularFragment);

      expect(pointer.getDataID()).toBe('123');
      expect(pointer.getFragment()).toBe(singularFragment);
      expect(pointer.equals(pointer)).toBeTruthy();
      expect(() => pointer.getDataIDs()).toFailInvariant(
        'GraphQLFragmentPointer.getDataIDs(): Bad call for non-plural fragment.'
      );
    });

    it('creates plural pointers', () => {
      var pointer = new GraphQLFragmentPointer(['123'], pluralFragment);

      expect(pointer.getDataIDs()).toEqual(['123']);
      expect(pointer.getFragment()).toBe(pluralFragment);
      expect(pointer.equals(pointer)).toBeTruthy();
      expect(() => pointer.getDataID()).toFailInvariant(
        'GraphQLFragmentPointer.getDataID(): Bad call for plural fragment.'
      );
    });

    it('throws when creating a singular pointer with multiple IDs', () => {
      expect(() =>{
        new GraphQLFragmentPointer(['123'], singularFragment);
      }).toFailInvariant(
        'GraphQLFragmentPointer: Wrong plurality, array of data IDs ' +
        'supplied with non-plural fragment.'
      );
    });

    it('throws when creating a plural pointer with a single ID', () => {
      expect(() =>{
        new GraphQLFragmentPointer('123', pluralFragment);
      }).toFailInvariant(
        'GraphQLFragmentPointer: Wrong plurality, single data ID supplied ' +
        'with plural fragment.'
      );
    });

    it('singular pointers are equals() to matching pointers', () => {
      var pointer = new GraphQLFragmentPointer('123', singularFragment);
      var another =
        new GraphQLFragmentPointer('123', getNode(singular, variables));

      expect(pointer).toEqualPointer(another);
    });

    it('singular pointers are not equals() to different pointers', () => {
      var pointer = new GraphQLFragmentPointer('123', singularFragment);
      // different id
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer('456', getNode(singular, variables))
      );
      // different fragment
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer(
          '123',
          getNode(Relay.QL`fragment on Node{id}`, variables)
        )
      );
      // different variables
      var differentVariables = {...variables, d: 'different'};
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer('123', getNode(singular, differentVariables))
      );
    });

    it('plural pointers are equals() to matching pointers', () => {
      var pointer = new GraphQLFragmentPointer(['123'], pluralFragment);
      var another = new GraphQLFragmentPointer(
        ['123'],
        getNode(plural, variables)
      );

      expect(pointer).toEqualPointer(another);
    });

    it('plural pointers are not equals() to different pointers', () => {
      var pointer = new GraphQLFragmentPointer(['123'], pluralFragment);
      // different id
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer(['456'], getNode(plural, variables))
      );
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer(['123', '456'], getNode(plural, variables))
      );
      // different fragment
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer(
          ['123'],
          getNode(Relay.QL`fragment on Node @relay(plural:true){id}`, variables)
        )
      );
      // different variables
      var differentVariables = {...variables, d: 'different'};
      expect(pointer).not.toEqualPointer(
        new GraphQLFragmentPointer(['123'], getNode(plural, differentVariables))
      );
    });
  });
});

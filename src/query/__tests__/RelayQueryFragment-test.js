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

var Relay = require('Relay');
var RelayMetaRoute = require('RelayMetaRoute');
var RelayQuery = require('RelayQuery');
var generateRQLFieldAlias = require('generateRQLFieldAlias');
var getWeakIdForObject = require('getWeakIdForObject');

describe('RelayQueryFragment', () => {
  var {getNode} = RelayTestUtils;

  var fragment;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);

    var subfrag = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    var frag = Relay.QL`
      fragment on StreetAddress {
        country,
        ${subfrag},
      }
    `;
    fragment = getNode(frag);
  });

  it('does not equal non-fragments', () => {
    var query = getNode(Relay.QL`
      query {
        me {
          firstName
        }
      }
    `);
    var field = query.getChildren()[0];
    expect(fragment.equals(query)).toBe(false);
    expect(fragment.equals(field)).toBe(false);
  });

  it('does not equal different fragment', () => {
    var fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        country
      }
    `);
    expect(fragment.equals(fragment2)).toBe(false);
    expect(fragment2.equals(fragment)).toBe(false);
  });

  it('does not equal equivalent fragments with a different structure', () => {
    expect(fragment.equals(fragment)).toBe(true);
    // invert the fields between outer/inner fragments
    var subfrag = Relay.QL`
      fragment on StreetAddress {
        country
      }
    `;
    var fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        city,
        ${subfrag}
      }
    `);
    expect(fragment.equals(fragment2)).toBe(false);
    expect(fragment2.equals(fragment)).toBe(false);
  });

  it('equals fragments with the same structure', () => {
    expect(fragment.equals(fragment)).toBe(true);
    var subfrag = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    var fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        country,
        ${subfrag}
      }
    `);
    expect(fragment.equals(fragment2)).toBe(true);
    expect(fragment2.equals(fragment)).toBe(true);
  });

  it('equals fragments with different names', () => {
    // NOTE: Two fragments in the same scope will have different names.
    var fragment1 = getNode(Relay.QL`fragment on Node{id}`);
    var fragment2 = getNode(Relay.QL`fragment on Node{id}`);
    expect(fragment1.equals(fragment2)).toBe(true);
    expect(fragment2.equals(fragment1)).toBe(true);
  });

  it('returns metadata', () => {
    var node = Relay.QL`
      fragment on StreetAddress {
        country,
      }
    `;
    var fragment = getNode(node);
    expect(fragment.getDebugName()).toBe('RelayQueryFragment');
    expect(fragment.getType()).toBe('StreetAddress');
    expect(fragment.getFragmentID()).toBe(generateRQLFieldAlias(
      '_RelayQueryFragment' + getWeakIdForObject(node) + '.$RelayTestUtils.{}'
    ));
  });

  it('returns a fragment ID based on route and variables', () => {
    var node = Relay.QL`fragment on Node{id}`;
    var route = RelayMetaRoute.get('Foo');
    var variables = {};
    var fragment = RelayQuery.Node.create(node, route, variables);
    var fragmentID = generateRQLFieldAlias('_RelayQueryFragment0.Foo.{}');
    expect(fragment.getFragmentID()).toBe(fragmentID);

    route = RelayMetaRoute.get('Bar');
    fragment = RelayQuery.Node.create(node, route, variables);
    fragmentID = generateRQLFieldAlias('_RelayQueryFragment0.Bar.{}');
    expect(fragment.getFragmentID()).toBe(fragmentID);

    variables = {foo: 'bar'};
    fragment = RelayQuery.Node.create(node, route, variables);
    fragmentID = generateRQLFieldAlias('_RelayQueryFragment0.Bar.{foo:"bar"}');
    expect(fragment.getFragmentID()).toBe(fragmentID);
  });

  it('returns the same ID for equivalent fragments', () => {
    var node = Relay.QL`fragment on Node{id}`;
    var route = RelayMetaRoute.get('Foo');
    var variables = {};
    var fragment1 = RelayQuery.Node.create(node, route, variables);
    var fragment2 = RelayQuery.Node.create(node, route, variables);
    var fragmentID = generateRQLFieldAlias('_RelayQueryFragment0.Foo.{}');

    expect(fragment1).not.toBe(fragment2);
    expect(fragment1.getFragmentID()).toBe(fragmentID);
    expect(fragment1.getFragmentID()).toBe(fragment2.getFragmentID());
  });

  it('returns different IDs for non-equivalent fragments', () => {
    var node1 = Relay.QL`fragment on Node{id}`;
    var fragment1 = getNode(node1);
    var node2 = Relay.QL`fragment on Node{id}`;
    var fragment2 = getNode(node2);
    expect(fragment1.getFragmentID()).not.toBe(fragment2.getFragmentID());
  });

  it('returns children', () => {
    var children = fragment.getChildren();
    expect(children.length).toBe(2);
    expect(children[0].getSchemaName()).toBe('country');
    expect(children[1].getDebugName()).toBe('RelayQueryFragment');
  });

  it('returns same object when cloning with same children', () => {
    var children = fragment.getChildren();
    expect(fragment.clone(children)).toBe(fragment);
    expect(fragment.clone(children.map(c => c))).toBe(fragment);
  });

  it('returns null when cloning without children', () => {
    expect(fragment.clone([])).toBe(null);
    expect(fragment.clone([null])).toBe(null);
  });

  it('clones with updated children', () => {
    var query = getNode(Relay.QL`
      fragment on StreetAddress {
        country,
        city,
      }
    `);
    var clone = query.clone([query.getChildren()[0]]);
    expect(clone.getChildren().length).toBe(1);
    expect(clone.getChildren()[0].getSchemaName()).toBe('country');
    expect(clone.getFieldByStorageKey('city')).toBe(undefined);
  });

  it('is not a ref query dependency', () => {
    expect(fragment.isRefQueryDependency()).toBe(false);
  });

  it('is not generated', () => {
    expect(fragment.isGenerated()).toBe(false);
  });

  it('is not scalar', () => {
    // fragment with children
    expect(fragment.isScalar()).toBe(false);

    // fragment without children
    expect(getNode(Relay.QL`fragment on Viewer{${null}}`).isScalar()).toBe(false);
  });

  it('creates nodes', () => {
    var fragmentRQL = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    var fragment = getNode(fragmentRQL);
    var node = fragment.createNode(fragmentRQL);
    expect(node instanceof RelayQuery.Fragment).toBe(true);
    expect(node.getType()).toBe('StreetAddress');
    expect(node.getRoute()).toBe(fragment.getRoute());
    expect(node.getVariables()).toBe(fragment.getVariables());
  });

  it('returns directives', () => {
    var fragment = getNode(Relay.QL`
      fragment on Story
        @include(if: $cond)
        @foo(int: 10, bool: true, str: "string")
      {
        feedback
      }
    `, {cond: true});
    expect(fragment.getDirectives()).toEqual([
      {
        name: 'include',
        arguments: [
          {name: 'if', value: true},
        ],
      },
      {
        name: 'foo',
        arguments: [
          {name: 'int', value: 10},
          {name: 'bool', value: true},
          {name: 'str', value: 'string'},
        ],
      }
    ]);
  });
});

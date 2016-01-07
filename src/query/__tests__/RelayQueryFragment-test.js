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

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryFragment', () => {
  var {getNode} = RelayTestUtils;

  var fragment;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);

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
    var fragment1 = getNode(Relay.QL`fragment on Node { id }`);
    var fragment2 = getNode(Relay.QL`fragment on Node { id }`);
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
    expect(
      getNode(Relay.QL`fragment on Viewer { ${null} }`).isScalar()
    ).toBe(false);
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
    ]);
  });
});

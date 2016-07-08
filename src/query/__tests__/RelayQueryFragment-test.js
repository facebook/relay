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
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryFragment', () => {
  const {getNode} = RelayTestUtils;

  let fragment;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);

    const subfrag = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    const frag = Relay.QL`
      fragment on StreetAddress {
        country
        ${subfrag}
      }
    `;
    fragment = getNode(frag);
  });

  it('does not equal non-fragments', () => {
    const query = getNode(Relay.QL`
      query {
        me {
          firstName
        }
      }
    `);
    const field = query.getChildren()[0];
    expect(fragment.equals(query)).toBe(false);
    expect(fragment.equals(field)).toBe(false);
  });

  it('does not equal different fragment', () => {
    const fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        country
      }
    `);
    expect(fragment.equals(fragment2)).toBe(false);
    expect(fragment2.equals(fragment)).toBe(false);
  });

  it('does not return a source composite hash for un-cloned fragments', () => {
    expect(fragment.getSourceCompositeHash())
      .toBe(null);
  });

  it('does not equal equivalent fragments with a different structure', () => {
    expect(fragment.equals(fragment)).toBe(true);
    // invert the fields between outer/inner fragments
    const subfrag = Relay.QL`
      fragment on StreetAddress {
        country
      }
    `;
    const fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        city
        ${subfrag}
      }
    `);
    expect(fragment.equals(fragment2)).toBe(false);
    expect(fragment2.equals(fragment)).toBe(false);
  });

  it('equals fragments with the same structure', () => {
    expect(fragment.equals(fragment)).toBe(true);
    const subfrag = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    const fragment2 = getNode(Relay.QL`
      fragment on StreetAddress {
        country
        ${subfrag}
      }
    `);
    expect(fragment.equals(fragment2)).toBe(true);
    expect(fragment2.equals(fragment)).toBe(true);
  });

  it('equals fragments with different names', () => {
    // NOTE: Two fragments in the same scope will have different names.
    const fragment1 = getNode(Relay.QL`fragment on Node { id }`);
    const fragment2 = getNode(Relay.QL`fragment on Node { id }`);
    expect(fragment1.equals(fragment2)).toBe(true);
    expect(fragment2.equals(fragment1)).toBe(true);
  });

  it('returns metadata', () => {
    const node = Relay.QL`
      fragment on StreetAddress {
        country
      }
    `;
    fragment = getNode(node);
    expect(fragment.getDebugName()).toBe('RelayQueryFragmentRelayQL');
    expect(fragment.getType()).toBe('StreetAddress');
  });

  it('returns children', () => {
    const children = fragment.getChildren();
    expect(children.length).toBe(2);
    expect(children[0].getSchemaName()).toBe('country');
    expect(children[1].getDebugName()).toBe('RelayQueryFragmentRelayQL');
  });

  it('returns same object when cloning with same children', () => {
    const children = fragment.getChildren();
    expect(fragment.clone(children)).toBe(fragment);
    expect(fragment.clone(children.map(c => c))).toBe(fragment);
  });

  it('returns the source composite hash for cloned fragments', () => {
    const query = getNode(Relay.QL`
      fragment on StreetAddress {
        country
        city
      }
    `);
    const clone = fragment.clone([query.getChildren()[0]]);
    expect(clone.getSourceCompositeHash())
      .toBe(fragment.getCompositeHash());
  });

  it('returns null when cloning without children', () => {
    expect(fragment.clone([])).toBe(null);
    expect(fragment.clone([null])).toBe(null);
  });

  it('clones with updated children', () => {
    const query = getNode(Relay.QL`
      fragment on StreetAddress {
        country
        city
      }
    `);
    const clone = fragment.clone([query.getChildren()[0]]);
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

  it('creates nodes', () => {
    const fragmentRQL = Relay.QL`
      fragment on StreetAddress {
        city
      }
    `;
    fragment = getNode(fragmentRQL);
    const node = fragment.createNode(fragmentRQL);
    expect(node instanceof RelayQuery.Fragment).toBe(true);
    expect(node.getType()).toBe('StreetAddress');
    expect(node.getRoute()).toBe(fragment.getRoute());
    expect(node.getVariables()).toBe(fragment.getVariables());
  });

  it('returns directives', () => {
    fragment = getNode(Relay.QL`
      fragment on Story @include(if: $cond) {
        feedback
      }
    `, {cond: true});
    expect(fragment.getDirectives()).toEqual([
      {
        args: [
          {name: 'if', value: true},
        ],
        name: 'include',
      },
    ]);
  });

  describe('canHaveSubselections()', () => {
    it('returns true', () => {
      // fragment with children
      expect(fragment.canHaveSubselections()).toBe(true);

      // fragment without children
      expect(
        getNode(Relay.QL`fragment on Viewer { ${null} }`).canHaveSubselections()
      ).toBe(true);
    });
  });

  describe('variables argument of @relay directive', () => {
    it('maps listed variables', () => {
      const query = getNode(Relay.QL`
        fragment on User {
          ... on User @relay(variables: ["inner"]) {
            profilePicture(size: $inner)
          }
        }
      `, {inner: 100});
      const frag = query.getChildren()[1];
      expect(frag instanceof RelayQuery.Fragment).toBe(true);
      expect(frag.getVariables()).toEqual({inner: 100});
    });

    it('filters non-listed variables', () => {
      const query = getNode(Relay.QL`
        fragment on User {
          ... on User @relay(variables: []) {
            profilePicture(size: $inner)
          }
        }
      `, {inner: 100});
      const frag = query.getChildren()[1];
      expect(frag instanceof RelayQuery.Fragment).toBe(true);
      expect(frag.getVariables()).toEqual({});
    });
  });
});

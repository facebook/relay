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
const RelayQueryVisitor = require('RelayQueryVisitor');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryVisitor', () => {
  const {getNode} = RelayTestUtils;
  let query;

  beforeEach(() => {
    const variables = {
      first: 10,
      after: 'offset',
    };

    const fragment = Relay.QL`
      fragment on User {
        friends(first:$first,after:$after) {
          edges {
            node {
              id
              name
              address {
                city
              }
            }
          }
        }
      }
    `;
    query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          ${fragment}
          friends(first:$first,after:$after) {
            edges {
              node {
                id
                firstName
                address {
                  city
                }
              }
            }
          }
        }
      }
    `, null, variables);
  });

  it('traverses fields in-order', () => {
    class InOrder extends RelayQueryVisitor<Array> {
      visitField(field: RelayQuery.Field, state: Array): ?RelayQuery.Node {
        state.push(field.getSchemaName());
        this.traverse(field, state);
      }
    }
    const transform = new InOrder();
    const fields = [];
    transform.visit(query, fields);

    var expectedFields = [];
    function traverse(node: RelayQuery.Node): void {
      if (node instanceof RelayQuery.Field) {
        expectedFields.push(node.getSchemaName());
      }
      node.getChildren().forEach(c => traverse(c));
    }
    traverse(query);

    expect(fields.length).toBe(expectedFields.length);
    expect(fields.every((f, ii) => f === expectedFields[ii])).toBeTruthy();
  });

  it('returns original input', () => {
    class Visitor extends RelayQueryVisitor<any> {}

    const transform = new Visitor();
    const output = transform.visit(query, null);
    expect(output === query).toBeTruthy();
  });

  it('returns the query intact when the visit methods return `null`', () => {
    class NullReturningVisitor extends RelayQueryVisitor<any> {
      visitField(field: RelayQuery.Field, state: any): ?RelayQuery.Node {
        this.traverse(field, state);
        return null;
      }
    }

    const transform = new NullReturningVisitor();
    const output = transform.visit(query, null);
    expect(output).toBe(query);
  });

  it('does not automatically traverse subtrees when visitor is defined', () => {
    class NoTraversal extends RelayQueryVisitor<Array> {
      visitField(
        field: RelayQuery.Field,
        state: Array
      ): ?RelayQuery.Node {
        // should never get here
        state.push(field.getSchemaName());
        return field;
      }

      visitFragment(
        fragment: RelayQuery.Fragment,
        state: Array
      ): ?RelayQuery.Node {
        // should never get here
        state.push(fragment.getName());
        return fragment;
      }

      visitRoot(
        root: RelayQuery.Root,
        state: Array
      ): ?RelayQuery.Node {
        state.push(query.getName());
        // should stop transform from looking at fields/fragments
        return root;
      }
    }

    const transform = new NoTraversal();
    const fields = [];
    transform.visit(query, fields);
    expect(fields).toEqual(['RelayQueryVisitor']);
  });
});

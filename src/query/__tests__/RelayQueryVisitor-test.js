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

describe('RelayQueryVisitor', () => {
  var GraphQL;
  var Relay;
  var RelayQuery;
  var RelayQueryVisitor;

  var generateRQLFieldAlias;

  var {getNode} = RelayTestUtils;
  var query;

  beforeEach(() => {
    GraphQL = require('GraphQL');
    Relay = require('Relay');
    RelayQuery = require('RelayQuery');
    RelayQueryVisitor = require('RelayQueryVisitor');

    generateRQLFieldAlias = require('generateRQLFieldAlias');

    var variables = {
      first: 10,
      after: 'offset',
    };

    var fragment = Relay.QL`
      fragment on User {
        friends(first:$first,after:$after) {
          edges {
            node {
              id,
              name,
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
          id,
          ${fragment},
          friends(first:$first,after:$after) {
            edges {
              node {
                id,
                firstName,
                address {
                  city,
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
    var transform = new InOrder();
    var fields = [];
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

    var transform = new Visitor();
    var output = transform.visit(query, null);
    expect(output === query).toBeTruthy();
  });

  it('returns the query intact when the visit methods return `null`', () => {
    class NullReturningVisitor extends RelayQueryVisitor<any> {
      visitField(field: RelayQuery.Field, state: any): ?RelayQuery.Node {
        this.traverse(field, state);
        return null;
      }
    }

    var transform = new NullReturningVisitor();
    var output = transform.visit(query, null);
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

    var transform = new NoTraversal();
    var fields = [];
    transform.visit(query, fields);
    expect(fields).toEqual(['UnknownFile']);
  });
});

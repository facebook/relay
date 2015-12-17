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
const RelayQueryTransform = require('RelayQueryTransform');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryTransform', () => {
  var {getNode} = RelayTestUtils;
  var query;

  beforeEach(() => {
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
                lastName,
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

  it('returns original input', () => {
    class NoOp extends RelayQueryTransform<any> {}

    var transform = new NoOp();
    var output = transform.visit(query, null);
    expect(output).toBe(query);
  });

  it('returns null if field visitors all return null for scalars', () => {
    class Nullify extends RelayQueryTransform<any> {
      visitField(field: RelayQuery.Field, state: any): ?RelayQuery.Node {
        if (field.isScalar()) {
          return null;
        }
        return this.traverse(field, state);
      }
    }

    var transform = new Nullify();
    var output = transform.visit(query, null);
    expect(output).toBe(null);
  });

  it('returns cloned versions of fields', () => {
    class RemoveIDs extends RelayQueryTransform<Array> {
      visitField(field: RelayQuery.Field, state: Array): ?RelayQuery.Node {
        // print `id` but filter from output
        state.push(field.getSchemaName());
        if (field.getSchemaName() === 'id') {
          return null;
        }
        return this.traverse(field, state);
      }
    }

    var transform = new RemoveIDs();
    var fields = [];
    var output = transform.visit(query, fields);

    var expectedFields = [];
    function traverse(node: RelayQuery.Node): void {
      if (node instanceof RelayQuery.Field) {
        expectedFields.push(node.getSchemaName());
      }
      node.getChildren().forEach(c => traverse(c));
    }
    traverse(output);

    // output should be missing the id fields
    expect(expectedFields.length).not.toBe(fields.length);
    fields = fields.filter(name => name !== 'id');
    expect(fields.length).toBe(expectedFields.length);
    expect(fields.every((f, ii) => f === expectedFields[ii])).toBe(true);
  });
});

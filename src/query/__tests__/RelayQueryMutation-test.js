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
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryMutation', () => {
  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('creates mutations', () => {
    var input = JSON.stringify({
      [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'mutation:id',
      actor: 'actor:id',
      feedback_id: 'feedback:id',
      message: {
        text: 'comment!',
      },
    });
    var mutationQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedbackCommentEdge {
            node {id},
            source {id}
          }
        }
      }
    `, {input});
    expect(mutationQuery.getName()).toBe('RelayQueryMutation');
    expect(mutationQuery.getResponseType()).toBe(
      'CommentCreateResponsePayload'
    );
    expect(mutationQuery.getCall()).toEqual({
      name: 'commentCreate',
      value: input,
    });
    var children = mutationQuery.getChildren();
    expect(children.length).toBe(2);
    expect(children[0].getSchemaName()).toBe(
      RelayConnectionInterface.CLIENT_MUTATION_ID
    );
    expect(children[1].getSchemaName()).toBe('feedbackCommentEdge');
    var edgeChildren = children[1].getChildren();
    expect(edgeChildren.length).toBe(3);
    expect(edgeChildren[0].getSchemaName()).toBe('node');
    expect(edgeChildren[1].getSchemaName()).toBe('source');
    expect(edgeChildren[2].getSchemaName()).toBe('cursor'); // generated
  });

  it('clones mutations', () => {
    var input = JSON.stringify({
      [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'mutation:id',
      actor: 'actor:id',
      feedback_id: 'feedback:id',
      message: {
        text: 'comment!',
      },
    });
    var mutationQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedbackCommentEdge {
            node {id},
            source {id}
          }
        }
      }
    `, {input});
    var clone = mutationQuery.clone(mutationQuery.getChildren());
    expect(clone).toBe(mutationQuery);

    clone = mutationQuery.clone(
      mutationQuery.getChildren().slice(0, 1)
    );
    expect(clone).not.toBe(mutationQuery);
    expect(clone.getChildren().length).toBe(1);
    expect(clone.getChildren()[0].getSchemaName()).toBe(
      RelayConnectionInterface.CLIENT_MUTATION_ID
    );

    clone = mutationQuery.clone([null]);
    expect(clone).toBe(null);
  });

  it('tests for equality', () => {
    var input = JSON.stringify({
      [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'mutation:id',
      actor: 'actor:id',
      feedback_id: 'feedback:id',
      message: {
        text: 'comment!',
      },
    });
    var mutationQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedbackCommentEdge {
            node {id},
            source {id}
          }
        }
      }
    `, {input});
    var equivalentQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedbackCommentEdge {
            node {id},
            source {id}
          }
        }
      }
    `, {input});
    var differentQuery = getNode(Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId,
          feedbackCommentEdge {
            cursor,
            node {id},
            source {id}
          }
        }
      }
    `, {input});

    expect(mutationQuery).not.toBe(equivalentQuery);
    expect(mutationQuery.equals(equivalentQuery)).toBe(true);
    expect(mutationQuery.equals(differentQuery)).toBe(false);
  });
});

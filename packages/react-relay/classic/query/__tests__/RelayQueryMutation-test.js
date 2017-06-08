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

jest.disableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryMutation', () => {
  const {getNode} = RelayTestUtils;

  let input;
  let mutationQuery;

  beforeEach(() => {
    jest.resetModules();

    jasmine.addMatchers(RelayTestUtils.matchers);

    input = JSON.stringify({
      [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'mutation:id',
      actor: 'actor:id',
      feedback_id: 'feedback:id',
      message: {
        text: 'comment!',
      },
    });
    mutationQuery = getNode(
      Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId
          feedbackCommentEdge {
            node {id}
            source {id}
          }
        }
      }
    `,
      {input},
    );
  });

  it('creates mutations', () => {
    expect(mutationQuery.getName()).toBe('RelayQueryMutation');
    expect(mutationQuery.getResponseType()).toBe(
      'CommentCreateResponsePayload',
    );
    expect(mutationQuery.getCall()).toEqual({
      name: 'commentCreate',
      value: input,
    });
    const children = mutationQuery.getChildren();
    expect(children.length).toBe(2);
    expect(children[0].getSchemaName()).toBe(
      RelayConnectionInterface.CLIENT_MUTATION_ID,
    );
    expect(children[1].getSchemaName()).toBe('feedbackCommentEdge');
    const edgeChildren = children[1].getChildren();
    expect(edgeChildren.length).toBe(3);
    expect(edgeChildren[0].getSchemaName()).toBe('node');
    expect(edgeChildren[1].getSchemaName()).toBe('source');
    expect(edgeChildren[2].getSchemaName()).toBe('cursor'); // generated
  });

  it('clones mutations', () => {
    let clone = mutationQuery.clone(mutationQuery.getChildren());
    expect(clone).toBe(mutationQuery);

    clone = mutationQuery.clone(mutationQuery.getChildren().slice(0, 1));
    expect(clone).not.toBe(mutationQuery);
    expect(clone.getChildren().length).toBe(1);
    expect(clone.getChildren()[0].getSchemaName()).toBe(
      RelayConnectionInterface.CLIENT_MUTATION_ID,
    );

    clone = mutationQuery.clone([null]);
    expect(clone).toBe(null);
  });

  it('tests for equality', () => {
    const equivalentQuery = getNode(
      Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId
          feedbackCommentEdge {
            node {id}
            source {id}
          }
        }
      }
    `,
      {input},
    );
    const differentQuery = getNode(
      Relay.QL`
      mutation {
        commentCreate(input:$input) {
          clientMutationId
          feedbackCommentEdge {
            cursor
            node {id}
            source {id}
          }
        }
      }
    `,
      {input},
    );

    expect(mutationQuery).not.toBe(equivalentQuery);
    expect(mutationQuery.equals(equivalentQuery)).toBe(true);
    expect(mutationQuery.equals(differentQuery)).toBe(false);
  });

  describe('canHaveSubselections()', () => {
    it('returns true', () => {
      expect(mutationQuery.canHaveSubselections()).toBe(true);
    });
  });
});

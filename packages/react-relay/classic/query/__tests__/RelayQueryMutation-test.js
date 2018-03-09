/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

const RelayClassic = require('../../RelayPublic');
const {ConnectionInterface} = require('RelayRuntime');
const RelayTestUtils = require('RelayTestUtils');

const {CLIENT_MUTATION_ID} = ConnectionInterface.get();

describe('RelayQueryMutation', () => {
  const {getNode} = RelayTestUtils;

  let input;
  let mutationQuery;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);

    input = JSON.stringify({
      [CLIENT_MUTATION_ID]: 'mutation:id',
      actor: 'actor:id',
      feedback_id: 'feedback:id',
      message: {
        text: 'comment!',
      },
    });
    mutationQuery = getNode(
      RelayClassic.QL`
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
    expect(children[0].getSchemaName()).toBe(CLIENT_MUTATION_ID);
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
    expect(clone.getChildren()[0].getSchemaName()).toBe(CLIENT_MUTATION_ID);

    clone = mutationQuery.clone([null]);
    expect(clone).toBe(null);
  });

  it('tests for equality', () => {
    const equivalentQuery = getNode(
      RelayClassic.QL`
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
      RelayClassic.QL`
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

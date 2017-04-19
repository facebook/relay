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
var RelayFragmentReference = require('RelayFragmentReference');
var RelayQuerySerializer = require('RelayQuerySerializer');

describe('RelayQuerySerializer', () => {
  var fromJSON;
  var toJSON;

  var {filterGeneratedFields, getNode} = RelayTestUtils;

  function idField(parentType) {
    return {
      kind: 'Field',
      name: 'id',
      alias: null,
      calls: [],
      children: [],
      metadata: {
        generated: true,
        requisite: true,
        parentType,
      },
    };
  }

  function scalarField(name, parentType) {
    return {
      kind: 'Field',
      name: 'name',
      alias: null,
      calls: [],
      children: [],
      metadata: {
        parentType,
      },
    };
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({fromJSON, toJSON} = RelayQuerySerializer);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('Root', () => {
    it('serializes argument-less root fields', () => {
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              name,
            },
          }
        }
      `);

      expect(toJSON(query)).toMatchQueryJSON({
        kind: 'Query',
        name: 'RelayQuerySerializer',
        calls: [{name: 'viewer', value: null}],
        children: [
          {
            kind: 'Field',
            name: 'actor',
            alias: null,
            calls: [],
            children: [
              scalarField('name', 'Actor'),
              idField('Actor'),
            ],
            metadata: {
              dynamic: true,
              pk: 'id',
              rootCall: 'node',
              parentType: 'Viewer',
            },
          },
        ],
        metadata: {},
      });
      var clone = fromJSON(toJSON(query));
      expect(clone.equals(query)).toBe(true);
      expect(clone.getName()).toBe(query.getName());
    });

    it('serializes singular root fields', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name,
          }
        }
      `);

      expect(toJSON(query)).toMatchQueryJSON({
        kind: 'Query',
        name: 'RelayQuerySerializer',
        calls: [{name: 'node', value: '123'}],
        children: [
          scalarField('name', 'Node'),
          idField('Node'),
        ],
        metadata: {},
      });
      var clone = fromJSON(toJSON(query));
      expect(clone.equals(query)).toBe(true);
      expect(clone.getName()).toBe(query.getName());
    });

    it('serializes plural root fields', () => {
      var query = getNode(Relay.QL`
        query {
          nodes(ids:["1","2","3"]) {
            name,
          }
        }
      `);

      expect(toJSON(query)).toMatchQueryJSON({
        kind: 'Query',
        name: 'RelayQuerySerializer',
        calls: [{name: 'nodes', value: ['1', '2', '3']}],
        children: [
          scalarField('name', 'Node'),
          idField('Node'),
        ],
        metadata: {varargs: 1},
      });
      var clone = fromJSON(toJSON(query));
      expect(clone.equals(query)).toBe(true);
      expect(clone.getName()).toBe(query.getName());
    });
  });

  describe('Fragment', () => {
    it('serializes inline fragments', () => {
      var fragment = getNode(Relay.QL`fragment on Node { id }`);

      expect(toJSON(fragment)).toMatchQueryJSON({
        kind: 'FragmentDefinition',
        name: 'RelayQuerySerializer',
        type: 'Node',
        children: [{
          ...idField('Node'),
          metadata: {
            requisite: true,
            parentType: 'Node',
          }
        }],
        metadata: {
          isDeferred: false,
          isContainerFragment: false,
        },
      });
      expect(fromJSON(toJSON(fragment)).equals(fragment)).toBe(true);
    });

    it('serializes deferred fragment references', () => {
      var node = Relay.QL`fragment on Node { id }`;
      var reference = RelayFragmentReference.createForContainer(
        () => node,
        {}
      );
      var fragment = getNode(reference.defer());

      expect(toJSON(fragment)).toMatchQueryJSON({
        kind: 'FragmentDefinition',
        name: 'RelayQuerySerializer',
        type: 'Node',
        children: [{
          ...idField('Node'),
          metadata: {
            requisite: true,
            parentType: 'Node',
          }
        }],
        metadata: {
          isDeferred: true,
          isContainerFragment: true,
        },
      });

      var deserialized = fromJSON(toJSON(fragment));
      expect(deserialized.equals(fragment)).toBe(true);
      expect(deserialized.isDeferred()).toBe(true);
      expect(deserialized.isContainerFragment()).toBe(true);
    });
  });

  describe('Field', () => {
    it('serializes fields with singular call values', () => {
      var field = getNode(Relay.QL`
        fragment on User {
          photo: profilePicture(size:"32") {
            uri,
          },
        }
      `).getChildren()[0];

      expect(toJSON(field)).toMatchQueryJSON({
        kind: 'Field',
        name: 'profilePicture',
        alias: 'photo',
        calls: [
          {name: 'size', value: '32'},
        ],
        children: [{
          kind: 'Field',
          name: 'uri',
          alias: null,
          calls: [],
          children: [],
          metadata: {parentType: 'Image'},
        }],
        metadata: {parentType: 'User'},
      });
      expect(fromJSON(toJSON(field)).equals(field)).toBe(true);
    });

    it('serializes fields with plural call values', () => {
      var field = getNode(Relay.QL`
        fragment on User {
          photo: profilePicture(size:["32","64"]) {
            uri,
          },
        }
      `).getChildren()[0];

      expect(toJSON(field)).toMatchQueryJSON({
        kind: 'Field',
        name: 'profilePicture',
        alias: 'photo',
        calls: [
          {name: 'size', value: ['32', '64']},
        ],
        children: [{
          kind: 'Field',
          name: 'uri',
          alias: null,
          calls: [],
          children: [],
          metadata: {parentType: 'Image'},
        }],
        metadata: {parentType: 'User'},
      });
      expect(fromJSON(toJSON(field)).equals(field)).toBe(true);
    });

    it('serializes fields with argument-less calls', () => {
      var field = filterGeneratedFields(getNode(Relay.QL`
        fragment on User {
          friends(isViewerFriend:true) {
            edges {
              node {
                id,
              },
            },
          },
        }
      `).getChildren()[0]);

      expect(toJSON(field)).toMatchQueryJSON({
        kind: 'Field',
        name: 'friends',
        alias: null,
        calls: [
          {name: 'isViewerFriend', value: true},
        ],
        children: [{
          kind: 'Field',
          name: 'edges',
          alias: null,
          calls: [],
          children: [{
            kind: 'Field',
            name: 'node',
            alias: null,
            calls: [],
            children: [{
              ...idField('User'),
              metadata: {
                requisite: true,
                parentType: 'User',
              },
            }],
            metadata: {
              pk: 'id',
              requisite: true,
              rootCall: 'node',
              parentType: 'FriendsEdge'
            },
          }],
          metadata: {plural: true, parentType: 'FriendsConnection'},
        }],
        metadata: {connection: true, parentType: 'User'},
      });
      expect(fromJSON(toJSON(field)).equals(field)).toBe(true);
    });
  });

  describe('Mutation', () => {
    it('serializes mutation', () => {
      var mutation = getNode(Relay.QL`
        mutation {
          commentCreate(input:$input) {
            feedback {
              id
            }
          }
        }
      `, {input: {feedback: '123', text: 'comment'}});
      expect(toJSON(mutation)).toMatchQueryJSON({
        kind: 'Mutation',
        name: 'RelayQuerySerializer',
        calls: [{
          name: 'commentCreate',
          value: {feedback: '123', text: 'comment'}
        }],
        children: [
          {
            kind: 'Field',
            name: 'feedback',
            alias: null,
            calls: [],
            children: [
              idField('Feedback'),
            ],
            metadata: {
              dynamic: false,
              pk: 'id',
              rootCall: 'node',
              parentType: 'CommentCreateResponsePayload',
            },
          },
        ],
        type: 'CommentCreateResponsePayload',
      });
      var clone = fromJSON(toJSON(mutation));
      expect(clone.equals(mutation)).toBe(true);
      expect(clone.getName()).toBe(mutation.getName());
    });
  });
});

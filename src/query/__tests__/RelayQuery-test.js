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

describe('RelayQuery', () => {
  var GraphQL;
  var Relay;
  var RelayConnectionInterface;
  var RelayFragmentReference;
  var RelayMetaRoute;
  var RelayQuery;

  var generateRQLFieldAlias;
  var getWeakIdForObject;

  var {defer, getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    GraphQL = require('GraphQL');
    Relay = require('Relay');
    RelayConnectionInterface = require('RelayConnectionInterface');
    RelayFragmentReference = require('RelayFragmentReference');
    RelayMetaRoute = require('RelayMetaRoute');
    RelayQuery = require('RelayQuery');

    generateRQLFieldAlias = require('generateRQLFieldAlias');
    getWeakIdForObject = require('getWeakIdForObject');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('RelayQueryRoot', () => {
    var me;
    var usernames;

    beforeEach(() => {
      me = getNode(Relay.QL`
        query {
          me {
            name1: firstName,
            name1: lastName,
          }
        }
      `);

      usernames = getNode(Relay.QL`
        query {
          usernames(names:"mroch") {
            firstName,
          }
        }
      `);
      usernames.__concreteNode__.metadata = {rootArg: 'names'};
    });

    it('has a unique ID', () => {
      var lastID = getNode(Relay.QL`query{me{firstName}}`).getID();
      var nextID = getNode(Relay.QL`query{me{lastName}}`).getID();
      expect(lastID).toMatch(/^q\d+/);
      expect(nextID).toMatch(/^q\d+/);
      expect(nextID).not.toEqual(lastID);
    });

    it('returns children', () => {
      var children = me.getChildren();
      expect(children.length).toBe(3);
      expect(children[0].getSchemaName()).toBe('firstName');
      expect(children[1].getSchemaName()).toBe('lastName');
      expect(children[2].getSchemaName()).toBe('id');
      expect(children[2].isGenerated()).toBe(true);

      children = usernames.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('firstName');
      expect(children[1].getSchemaName()).toBe('id');
      expect(children[1].isGenerated()).toBe(true);
    });

    it('returns same object when cloning with same fields', () => {
      var children = me.getChildren();
      expect(me.clone(children)).toBe(me);
      expect(me.clone(children.map(c => c))).toBe(me);
      expect(me.clone(
        [null, children[0], null, children[1], null, children[2], null]
      )).toBe(me);

      children = usernames.getChildren();
      expect(usernames.clone(children)).toBe(usernames);
      expect(usernames.clone(children.map(c => c))).toBe(usernames);
    });

    it('returns null when cloning without fields', () => {
      expect(me.clone([])).toBe(null);
      expect(me.clone([null])).toBe(null);
      expect(usernames.clone([])).toBe(null);
      expect(usernames.clone([null])).toBe(null);
    });

    it('returns new object when cloning with different fields', () => {
      var children = me.getChildren();
      expect(me.clone([children[0], null])).not.toBe(me);
      expect(me.clone([children[0], null, null])).not.toBe(me);
      expect(me.clone([children[0], null, null, null])).not.toBe(me);
    });

    it('clones with updated children', () => {
      var query = getNode(Relay.QL`
        query {
          me {
            firstName,
            lastName
          }
        }
      `);
      var clone = query.clone([query.getChildren()[0]]);
      expect(clone.getChildren().length).toBe(1);
      expect(clone.getChildren()[0].getSchemaName()).toBe('firstName');
      expect(clone.getFieldByStorageKey('lastName')).toBe(undefined);
    });

    it('returns root calls with values', () => {
      expect(me.getRootCall()).toEqual(
        {name: 'me', value: null}
      );

      expect(usernames.getRootCall()).toEqual(
        {name: 'usernames', value: 'mroch'}
      );

      expect(getNode(Relay.QL`
        query {
          usernames(names:["a","b","c"]) {
            firstName
          }
        }
      `).getRootCall()).toEqual(
        {name: 'usernames', value: ['a', 'b', 'c']}
      );
    });

    it('returns ref params', () => {
      // non-ref query:
      expect(me.getBatchCall()).toBe(null);

      // ref query:
      var root = getNode(new GraphQL.Query(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          new GraphQL.Field('id'),
          new GraphQL.Field('name'),
        ]
      ));
      var batchCall = root.getBatchCall();
      expect(batchCall).toEqual({
        refParamName: 'ref_q0',
        sourceQueryID: 'q0',
        sourceQueryPath: '$.*.actor.id',
      });
    });

    it('is not equal to non-root nodes', () => {
      var fragment = getNode(Relay.QL`
        fragment on Viewer {
          actor {
            id
          }
        }
      `);
      var id = fragment.getChildren()[0].getChildren()[0];
      expect(me.equals(fragment)).toBe(false);
      expect(me.equals(id)).toBe(false);
    });

    it('is not equal to queries with different root calls', () => {
      var diffRoot = getNode(Relay.QL`
        query {
          usernames(names:"joesavona") {
            firstName
          }
        }
      `);
      expect(usernames.equals(diffRoot)).toBe(false);
    });

    it('equals the same query', () => {
      expect(usernames.equals(usernames)).toBe(true);
      expect(me.equals(me)).toBe(true);
    });

    it('equals equivalent queries', () => {
      var me2 = getNode(Relay.QL`
        query {
          me {
            name1: firstName,
            name1: lastName,
          }
        }
      `);

      var usernames2 = getNode(Relay.QL`
        query {
          usernames(names:"mroch") {
            firstName,
          }
        }
      `);
      usernames2.__concreteNode__.metadata = {rootArg: 'names'};

      expect(me.equals(me2)).toBe(true);
      expect(usernames.equals(usernames2)).toBe(true);
      expect(me2.equals(me)).toBe(true);
      expect(usernames2.equals(usernames)).toBe(true);
    });

    it('does not equal different queries with the same root', () => {
      var me2 = getNode(Relay.QL`
        query {
          me {
            name1: firstName,
            lastName,
          }
        }
      `);

      var usernames2 = getNode(Relay.QL`
        query {
          usernames(names:"mroch") {
            firstName,
            lastName
          }
        }
      `);
      expect(me.equals(me2)).toBe(false);
      expect(usernames.equals(usernames2)).toBe(false);
      expect(me2.equals(me)).toBe(false);
      expect(usernames2.equals(usernames)).toBe(false);
    });

    it('equals identical ref queries with matching ref params', () => {
      var node = getNode(new GraphQL.Query(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          new GraphQL.Field('id'),
          new GraphQL.Field('name'),
        ]
      ));
      var other = getNode(new GraphQL.Query(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          new GraphQL.Field('id'),
          new GraphQL.Field('name'),
        ]
      ));
      expect(node.equals(other)).toBe(true);
    });

    it('does not equal queries with different ref params', () => {
      var node = getNode(new GraphQL.Query(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.actor.id'),
        [
          new GraphQL.Field('id'),
          new GraphQL.Field('name'),
        ]
      ));
      var other = getNode(new GraphQL.Query(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.actor.current_city.id'),
        [
          new GraphQL.Field('id'),
          new GraphQL.Field('name'),
        ]
      ));
      expect(node.equals(other)).toBe(false);
    });

    it('is not a ref query dependency', () => {
      expect(me.isRefQueryDependency()).toBe(false);
    });

    it('is not generated', () => {
      expect(me.isGenerated()).toBe(false);
    });

    it('is not scalar', () => {
      // query with children
      expect(me.isScalar()).toBe(false);

      // empty query
      expect(getNode(new GraphQL.Query('node')).isScalar()).toBe(false);
    });

    it('returns the call type', () => {
      var query = getNode(Relay.QL`query{node(id:"123"){id}}`);
      query.__concreteNode__.metadata = {rootCallType: 'scalar'};
      expect(query.getCallType()).toBe('scalar');

      var me = getNode(Relay.QL`query{me{id}}`);
      expect(me.getCallType()).toBe(undefined);
    });

    it('creates nodes', () => {
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var node = Relay.QL`
        fragment on Viewer {
          actor {
            id
          }
        }
      `;
      var actorID = query.createNode(node);
      expect(actorID instanceof RelayQuery.Fragment).toBe(true);
      expect(actorID.getType()).toBe('Viewer');
      expect(actorID.getRoute()).toBe(query.getRoute());
      expect(actorID.getVariables()).toBe(query.getVariables());
    });

    it('returns deferred fragment names if present', () => {
      var fragment2 = Relay.QL`
        fragment on User {
          name,
        }
      `;
      var fragment1a = Relay.QL`
        fragment on User {
          id,
          ${defer(fragment2)},
        }
      `;
      var fragment1b = Relay.QL`
        fragment on User {
          id,
          ${defer(fragment2)},
        }
      `;
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              ${defer(fragment1a)},
              ${Relay.QL`
        fragment on User {
          ${defer(fragment1b)},
        }
      `}
            }
          }
        }
      `);
      // nested deferred fragment names are not included
      var expected = {};
      var fragment1aID = getNode(fragment1a).getFragmentID();
      var fragment1bID = getNode(fragment1b).getFragmentID();
      expected[fragment1aID] = fragment1aID;
      expected[fragment1bID] = fragment1bID;
      expect(query.getDeferredFragmentNames()).toEqual(expected);

      query = getNode(Relay.QL`
        query {
          me {
            id
          }
        }
      `);
      expect(query.getDeferredFragmentNames()).toEqual({});
    });
  });

  describe('RelayQueryFragment', () => {
    var fragment;

    beforeEach(() => {
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
      expect(fragment.getDebugName()).toBe('UnknownFile');
      expect(fragment.getType()).toBe('StreetAddress');
      expect(fragment.getFragmentID()).toBe(generateRQLFieldAlias(
        getWeakIdForObject(node) + '.$RelayTestUtils.{}'
      ));
    });

    it('returns a fragment ID based on route and variables', () => {
      var node = Relay.QL`fragment on Node{id}`;
      var route = RelayMetaRoute.get('Foo');
      var variables = {};
      var fragment = RelayQuery.Node.create(node, route, variables);
      var fragmentID = generateRQLFieldAlias('0.Foo.{}');
      expect(fragment.getFragmentID()).toBe(fragmentID);

      route = RelayMetaRoute.get('Bar');
      fragment = RelayQuery.Node.create(node, route, variables);
      fragmentID = generateRQLFieldAlias('0.Bar.{}');
      expect(fragment.getFragmentID()).toBe(fragmentID);

      variables = {foo: 'bar'};
      fragment = RelayQuery.Node.create(node, route, variables);
      fragmentID = generateRQLFieldAlias('0.Bar.{foo:"bar"}');
      expect(fragment.getFragmentID()).toBe(fragmentID);
    });

    it('returns the same ID for equivalent fragments', () => {
      var node = Relay.QL`fragment on Node{id}`;
      var route = RelayMetaRoute.get('Foo');
      var variables = {};
      var fragment1 = RelayQuery.Node.create(node, route, variables);
      var fragment2 = RelayQuery.Node.create(node, route, variables);
      var fragmentID = generateRQLFieldAlias('0.Foo.{}');

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
      expect(children[1].getDebugName()).toBe('UnknownFile');
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
  });

  describe('RelayQueryField', () => {
    var nodeId;
    var aliasedId;
    var userAddress;
    var friendScalar;
    var friendVariable;
    var generatedId;
    var generatedIdRQL;
    var pageInfo;
    var cursor;

    beforeEach(() => {
      var scalarRQL = Relay.QL`
        fragment on Node {
          id
        }
      `;
      nodeId = getNode(scalarRQL).getChildren()[0];
      expect(nodeId.getSchemaName()).toBe('id');

      var query = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"1") {
              edges {
                node {
                  special_id: id,
                },
              },
            },
          }
        }
      `);
      aliasedId = query.getChildren()[0].getChildren()[0].getChildren()[0]
        .getChildren()[0];
      expect(aliasedId.getSchemaName()).toBe('id');

      var groupRQL = Relay.QL`
        fragment on User {
          address {
            city
          }
        }
      `;
      userAddress = getNode(groupRQL).getChildren()[0];
      expect(userAddress.getSchemaName()).toBe('address');

      var friendScalarRQL = Relay.QL`
        fragment on User {
          friend_scalar: friends
            (first:"10",after:"offset",orderby:"name") {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      friendScalar = getNode(friendScalarRQL).getChildren()[0];
      expect(friendScalar.getSchemaName()).toBe('friends');
      pageInfo = getNode(friendScalarRQL).getChildren()[0].getChildren()[1];
      expect(pageInfo.getSchemaName()).toBe(RelayConnectionInterface.PAGE_INFO);
      // feed.edges.cursor
      cursor = getNode(friendScalarRQL)
        .getChildren()[0].getChildren()[0].getChildren()[1];
      expect(cursor.getSchemaName()).toBe('cursor');

      var friendVariableRQL = Relay.QL`
        fragment on User {
          friends_variable: friends(first:$first,after:$after) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      var variables = {
        after: 'offset',
        first: 10,
      };
      friendVariable = getNode(friendVariableRQL, variables).getChildren()[0];
      expect(friendVariable.getSchemaName()).toBe('friends');

      generatedIdRQL = Relay.QL`
        fragment on User {
          name
        }
      `;
      generatedId = getNode(generatedIdRQL).getChildren()[1];
      expect(generatedId.getSchemaName()).toBe('id');
    });

    it('returns the parent type', () => {
      var field = getNode(Relay.QL`
        fragment on Actor {
          name
        }
      `).getChildren()[0];
      expect(field.getParentType()).toBe('Actor');
    });

    it('gets children by storage key', () => {
      var edges = friendScalar.getFieldByStorageKey('edges');
      expect(edges).toBe(friendScalar.getChildren()[0]);
    });

    it('gets children by field', () => {
      var edges = friendScalar.getFieldByStorageKey('edges');
      expect(edges).toBe(friendScalar.getChildren()[0]);
      var varFeedEdges = friendVariable.getField(edges);
      expect(varFeedEdges).toBe(friendVariable.getChildren()[0]);
    });

    it('equals the same fields', () => {
      expect(nodeId.equals(nodeId)).toBe(true);
      expect(userAddress.equals(userAddress)).toBe(true);
      expect(friendScalar.equals(friendScalar)).toBe(true);
      expect(friendVariable.equals(friendVariable)).toBe(true);
      expect(generatedId.equals(generatedId)).toBe(true);
      expect(pageInfo.equals(pageInfo)).toBe(true);
      expect(cursor.equals(cursor)).toBe(true);
    });

    it('equals equivalent fields', () => {
      var pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:"32")
        }
      `;
      var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
      var pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:$size)
        }
      `;
      var variables = {size: '32'};
      var pictureVariable =
        getNode(pictureVariableRQL,  variables).getChildren()[0];
      expect(pictureScalar.equals(pictureVariable)).toBe(true);

      var diffId = getNode(generatedIdRQL).getChildren()[1];
      expect(generatedId.equals(diffId)).toBe(true);
    });

    it('does not equal fields with different values', () => {
      var pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:"32")
        }
      `;
      var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
      var pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:$size)
        }
      `;
      var pictureVariable =
        getNode(pictureVariableRQL, {size: '33'}).getChildren()[0];
      expect(pictureScalar.equals(pictureVariable)).toBe(false);
    });

    it('scalar fields have no children', () => {
      expect(nodeId.isScalar()).toBe(true);
      expect(nodeId.getChildren().length).toBe(0);
    });

    it('returns the same object when cloning a scalar field', () => {
      expect(nodeId.clone([])).toBe(nodeId);
    });

    it('clones with updated children', () => {
      var query = getNode(Relay.QL`
        fragment on Story {
          feedback {
            id,
            canViewerComment,
          }
        }
      `).getChildren()[0];
      var clone = query.clone([query.getChildren()[0]]);
      expect(clone.getChildren().length).toBe(1);
      expect(clone.getChildren()[0].getSchemaName()).toBe('id');
      expect(clone.getFieldByStorageKey('canViewerComment')).toBe(undefined);
    });

    it('throws if cloning a scalar field with children', () => {
      expect(() => {
        nodeId.clone([null]);
      }).toFailInvariant(
        'RelayQueryNode: Cannot add children to scalar fields.'
      );
      expect(() => {
        nodeId.cloneFieldWithCalls([null], []);
      }).toFailInvariant(
        'RelayQueryField: Cannot add children to scalar fields.'
      );
    });

    it('returns children', () => {
      var children = userAddress.getChildren();
      expect(children.length).toBe(1);
      expect(children[0].getSchemaName()).toBe('city');
    });

    it('return the same object when cloning with the same children', () => {
      var children = userAddress.getChildren();
      var child = children[0];
      expect(userAddress.clone(children)).toBe(userAddress);
      expect(userAddress.clone([child])).toBe(userAddress);
      expect(userAddress.clone([child, null])).toBe(userAddress);
      expect(userAddress.clone([null, child, null])).toBe(userAddress);
    });

    it('returns a new object when cloning with different children', () => {
      expect(userAddress.clone([nodeId])).not.toBe(userAddress);
    });

    it('returns null when cloning without children', () => {
      expect(userAddress.clone([])).toBe(null);
      expect(userAddress.clone([null])).toBe(null);
      expect(userAddress.cloneFieldWithCalls([], [])).toBe(null);
      expect(userAddress.cloneFieldWithCalls([null], [])).toBe(null);
    });

    it('returns the schema/application names', () => {
      expect(friendScalar.getSchemaName()).toBe('friends');
      expect(friendScalar.getApplicationName()).toBe('friend_scalar');

      expect(friendVariable.getSchemaName()).toBe('friends');
      expect(friendVariable.getApplicationName()).toBe('friends_variable');
    });

    it('returns call types', () => {
      var field = getNode(
        Relay.QL`fragment on User{profilePicture(size:"32")}`
      ).getChildren()[0];
      field.__concreteNode__.calls[0].metadata = {type: 'scalar'};

      expect(field.getCallType('size')).toBe('scalar');
      expect(field.getCallType('nonExistentCall')).toBe(undefined);
    });

    it('throws if a variable is missing', () => {
      var pictureFragment = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
      var variables = {};
      var pictureField = getNode(pictureFragment, variables).getChildren()[0];
      expect(() => pictureField.getCallsWithValues()).toFailInvariant(
        'callsFromGraphQL(): Expected a declared value for variable, `$width`.'
      );
    });

    it('permits null or undefined variable values', () => {
      var pictureFragment = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
      var variables = {
        width: null,
        height: undefined,
      };
      var pictureField = getNode(pictureFragment, variables).getChildren()[0];
      expect(pictureField.getCallsWithValues()).toEqual([
        {
          name: 'size',
          value: [
            null,
            undefined,
          ],
        },
      ]);
    });

    describe('getSerializationKey()', () => {
      it('serializes all calls with hashing', () => {
        expect(friendScalar.getSerializationKey()).toBe(generateRQLFieldAlias(
          'friends.first(10).after(offset).orderby(name)'
        ));
      });

      it('substitutes variable values', () => {
        var key = generateRQLFieldAlias('profilePicture.size(32,64)');
        var pictureScalarRQL = Relay.QL`
          fragment on User {
            profilePicture(size:["32","64"])
          }
        `;
        var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
        expect(pictureScalar.getSerializationKey()).toBe(key);

        var pictureVariableRQL = Relay.QL`
          fragment on User {
            profilePicture(size:[$width,$height])
          }
        `;
        var variables = {
          height: 64,
          width: 32,
        };
        var pictureVariable =
          getNode(pictureVariableRQL, variables).getChildren()[0];
        expect(pictureVariable.getSerializationKey()).toBe(key);
      });
    });

    describe('getStorageKey()', () => {
      it('strips range calls on connections', () => {
        var connectionField = getNode(Relay.QL`
          fragment on User {
            friends(first:"10",isViewerFriend:true) {
              edges { node { id } }
            }
          }
        `).getChildren()[0];
        expect(connectionField.getStorageKey()).toBe(
          'friends.isViewerFriend(true)'
        );
      });

      it('preserves range-like calls on non-connections', () => {
        // NOTE: `segments.edges.node` is scalar.
        var nonConnectionField = getNode(Relay.QL`  fragment on Node {
                    segments(first:"3") {
                      edges { node }
                    }
                  }`).getChildren()[0];
        expect(nonConnectionField.getStorageKey()).toBe('segments.first(3)');
      });

      it('strips passing `if` calls', () => {
        var ifTrue = getNode(Relay.QL`  fragment on Node {
                    firstName(if:true)
                  }`).getChildren()[0];
        expect(ifTrue.getStorageKey()).toBe('firstName');

        var ifFalse = getNode(Relay.QL`  fragment on Node {
                    firstName(if:false)
                  }`).getChildren()[0];
        expect(ifFalse.getStorageKey()).toBe('firstName.if(false)');
      });

      it('strips failing `unless` calls', () => {
        var unlessTrue = getNode(Relay.QL`  fragment on Node{
                    firstName(unless:true)
                  }`).getChildren()[0];
        expect(unlessTrue.getStorageKey()).toBe('firstName.unless(true)');

        var unlessFalse = getNode(Relay.QL`  fragment on Node{
                    firstName(unless:false)
                  }`).getChildren()[0];
        expect(unlessFalse.getStorageKey()).toBe('firstName');
      });

      it('substitutes variable values', () => {
        var key = 'profilePicture.size(32,64)';
        var pictureScalarRQL = Relay.QL`
          fragment on User {
            profilePicture(size:["32","64"])
          }
        `;
        var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
        expect(pictureScalar.getStorageKey()).toBe(key);

        var pictureVariableRQL = Relay.QL`
          fragment on User {
            profilePicture(size:[$width,$height])
          }
        `;
        var variables = {
          height: 64,
          width: 32,
        };
        var pictureVariable =
          getNode(pictureVariableRQL, variables).getChildren()[0];
        expect(pictureVariable.getStorageKey()).toBe(key);
      });
    });

    it('returns arguments with values', () => {
      // scalar values are converted to strings
      expect(friendScalar.getCallsWithValues()).toEqual([
        {name: 'first', value: '10'},
        {name: 'after', value: 'offset'},
        {name: 'orderby', value: 'name'},
      ]);
      // variables return their values
      expect(friendVariable.getCallsWithValues()).toEqual([
        {name: 'first', value: 10},
        {name: 'after', value: 'offset'}
      ]);

      var pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:["32","64"])
        }
      `;
      var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
      expect(pictureScalar.getCallsWithValues()).toEqual([
        {name: 'size', value: ['32', '64']}
      ]);

      var pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
      var variables = {
        height: '64',
        width: 32,
      };
      var pictureVariable =
        getNode(pictureVariableRQL, variables).getChildren()[0];
      expect(pictureVariable.getCallsWithValues()).toEqual([
        {name: 'size', value: [32, '64']}
      ]);
    });

    it('returns arguments with array values', () => {
      var variables = {vanities: ['a', 'b', 'c']};
      var usernamesQuery = getNode(Relay.QL`
        query {
          usernames(names:$vanities) {
            id
          }
        }
      `, variables);
      expect(usernamesQuery.getRootCall()).toEqual(
        {name: 'usernames', value: ['a', 'b', 'c']}
      );
    });

    it('clones with different call values', () => {
      var clonedFeed = friendVariable.cloneFieldWithCalls(
        friendVariable.getChildren(),
        [{name: 'first', value: 25}]
      );
      expect(clonedFeed.getSchemaName()).toBe('friends');
      expect(clonedFeed.getCallsWithValues()).toEqual([
        {name: 'first', value: 25}
      ]);
      expect(clonedFeed.getSerializationKey()).toEqual(
        generateRQLFieldAlias('friends.first(25)')
      );
      expect(clonedFeed.getStorageKey()).toEqual('friends');

      clonedFeed = friendVariable.cloneFieldWithCalls(
        friendVariable.getChildren(),
        [
          {name: 'first', value: 10},
          {name: 'after', value: 'offset'},
        ]
      );
      expect(clonedFeed).toBe(friendVariable);
    });

    it('returns isGenerated', () => {
      expect(aliasedId.isGenerated()).toBe(false);
      expect(cursor.isGenerated()).toBe(true);
      expect(userAddress.isGenerated()).toBe(false);
      expect(generatedId.isGenerated()).toBe(true);
      expect(nodeId.isGenerated()).toBe(false);
      expect(pageInfo.isGenerated()).toBe(true);
    });

    it('returns isRefQueryDependency', () => {
      // Not ref query dependencies:
      expect(aliasedId.isRefQueryDependency()).toBe(false);
      expect(cursor.isRefQueryDependency()).toBe(false);
      expect(userAddress.isRefQueryDependency()).toBe(false);
      expect(generatedId.isRefQueryDependency()).toBe(false);
      expect(nodeId.isRefQueryDependency()).toBe(false);
      expect(pageInfo.isRefQueryDependency()).toBe(false);

      // Pretend some of them are ref query dependencies:
      expect(aliasedId.cloneAsRefQueryDependency().isRefQueryDependency())
        .toBe(true);
      expect(cursor.cloneAsRefQueryDependency().isRefQueryDependency())
        .toBe(true);
      expect(generatedId.cloneAsRefQueryDependency().isRefQueryDependency())
        .toBe(true);
      expect(nodeId.cloneAsRefQueryDependency().isRefQueryDependency())
        .toBe(true);
      expect(pageInfo.cloneAsRefQueryDependency().isRefQueryDependency())
        .toBe(true);
    });

    it('returns isRequisite', () => {
      expect(aliasedId.isRequisite()).toBe(true);
      expect(cursor.isRequisite()).toBe(true);
      expect(userAddress.isRequisite()).toBe(false);
      expect(generatedId.isRequisite()).toBe(true);
      expect(nodeId.isRequisite()).toBe(true);
      expect(pageInfo.isRequisite()).toBe(true);
    });

    it('returns isFindable', () => {
      expect(nodeId.isFindable()).toBe(false);
      expect(friendScalar.isFindable()).toBe(true);
      expect(userAddress.isFindable()).toBe(false);
    });

    it('returns the inferred primary key', () => {
      var field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
      expect(field.getInferredPrimaryKey()).toBe('id');

      expect(friendScalar.getInferredPrimaryKey()).toBe(undefined);
    });

    it('returns the inferred root call name', () => {
      var field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
      expect(field.getInferredRootCallName()).toBe('node');

      expect(friendScalar.getInferredRootCallName()).toBe(undefined);
    });

    it('creates nodes', () => {
      var fragmentRQL = Relay.QL`
        fragment on FeedUnit {
          actorCount
        }
      `;
      var node = nodeId.createNode(fragmentRQL);
      expect(node instanceof RelayQuery.Fragment).toBe(true);
      expect(node.getType()).toBe('FeedUnit');
      expect(node.getRoute()).toBe(nodeId.getRoute());
      expect(node.getVariables()).toBe(nodeId.getVariables());
    });
  });

  describe('RelayQueryMutation', () => {
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
      expect(mutationQuery.getName()).toBe('UnknownFile');
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

  describe('buildRoot()', () => {
    it('creates roots', () => {
      var field = RelayQuery.Node.buildField('id');
      var root = RelayQuery.Node.buildRoot(
        'node',
        '4',
        [field]
      );
      expect(root instanceof RelayQuery.Root).toBe(true);
      expect(root.getRootCall()).toEqual({
        name: 'node',
        value: '4'
      });
      expect(root.getChildren().length).toBe(1);
      expect(root.getChildren()[0]).toBe(field);
    });

    it('creates deferred roots', () => {
      var field = RelayQuery.Node.buildField('id');
      var root = RelayQuery.Node.buildRoot(
        'node',
        '4',
        [field],
        {isDeferred: true}
      );
      expect(root instanceof RelayQuery.Root).toBe(true);
      expect(root.getRootCall()).toEqual({
        name: 'node',
        value: '4'
      });
      expect(root.getChildren().length).toBe(1);
      expect(root.getChildren()[0]).toBe(field);
    });

    it('creates roots with batch calls', () => {
      var root = RelayQuery.Node.buildRoot(
        'node',
        new GraphQL.BatchCallVariable('q0', '$.*.id'),
        []
      );
      expect(root instanceof RelayQuery.Root).toBe(true);
      expect(root.getBatchCall()).toEqual({
        refParamName: 'ref_q0',
        sourceQueryID: 'q0',
        sourceQueryPath: '$.*.id',
      });
    });
  });

  describe('buildFragment()', () => {
    it('creates empty fragments', () => {
      var fragment = RelayQuery.Node.buildFragment(
        'TestFragment',
        'Node',
        []
      );
      expect(fragment instanceof RelayQuery.Fragment).toBe(true);
      expect(fragment.getDebugName()).toBe('TestFragment');
      expect(fragment.getType()).toBe('Node');
      expect(fragment.getChildren().length).toBe(0);
      expect(fragment.isPlural()).toBe(false);
    });

    it('creates fragments', () => {
      var field = RelayQuery.Node.buildField('id');
      var fragment = RelayQuery.Node.buildFragment(
        'TestFragment',
        'Node',
        [field],
        {isPlural: true, scope: 'RelayQuery_Foo'}
      );
      expect(fragment instanceof RelayQuery.Fragment).toBe(true);
      expect(fragment.getDebugName()).toBe('TestFragment');
      expect(fragment.getType()).toBe('Node');
      expect(fragment.getChildren().length).toBe(1);
      expect(fragment.getChildren()[0]).toBe(field);
      expect(fragment.isPlural()).toBe(true);
    });
  });

  describe('buildField()', () => {
    it('builds scalar fields', () => {
      var field = RelayQuery.Node.buildField('id');
      expect(field instanceof RelayQuery.Field).toBe(true);
      expect(field.getSchemaName()).toBe('id');
      expect(field.getApplicationName()).toBe('id');
      expect(field.isScalar()).toBe(true);
      expect(field.getChildren().length).toBe(0);
      expect(field.getCallsWithValues()).toEqual([]);
    });

    it('builds fields with children', () => {
      var child = RelayQuery.Node.buildField('id');
      var fragment = getNode(Relay.QL`fragment on Node{id}`);
      var field = RelayQuery.Node.buildField('node', null, [child, fragment]);
      expect(field.isScalar()).toBe(false);
      var children = field.getChildren();
      expect(children.length).toBe(2);
      expect(children[0]).toBe(child);
      expect(children[1]).toBe(fragment);
    });

    it('builds fields with calls', () => {
      var field = RelayQuery.Node.buildField('profilePicture', [
        {name: 'size', value: 32},
      ]);
      expect(field.getCallsWithValues()).toEqual([
        {name: 'size', value: 32},
      ]);
      field = RelayQuery.Node.buildField('profilePicture', [
        {name: 'size', value: ['32']},
      ]);
      expect(field.getCallsWithValues()).toEqual([
        {name: 'size', value: ['32']},
      ]);
    });
  });

  describe('isEquivalent()', () => {
    it('returns false for different concrete nodes', () => {
      var node1 = getNode(Relay.QL`fragment on Node{id}`);
      var ndoe2 = getNode(Relay.QL`fragment on Node{id}`);
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('return false for different variables', () => {
      var fragment = Relay.QL`fragment on Node{id}`;

      var node1 = getNode(fragment, {a: true});
      var ndoe2 = getNode(fragment, {a: false});
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('returns false for different routes', () => {
      var fragment = Relay.QL`fragment on Node{id}`;
      var variables = {a: false};
      var route1 = RelayMetaRoute.get('route1');
      var route2 = RelayMetaRoute.get('route2');

      var node1 = RelayQuery.Node.create(fragment, route1, variables);
      var node2 = RelayQuery.Node.create(fragment, route2, variables);
      expect(node1.isEquivalent(node2)).toBe(false);
    });

    it('returns true for identical node, route, and variables', () => {
      var fragment = Relay.QL`fragment on Node{id}`;
      var variables = {a: false};
      var route = RelayMetaRoute.get('route1');

      var node1 = RelayQuery.Node.create(fragment, route, variables);
      var node2 = RelayQuery.Node.create(fragment, route, variables);
      expect(node1.isEquivalent(node2)).toBe(true);
    });
  });

  describe('getChildren()', () => {
    it('expands fragment references', () => {
      var innerFragment = Relay.QL`
        fragment on User {
          id,
          profilePicture(size:$size) {
            uri,
          },
        }
      `;
      var reference = new RelayFragmentReference(
        () => innerFragment,
        {
          size: 'default',
        },
        {
          size: new GraphQL.CallVariable('outerSize'),
        }
      );
      var fragment = getNode(Relay.QL`
        fragment on User {
          id,
          ${reference},
        }
      `, {
        outerSize: 'override',
      });
      var children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('id');

      // the reference is expanded with overridden query variables
      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      var grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', value: 'override'},
      ]);
    });
  });

  describe('buildMutation()', () => {
    it('builds mutation', () => {
      var field = RelayQuery.Node.buildField('does_viewer_like');
      var mutation = RelayQuery.Node.buildMutation(
        'FeedbackLikeMutation',
        'FeedbackLikeResponsePayload',
        'feedback_like',
        [field]
      );

      expect(mutation instanceof RelayQuery.Mutation).toBe(true);
      expect(mutation.getName()).toBe('FeedbackLikeMutation');
      expect(mutation.getResponseType()).toBe('FeedbackLikeResponsePayload');
      expect(mutation.getChildren().length).toBe(1);
      expect(mutation.getChildren()[0]).toBe(field);
      expect(mutation.getCall()).toEqual({name: 'feedback_like', value: ''});
      expect(mutation.getCallVariableName()).toEqual('input');
    });
  });
});

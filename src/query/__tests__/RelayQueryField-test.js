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
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayQuery = require('RelayQuery');
var generateRQLFieldAlias = require('generateRQLFieldAlias');

describe('RelayQueryField', () => {
  var {getNode} = RelayTestUtils;

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
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);

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

  it('returns directives', () => {
    var field = getNode(Relay.QL`
      fragment on Story {
        feedback @include(if: $cond) @foo(int: 10, bool: true, str: "string")
      }
    `, {cond: true}).getChildren()[0];
    expect(field.getDirectives()).toEqual([
      {
        name: 'include',
        arguments: [
          {name: 'if', value: true},
        ],
      },
      {
        name: 'foo',
        arguments: [
          {name: 'int', value: 10},
          {name: 'bool', value: true},
          {name: 'str', value: 'string'},
        ],
      }
    ]);
  });
});

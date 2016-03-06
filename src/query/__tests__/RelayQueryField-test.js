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
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const generateRQLFieldAlias = require('generateRQLFieldAlias');

describe('RelayQueryField', () => {
  var {getNode} = RelayTestUtils;

  let aliasedIdField;
  let cursorField;
  let edgesField;
  let friendsScalarField;
  let friendsConnectionField;
  let friendsVariableField;
  let generatedIdField;
  let generatedIdFieldRQL;
  let nodeField;
  let nodeIdField;
  let pageInfoField;
  let userAddressField;

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);

    var scalarRQL = Relay.QL`
      fragment on Node {
        id
      }
    `;
    nodeIdField = getNode(scalarRQL).getChildren()[0];
    expect(nodeIdField.getSchemaName()).toBe('id');

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
    friendsConnectionField = query.getChildren()[0];
    edgesField = friendsConnectionField.getChildren()[0];
    nodeField = edgesField.getChildren()[0];
    aliasedIdField =  nodeField.getChildren()[0];
    expect(aliasedIdField.getSchemaName()).toBe('id');

    var groupRQL = Relay.QL`
      fragment on User {
        address {
          city
        }
      }
    `;
    userAddressField = getNode(groupRQL).getChildren()[0];
    expect(userAddressField.getSchemaName()).toBe('address');

    var friendsScalarFieldRQL = Relay.QL`
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
    friendsScalarField = getNode(friendsScalarFieldRQL).getChildren()[0];
    expect(friendsScalarField.getSchemaName()).toBe('friends');
    pageInfoField = getNode(friendsScalarFieldRQL)
      .getChildren()[0]
      .getChildren()[1];
    expect(pageInfoField.getSchemaName())
      .toBe(RelayConnectionInterface.PAGE_INFO);
    // feed.edges.cursor
    cursorField = getNode(friendsScalarFieldRQL)
      .getChildren()[0].getChildren()[0].getChildren()[1];
    expect(cursorField.getSchemaName()).toBe('cursor');

    var friendsVariableFieldRQL = Relay.QL`
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
    friendsVariableField =
      getNode(friendsVariableFieldRQL, variables).getChildren()[0];
    expect(friendsVariableField.getSchemaName()).toBe('friends');

    generatedIdFieldRQL = Relay.QL`
      fragment on User {
        name
      }
    `;
    generatedIdField = getNode(generatedIdFieldRQL).getChildren()[1];
    expect(generatedIdField.getSchemaName()).toBe('id');
  });

  it('returns the type', () => {
    var actor = getNode(Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `).getChildren()[0];
    expect(actor.getType()).toBe('Actor');
  });

  it('gets children by storage key', () => {
    var edges = friendsScalarField.getFieldByStorageKey('edges');
    expect(edges).toBe(friendsScalarField.getChildren()[0]);
  });

  it('gets children by field', () => {
    var edges = friendsScalarField.getFieldByStorageKey('edges');
    expect(edges).toBe(friendsScalarField.getChildren()[0]);
    var varFeedEdges = friendsVariableField.getField(edges);
    expect(varFeedEdges).toBe(friendsVariableField.getChildren()[0]);
  });

  it('equals the same fields', () => {
    expect(nodeIdField.equals(nodeIdField)).toBe(true);
    expect(userAddressField.equals(userAddressField)).toBe(true);
    expect(friendsScalarField.equals(friendsScalarField)).toBe(true);
    expect(friendsVariableField.equals(friendsVariableField)).toBe(true);
    expect(generatedIdField.equals(generatedIdField)).toBe(true);
    expect(pageInfoField.equals(pageInfoField)).toBe(true);
    expect(cursorField.equals(cursorField)).toBe(true);
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

    var diffId = getNode(generatedIdFieldRQL).getChildren()[1];
    expect(generatedIdField.equals(diffId)).toBe(true);
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
    expect(nodeIdField.canHaveSubselections()).toBe(false);
    expect(nodeIdField.getChildren().length).toBe(0);
  });

  it('returns the same object when cloning a scalar field', () => {
    expect(nodeIdField.clone([])).toBe(nodeIdField);
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

  it('throws if cloning a subselection-ineligible field with children', () => {
    const expectedError = (
      'RelayQueryNode: Cannot add children to field `id` because it does not ' +
      'support sub-selections (sub-fields).'
    );
    expect(() => {
      nodeIdField.clone([null]);
    }).toFailInvariant(expectedError);
    expect(() => {
      nodeIdField.cloneFieldWithCalls([null], []);
    }).toFailInvariant(expectedError);
  });

  it('returns children', () => {
    var children = userAddressField.getChildren();
    expect(children.length).toBe(1);
    expect(children[0].getSchemaName()).toBe('city');
  });

  it('return the same object when cloning with the same children', () => {
    var children = userAddressField.getChildren();
    var child = children[0];
    expect(userAddressField.clone(children)).toBe(userAddressField);
    expect(userAddressField.clone([child])).toBe(userAddressField);
    expect(userAddressField.clone([child, null])).toBe(userAddressField);
    expect(userAddressField.clone([null, child, null])).toBe(userAddressField);
  });

  it('returns a new object when cloning with different children', () => {
    expect(userAddressField.clone([nodeIdField])).not.toBe(userAddressField);
  });

  it('returns null when cloning without children', () => {
    expect(userAddressField.clone([])).toBe(null);
    expect(userAddressField.clone([null])).toBe(null);
    expect(userAddressField.cloneFieldWithCalls([], [])).toBe(null);
    expect(userAddressField.cloneFieldWithCalls([null], [])).toBe(null);
  });

  it('returns the schema/application names', () => {
    expect(friendsScalarField.getSchemaName()).toBe('friends');
    expect(friendsScalarField.getApplicationName()).toBe('friend_scalar');

    expect(friendsVariableField.getSchemaName()).toBe('friends');
    expect(friendsVariableField.getApplicationName()).toBe('friends_variable');
  });

  it('returns call types', () => {
    var field = getNode(
      Relay.QL`fragment on User{profilePicture(size:"32")}`
    ).getChildren()[0];
    field.getConcreteQueryNode().calls[0].metadata = {type: 'scalar'};

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

  describe('canHaveSubselections()', () => {
    it('returns true for fields that support sub-selections', () => {
      expect(edgesField.canHaveSubselections()).toBe(true);
      expect(friendsConnectionField.canHaveSubselections()).toBe(true);
      expect(friendsScalarField.canHaveSubselections()).toBe(true);
      expect(friendsVariableField.canHaveSubselections()).toBe(true);
      expect(nodeField.canHaveSubselections()).toBe(true);
      expect(pageInfoField.canHaveSubselections()).toBe(true);
      expect(userAddressField.canHaveSubselections()).toBe(true);
    });

    it('returns false for fields that do not support sub-selections', () => {
      expect(aliasedIdField.canHaveSubselections()).toBe(false);
      expect(cursorField.canHaveSubselections()).toBe(false);
      expect(generatedIdField.canHaveSubselections()).toBe(false);
      expect(nodeIdField.canHaveSubselections()).toBe(false);
    });
  });

  describe('getRangeBehaviorKey()', () => {
    it('strips range calls on connections', () => {
      var connectionField = getNode(
        Relay.QL`fragment on User { friends(first:"10",isViewerFriend:true) }`
      ).getChildren()[0];
      expect(connectionField.getRangeBehaviorKey())
        .toBe('isViewerFriend(true)');
    });

    it('throws for non-connection fields', () => {
      var nonConnectionField = getNode(
        Relay.QL`query { node(id:"4") }`
      ).getChildren()[0];
      expect(nonConnectionField.getRangeBehaviorKey).toThrow();
    });

    it('strips passing `if` calls', () => {
      var ifTrue = getNode(
        Relay.QL`fragment on User { friends(if:true) }`
      ).getChildren()[0];
      expect(ifTrue.getRangeBehaviorKey()).toBe('');

      var ifFalse = getNode(
        Relay.QL`fragment on User { friends(if:false) }`
      ).getChildren()[0];
      expect(ifFalse.getRangeBehaviorKey()).toBe('if(false)');
    });

    it('strips failing `unless` calls', () => {
      var unlessTrue = getNode(
        Relay.QL`fragment on User { friends(unless:true) }`
      ).getChildren()[0];
      expect(unlessTrue.getRangeBehaviorKey()).toBe('unless(true)');

      var unlessFalse = getNode(Relay.QL`
        fragment on User {
          friends(unless:false)
        }
      `).getChildren()[0];
      expect(unlessFalse.getRangeBehaviorKey()).toBe('');
    });

    it('substitutes variable values', () => {
      var key = 'isViewerFriend(false)';
      var friendsScalarRQL = Relay.QL`
        fragment on User { friends(isViewerFriend:false) }
      `;
      var friendsScalar = getNode(friendsScalarRQL).getChildren()[0];
      expect(friendsScalar.getRangeBehaviorKey()).toBe(key);

      var friendsVariableRQL = Relay.QL`
        fragment on User { friends(isViewerFriend:$isViewerFriend) }
      `;
      var variables = {isViewerFriend: false};
      var friendsVariable =
        getNode(friendsVariableRQL, variables).getChildren()[0];
      expect(friendsVariable.getRangeBehaviorKey()).toBe(key);
    });

    it('produces stable keys regardless of argument order', () => {
      var friendFieldA = getNode(Relay.QL`fragment on User {
        friends(orderby: "name", isViewerFriend: true)
      }`).getChildren()[0];
      var friendFieldB = getNode(Relay.QL`fragment on User {
        friends(isViewerFriend: true, orderby: "name")
      }`).getChildren()[0];
      const expectedKey = 'isViewerFriend(true).orderby(name)';
      expect(friendFieldA.getRangeBehaviorKey()).toBe(expectedKey);
      expect(friendFieldB.getRangeBehaviorKey()).toBe(expectedKey);
    });
  });

  describe('getSerializationKey()', () => {
    it('serializes all calls', () => {
      expect(friendsScalarField.getSerializationKey()).toBe(
        generateRQLFieldAlias('friends.after(offset).first(10).orderby(name)')
      );
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

  describe('getShallowHash()', () => {
    it('serializes all calls', () => {
      expect(friendsScalarField.getShallowHash()).toBe(
        'friends{after:"offset",first:"10",orderby:"name"}'
      );
    });

    it('serializes argument literal values', () => {
      var node = getNode(Relay.QL`
        fragment on User {
          profilePicture(size: ["32", "64"])
        }
      `);
      expect(node.getChildren()[0].getShallowHash()).toBe(
        'profilePicture{size:[0:"32",1:"64"]}'
      );
    });

    it('serializes argument variable values', () => {
      var node = getNode(Relay.QL`
        fragment on User {
          profilePicture(size: [$width, $height])
        }
      `, {
        width: 32,
        height: 64,
      });
      expect(node.getChildren()[0].getShallowHash()).toBe(
        'profilePicture{size:[0:32,1:64]}'
      );
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
      expect(connectionField.getStorageKey())
        .toBe('friends{isViewerFriend:true}');
    });

    it('preserves range-like calls on non-connections', () => {
      // NOTE: `segments.edges.node` is scalar.
      var nonConnectionField = getNode(Relay.QL`
        fragment on Node {
          segments(first:"3") {
            edges { node }
          }
        }
      `).getChildren()[0];
      expect(nonConnectionField.getStorageKey()).toBe('segments{first:"3"}');
    });

    it('strips passing `if` calls', () => {
      var ifTrue = getNode(Relay.QL`
        fragment on Node {
          firstName(if:true)
        }
      `).getChildren()[0];
      expect(ifTrue.getStorageKey()).toBe('firstName');

      var ifFalse = getNode(Relay.QL`
        fragment on Node {
          firstName(if:false)
        }
      `).getChildren()[0];
      expect(ifFalse.getStorageKey()).toBe('firstName{if:false}');
    });

    it('strips failing `unless` calls', () => {
      var unlessTrue = getNode(Relay.QL`
        fragment on Node{
          firstName(unless:true)
        }
      `).getChildren()[0];
      expect(unlessTrue.getStorageKey()).toBe('firstName{unless:true}');

      var unlessFalse = getNode(Relay.QL`
        fragment on Node{
          firstName(unless:false)
        }
      `).getChildren()[0];
      expect(unlessFalse.getStorageKey()).toBe('firstName');
    });

    it('substitutes variable values', () => {
      var key = 'profilePicture{size:[0:"32",1:"64"]}';
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
        height: '64',
        width: '32',
      };
      var pictureVariable =
        getNode(pictureVariableRQL, variables).getChildren()[0];
      expect(pictureVariable.getStorageKey()).toBe(key);
    });

    it('produces stable keys regardless of argument order', () => {
      var pictureFieldA = getNode(Relay.QL`fragment on User {
        profilePicture(size: "32", preset: SMALL)
      }`).getChildren()[0];
      var pictureFieldB = getNode(Relay.QL`fragment on User {
        profilePicture(preset: SMALL, size: "32")
      }`).getChildren()[0];
      const expectedKey = 'profilePicture{preset:"SMALL",size:"32"}';
      expect(pictureFieldA.getStorageKey()).toBe(expectedKey);
      expect(pictureFieldB.getStorageKey()).toBe(expectedKey);
    });
  });

  it('returns arguments with values', () => {
    // scalar values are converted to strings
    expect(friendsScalarField.getCallsWithValues()).toEqual([
      {name: 'first', value: '10'},
      {name: 'after', value: 'offset'},
      {name: 'orderby', value: 'name'},
    ]);
    // variables return their values
    expect(friendsVariableField.getCallsWithValues()).toEqual([
      {name: 'first', value: 10},
      {name: 'after', value: 'offset'},
    ]);

    var pictureScalarRQL = Relay.QL`
      fragment on User {
        profilePicture(size:["32","64"])
      }
    `;
    var pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
    expect(pictureScalar.getCallsWithValues()).toEqual([
      {name: 'size', value: ['32', '64']},
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
      {name: 'size', value: [32, '64']},
    ]);
  });

  it('returns arguments with array values', () => {
    var variables = {size: [32, 64]};
    var profilePicture = getNode(Relay.QL`
      fragment on User {
        profilePicture(size: $size)
      }
    `, variables).getChildren()[0];
    expect(profilePicture.getCallsWithValues()).toEqual(
      [{name: 'size', value: [32, 64]}]
    );
  });

  it('clones with different call values', () => {
    var clonedFeed = friendsVariableField.cloneFieldWithCalls(
      friendsVariableField.getChildren(),
      [{name: 'first', value: 25}]
    );
    expect(clonedFeed.getSchemaName()).toBe('friends');
    expect(clonedFeed.getCallsWithValues()).toEqual([
      {name: 'first', value: 25},
    ]);
    expect(clonedFeed.getSerializationKey()).toEqual(
      generateRQLFieldAlias('friends.first(25)')
    );
    expect(clonedFeed.getStorageKey()).toEqual('friends');

    clonedFeed = friendsVariableField.cloneFieldWithCalls(
      friendsVariableField.getChildren(),
      [
        {name: 'first', value: 10},
        {name: 'after', value: 'offset'},
      ]
    );
    expect(clonedFeed).toBe(friendsVariableField);
  });

  it('returns isAbstract', () => {
    expect(getNode(Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `).getFieldByStorageKey('actor').isAbstract()).toBe(true);
    expect(getNode(Relay.QL`
      fragment on User {
        address {
          city
        }
      }
    `).getFieldByStorageKey('address').isAbstract()).toBe(false);
  });

  it('returns isGenerated', () => {
    expect(aliasedIdField.isGenerated()).toBe(false);
    expect(cursorField.isGenerated()).toBe(true);
    expect(userAddressField.isGenerated()).toBe(false);
    expect(generatedIdField.isGenerated()).toBe(true);
    expect(nodeIdField.isGenerated()).toBe(false);
    expect(pageInfoField.isGenerated()).toBe(true);
  });

  it('returns isRefQueryDependency', () => {
    // Not ref query dependencies:
    expect(aliasedIdField.isRefQueryDependency()).toBe(false);
    expect(cursorField.isRefQueryDependency()).toBe(false);
    expect(userAddressField.isRefQueryDependency()).toBe(false);
    expect(generatedIdField.isRefQueryDependency()).toBe(false);
    expect(nodeIdField.isRefQueryDependency()).toBe(false);
    expect(pageInfoField.isRefQueryDependency()).toBe(false);

    // Pretend some of them are ref query dependencies:
    expect(aliasedIdField.cloneAsRefQueryDependency().isRefQueryDependency())
      .toBe(true);
    expect(cursorField.cloneAsRefQueryDependency().isRefQueryDependency())
      .toBe(true);
    expect(generatedIdField.cloneAsRefQueryDependency().isRefQueryDependency())
      .toBe(true);
    expect(nodeIdField.cloneAsRefQueryDependency().isRefQueryDependency())
      .toBe(true);
    expect(pageInfoField.cloneAsRefQueryDependency().isRefQueryDependency())
      .toBe(true);
  });

  it('returns isRequisite', () => {
    expect(aliasedIdField.isRequisite()).toBe(true);
    expect(cursorField.isRequisite()).toBe(true);
    expect(userAddressField.isRequisite()).toBe(false);
    expect(generatedIdField.isRequisite()).toBe(true);
    expect(nodeIdField.isRequisite()).toBe(true);
    expect(pageInfoField.isRequisite()).toBe(true);
  });

  it('returns isFindable', () => {
    expect(nodeIdField.isFindable()).toBe(false);
    expect(friendsScalarField.isFindable()).toBe(true);
    expect(userAddressField.isFindable()).toBe(false);
  });

  it('returns the inferred primary key', () => {
    var field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
    expect(field.getInferredPrimaryKey()).toBe('id');

    expect(friendsScalarField.getInferredPrimaryKey()).toBe(undefined);
  });

  it('returns the inferred root call name', () => {
    var field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
    expect(field.getInferredRootCallName()).toBe('node');

    expect(friendsScalarField.getInferredRootCallName()).toBe(undefined);
  });

  it('creates nodes', () => {
    var fragmentRQL = Relay.QL`
      fragment on FeedUnit {
        actorCount
      }
    `;
    var node = nodeIdField.createNode(fragmentRQL);
    expect(node instanceof RelayQuery.Fragment).toBe(true);
    expect(node.getType()).toBe('FeedUnit');
    expect(node.getRoute()).toBe(nodeIdField.getRoute());
    expect(node.getVariables()).toBe(nodeIdField.getVariables());
    expect(node.getFieldByStorageKey('actorCount').getType()).toBe('Int');
  });

  it('returns directives', () => {
    var field = getNode(Relay.QL`
      fragment on Story {
        feedback @include(if: $cond)
      }
    `, {cond: true}).getChildren()[0];
    expect(field.getDirectives()).toEqual([
      {
        args: [
          {name: 'if', value: true},
        ],
        name: 'include',
      },
    ]);
  });
});

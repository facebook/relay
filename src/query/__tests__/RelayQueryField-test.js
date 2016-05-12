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
const RelayVariable = require('RelayVariable');

const generateRQLFieldAlias = require('generateRQLFieldAlias');

describe('RelayQueryField', () => {
  const {getNode, getVerbatimNode} = RelayTestUtils;

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

    const scalarRQL = Relay.QL`
      fragment on Node {
        id
      }
    `;
    nodeIdField = getNode(scalarRQL).getChildren()[0];
    expect(nodeIdField.getSchemaName()).toBe('id');

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          friends(first:"1") {
            edges {
              node {
                special_id: id
              }
            }
          }
        }
      }
    `);
    friendsConnectionField = query.getChildren()[0];
    edgesField = friendsConnectionField.getChildren()[0];
    nodeField = edgesField.getChildren()[0];
    aliasedIdField =  nodeField.getChildren()[0];
    expect(aliasedIdField.getSchemaName()).toBe('id');

    const groupRQL = Relay.QL`
      fragment on User {
        address {
          city
        }
      }
    `;
    userAddressField = getNode(groupRQL).getChildren()[0];
    expect(userAddressField.getSchemaName()).toBe('address');

    const friendsScalarFieldRQL = Relay.QL`
      fragment on User {
        friends_scalar: friends
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

    const friendsVariableFieldRQL = Relay.QL`
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
    const variables = {
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
    const actor = getNode(Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `).getChildren()[0];
    expect(actor.getType()).toBe('Actor');
  });

  it('gets children by storage key', () => {
    const edges = friendsScalarField.getFieldByStorageKey('edges');
    expect(edges).toBe(friendsScalarField.getChildren()[0]);
  });

  it('gets children by field', () => {
    const edges = friendsScalarField.getFieldByStorageKey('edges');
    expect(edges).toBe(friendsScalarField.getChildren()[0]);
    const varFeedEdges = friendsVariableField.getField(edges);
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
    const pictureScalarRQL = Relay.QL`
      fragment on User {
        profilePicture(size:"32")
      }
    `;
    const pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
    const pictureVariableRQL = Relay.QL`
      fragment on User {
        profilePicture(size:$size)
      }
    `;
    const variables = {size: '32'};
    const pictureVariable =
      getNode(pictureVariableRQL,  variables).getChildren()[0];
    expect(pictureScalar.equals(pictureVariable)).toBe(true);

    const pictureTypedVariableA = getNode(
      pictureVariableRQL,
      {size: new RelayVariable('size')}
    ).getChildren()[0];
    const pictureTypedVariableB = getNode(
      pictureVariableRQL,
      {size: new RelayVariable('size')}
    ).getChildren()[0];
    expect(pictureTypedVariableA.equals(pictureTypedVariableB)).toBe(true);

    const diffId = getNode(generatedIdFieldRQL).getChildren()[1];
    expect(generatedIdField.equals(diffId)).toBe(true);
  });

  it('does not equal fields with different values', () => {
    const pictureScalarRQL = Relay.QL`
      fragment on User {
        profilePicture(size:"32")
      }
    `;
    const pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
    const pictureVariableRQL = Relay.QL`
      fragment on User {
        profilePicture(size:$size)
      }
    `;
    const pictureVariable =
      getNode(pictureVariableRQL, {size: '33'}).getChildren()[0];
    expect(pictureScalar.equals(pictureVariable)).toBe(false);

    const pictureTypedVariableA = getNode(
      pictureVariableRQL,
      {size: new RelayVariable('size')}
    ).getChildren()[0];
    const pictureMimeticVariableB = getNode(
      pictureVariableRQL,
      {size: {name: 'size'}}
    ).getChildren()[0];
    expect(pictureTypedVariableA.equals(pictureMimeticVariableB)).toBe(false);
  });

  it('scalar fields have no children', () => {
    expect(nodeIdField.canHaveSubselections()).toBe(false);
    expect(nodeIdField.getChildren().length).toBe(0);
  });

  it('returns the same object when cloning a scalar field', () => {
    expect(nodeIdField.clone([])).toBe(nodeIdField);
  });

  it('clones with updated children', () => {
    const query = getNode(Relay.QL`
      fragment on Story {
        feedback {
          id
          canViewerComment
        }
      }
    `).getChildren()[0];
    const clone = query.clone([query.getChildren()[0]]);
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
    const children = userAddressField.getChildren();
    expect(children.length).toBe(1);
    expect(children[0].getSchemaName()).toBe('city');
  });

  it('return the same object when cloning with the same children', () => {
    const children = userAddressField.getChildren();
    const child = children[0];
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
    expect(friendsScalarField.getApplicationName()).toBe('friends_scalar');

    expect(friendsVariableField.getSchemaName()).toBe('friends');
    expect(friendsVariableField.getApplicationName()).toBe('friends_variable');
  });

  it('returns call types', () => {
    const field = getNode(
      Relay.QL`fragment on User{profilePicture(size:"32")}`
    ).getChildren()[0];
    field.getConcreteQueryNode().calls[0].metadata = {type: 'scalar'};

    expect(field.getCallType('size')).toBe('scalar');
    expect(field.getCallType('nonExistentCall')).toBe(undefined);
  });

  it('throws if a variable is missing', () => {
    const pictureFragment = Relay.QL`
      fragment on User {
        profilePicture(size:[$width,$height])
      }
    `;
    const variables = {};
    const pictureField = getNode(pictureFragment, variables).getChildren()[0];
    expect(() => pictureField.getCallsWithValues()).toFailInvariant(
      'callsFromGraphQL(): Expected a declared value for variable, `$width`.'
    );
  });

  it('permits null or undefined variable values', () => {
    const pictureFragment = Relay.QL`
      fragment on User {
        profilePicture(size:[$width,$height])
      }
    `;
    const variables = {
      width: null,
      height: undefined,
    };
    const pictureField = getNode(pictureFragment, variables).getChildren()[0];
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

  describe('getRangeBehaviorCalls()', () => {
    it('strips range calls on connections', () => {
      const connectionField = getNode(
        Relay.QL`fragment on User { friends(first:"10",isViewerFriend:true) }`
      ).getChildren()[0];
      expect(connectionField.getRangeBehaviorCalls())
        .toEqual([{name: 'isViewerFriend', value: true}]);
    });

    it('throws for non-connection fields', () => {
      const nonConnectionField = getNode(
        Relay.QL`query { node(id:"4") }`
      ).getChildren()[0];
      expect(nonConnectionField.getRangeBehaviorCalls).toThrow();
    });

    it('strips passing `if` calls', () => {
      const ifTrue = getNode(
        Relay.QL`fragment on User { friends(if:true) }`
      ).getChildren()[0];
      expect(ifTrue.getRangeBehaviorCalls()).toEqual([]);

      const ifFalse = getNode(
        Relay.QL`fragment on User { friends(if:false) }`
      ).getChildren()[0];
      expect(ifFalse.getRangeBehaviorCalls()).toEqual([{
        name: 'if',
        value: false,
      }]);
    });

    it('strips failing `unless` calls', () => {
      const unlessTrue = getNode(
        Relay.QL`fragment on User { friends(unless:true) }`
      ).getChildren()[0];
      expect(unlessTrue.getRangeBehaviorCalls()).toEqual([{
        name: 'unless',
        value: true,
      }]);

      const unlessFalse = getNode(Relay.QL`
        fragment on User {
          friends(unless:false)
        }
      `).getChildren()[0];
      expect(unlessFalse.getRangeBehaviorCalls()).toEqual([]);
    });

    it('substitutes variable values', () => {
      const friendsScalarRQL = Relay.QL`
        fragment on User { friends(isViewerFriend:false) }
      `;
      const friendsScalar = getNode(friendsScalarRQL).getChildren()[0];
      expect(friendsScalar.getRangeBehaviorCalls()).toEqual([{
        name: 'isViewerFriend',
        value: false,
      }]);

      const friendsVariableRQL = Relay.QL`
        fragment on User { friends(isViewerFriend:$isViewerFriend) }
      `;
      const variables = {isViewerFriend: false};
      const friendsVariable =
        getNode(friendsVariableRQL, variables).getChildren()[0];
      expect(friendsVariable.getRangeBehaviorCalls()).toEqual([{
         name: 'isViewerFriend',
         value: false,
      }]);
    });
  });

  describe('getSerializationKey()', () => {
    it('serializes all calls', () => {
      expect(friendsScalarField.getSerializationKey()).toBe(
        generateRQLFieldAlias(
          'friends.friends_scalar.after(offset).first(10).orderby(name)'
        )
      );
    });

    it('substitutes variable values', () => {
      const key = generateRQLFieldAlias('profilePicture.size(32,64)');
      const pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:["32","64"])
        }
      `;
      const pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
      expect(pictureScalar.getSerializationKey()).toBe(key);

      const pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
      const variables = {
        height: 64,
        width: 32,
      };
      const pictureVariable =
        getNode(pictureVariableRQL, variables).getChildren()[0];
      expect(pictureVariable.getSerializationKey()).toBe(key);
    });

    it('includes the alias on fields with calls', () => {
      const fragment = getVerbatimNode(Relay.QL`
        fragment on User {
          const: profilePicture(size: "100") { uri }
          var: profilePicture(size: $size) { uri }
        }
      `, {
        size: 100,
      });
      const children = fragment.getChildren();
      expect(children[0].getSerializationKey()).toBe(
        generateRQLFieldAlias('profilePicture.const.size(100)')
      );
      expect(children[1].getSerializationKey()).toBe(
        generateRQLFieldAlias('profilePicture.var.size(100)')
      );
    });

    it('excludes the alias on fields without calls', () => {
      const fragment = getVerbatimNode(Relay.QL`
        fragment on User {
          alias: username
        }
      `);
      const children = fragment.getChildren();
      expect(children[0].getSerializationKey()).toBe('username');
    });
  });

  describe('getShallowHash()', () => {
    it('serializes all calls', () => {
      expect(friendsScalarField.getShallowHash()).toBe(
        'friends{after:"offset",first:"10",orderby:"name"}'
      );
    });

    it('serializes argument literal values', () => {
      const node = getNode(Relay.QL`
        fragment on User {
          profilePicture(size: ["32", "64"])
        }
      `);
      expect(node.getChildren()[0].getShallowHash()).toBe(
        'profilePicture{size:[0:"32",1:"64"]}'
      );
    });

    it('serializes argument variable values', () => {
      const node = getNode(Relay.QL`
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
      const connectionField = getNode(Relay.QL`
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
      const nonConnectionField = getNode(Relay.QL`
        fragment on Node {
          segments(first:"3") {
            edges { node }
          }
        }
      `).getChildren()[0];
      expect(nonConnectionField.getStorageKey()).toBe('segments{first:"3"}');
    });

    it('strips passing `if` calls', () => {
      const ifTrue = getNode(Relay.QL`
        fragment on Node {
          firstName(if:true)
        }
      `).getChildren()[0];
      expect(ifTrue.getStorageKey()).toBe('firstName');

      const ifFalse = getNode(Relay.QL`
        fragment on Node {
          firstName(if:false)
        }
      `).getChildren()[0];
      expect(ifFalse.getStorageKey()).toBe('firstName{if:false}');
    });

    it('strips failing `unless` calls', () => {
      const unlessTrue = getNode(Relay.QL`
        fragment on Node{
          firstName(unless:true)
        }
      `).getChildren()[0];
      expect(unlessTrue.getStorageKey()).toBe('firstName{unless:true}');

      const unlessFalse = getNode(Relay.QL`
        fragment on Node{
          firstName(unless:false)
        }
      `).getChildren()[0];
      expect(unlessFalse.getStorageKey()).toBe('firstName');
    });

    it('substitutes variable values', () => {
      const key = 'profilePicture{size:[0:"32",1:"64"]}';
      const pictureScalarRQL = Relay.QL`
        fragment on User {
          profilePicture(size:["32","64"])
        }
      `;
      const pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
      expect(pictureScalar.getStorageKey()).toBe(key);

      const pictureVariableRQL = Relay.QL`
        fragment on User {
          profilePicture(size:[$width,$height])
        }
      `;
      const variables = {
        height: '64',
        width: '32',
      };
      const pictureVariable =
        getNode(pictureVariableRQL, variables).getChildren()[0];
      expect(pictureVariable.getStorageKey()).toBe(key);
    });

    it('produces stable keys regardless of argument order', () => {
      const pictureFieldA = getNode(Relay.QL`fragment on User {
        profilePicture(size: "32", preset: SMALL)
      }`).getChildren()[0];
      const pictureFieldB = getNode(Relay.QL`fragment on User {
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

    const pictureScalarRQL = Relay.QL`
      fragment on User {
        profilePicture(size:["32","64"])
      }
    `;
    const pictureScalar = getNode(pictureScalarRQL).getChildren()[0];
    expect(pictureScalar.getCallsWithValues()).toEqual([
      {name: 'size', value: ['32', '64']},
    ]);

    const pictureVariableRQL = Relay.QL`
      fragment on User {
        profilePicture(size:[$width,$height])
      }
    `;
    const variables = {
      height: '64',
      width: 32,
    };
    const pictureVariable =
      getNode(pictureVariableRQL, variables).getChildren()[0];
    expect(pictureVariable.getCallsWithValues()).toEqual([
      {name: 'size', value: [32, '64']},
    ]);
  });

  it('returns arguments with array values', () => {
    const variables = {size: [32, 64]};
    const profilePicture = getNode(Relay.QL`
      fragment on User {
        profilePicture(size: $size)
      }
    `, variables).getChildren()[0];
    expect(profilePicture.getCallsWithValues()).toEqual(
      [{name: 'size', value: [32, 64]}]
    );
  });

  it('clones with different call values', () => {
    let clonedFeed = friendsVariableField.cloneFieldWithCalls(
      friendsVariableField.getChildren(),
      [{name: 'first', value: 25}]
    );
    expect(clonedFeed.getSchemaName()).toBe('friends');
    expect(clonedFeed.getCallsWithValues()).toEqual([
      {name: 'first', value: 25},
    ]);
    expect(clonedFeed.getSerializationKey()).toEqual(
      generateRQLFieldAlias('friends.friends_variable.first(25)')
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
    const field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
    expect(field.getInferredPrimaryKey()).toBe('id');

    expect(friendsScalarField.getInferredPrimaryKey()).toBe(undefined);
  });

  it('returns the inferred root call name', () => {
    const field = getNode(Relay.QL`fragment on Story{feedback}`).getChildren()[0];
    expect(field.getInferredRootCallName()).toBe('node');

    expect(friendsScalarField.getInferredRootCallName()).toBe(undefined);
  });

  it('creates nodes', () => {
    const fragmentRQL = Relay.QL`
      fragment on FeedUnit {
        actorCount
      }
    `;
    const node = nodeIdField.createNode(fragmentRQL);
    expect(node instanceof RelayQuery.Fragment).toBe(true);
    expect(node.getType()).toBe('FeedUnit');
    expect(node.getRoute()).toBe(nodeIdField.getRoute());
    expect(node.getVariables()).toBe(nodeIdField.getVariables());
    expect(node.getFieldByStorageKey('actorCount').getType()).toBe('Int');
  });

  it('returns directives', () => {
    const field = getNode(Relay.QL`
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

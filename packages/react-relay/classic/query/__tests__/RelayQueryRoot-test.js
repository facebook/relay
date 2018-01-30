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

const QueryBuilder = require('../QueryBuilder');
const RelayClassic_DEPRECATED = require('RelayClassic_DEPRECATED');
const RelayQuery = require('../RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryRoot', () => {
  const {getNode} = RelayTestUtils;

  let me;
  let usernames;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);

    me = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          name1: firstName
          name1: lastName
        }
      }
    `,
    );

    usernames = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        usernames(names:"mroch") {
          firstName
        }
      }
    `,
    );
    usernames.getConcreteQueryNode().metadata = {
      isPlural: true,
      identifyingArgName: 'names',
    };
  });

  it('has a unique ID', () => {
    const lastID = getNode(
      RelayClassic_DEPRECATED.QL`query{me{firstName}}`,
    ).getID();
    const nextID = getNode(
      RelayClassic_DEPRECATED.QL`query{me{lastName}}`,
    ).getID();
    expect(lastID).toMatch(/^q\d+/);
    expect(nextID).toMatch(/^q\d+/);
    expect(nextID).not.toEqual(lastID);
  });

  it('returns children', () => {
    let children = me.getChildren();
    expect(children.length).toBe(3);
    expect(children[0].getSchemaName()).toBe('firstName');
    expect(children[1].getSchemaName()).toBe('lastName');
    expect(children[2].getSchemaName()).toBe('id');
    expect(children[2].isGenerated()).toBe(true);

    children = usernames.getChildren();
    expect(children.length).toBe(3);
    expect(children[0].getSchemaName()).toBe('firstName');
    expect(children[1].getSchemaName()).toBe('id');
    expect(children[1].isGenerated()).toBe(true);
    expect(children[2].getSchemaName()).toBe('__typename');
    expect(children[2].isGenerated()).toBe(true);
  });

  it('does not return skipped children', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          id
          firstName @skip(if: $true)
          lastName @include(if: $false)
          name @skip(if: $true) @include(if: false)
          emailAddresses @skip(if: $true) @include(if: true)
          username @skip(if: $false) @include(if: false)
        }
      }
    `,
      {true: true, false: false},
    );
    const children = query.getChildren();
    expect(children.length).toBe(1);
    expect(children[0].getSchemaName()).toBe('id');
  });

  it('returns included children', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          id
          firstName @skip(if: $false)
          lastName @include(if: $true)
          name @skip(if: false) @include(if: $true)
        }
      }
    `,
      {false: false, true: true},
    );
    const children = query.getChildren();
    expect(children.length).toBe(4);
    expect(children[0].getSchemaName()).toBe('id');
    expect(children[1].getSchemaName()).toBe('firstName');
    expect(children[2].getSchemaName()).toBe('lastName');
    expect(children[3].getSchemaName()).toBe('name');
  });

  it('returns same object when cloning with same fields', () => {
    let children = me.getChildren();
    expect(me.clone(children)).toBe(me);
    expect(me.clone(children.map(c => c))).toBe(me);
    expect(
      me.clone([null, children[0], null, children[1], null, children[2], null]),
    ).toBe(me);

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
    const children = me.getChildren();
    expect(me.clone([children[0], null])).not.toBe(me);
    expect(me.clone([children[0], null, null])).not.toBe(me);
    expect(me.clone([children[0], null, null, null])).not.toBe(me);
  });

  it('clones with updated children', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          firstName
          lastName
        }
      }
    `,
    );
    const clone = query.clone([query.getChildren()[0]]);
    expect(clone.getChildren().length).toBe(1);
    expect(clone.getChildren()[0].getSchemaName()).toBe('firstName');
    expect(clone.getFieldByStorageKey('lastName')).toBe(undefined);
  });

  it('returns root calls with values', () => {
    expect(me.getIdentifyingArg()).toEqual(undefined);

    expect(usernames.getIdentifyingArg()).toEqual({
      name: 'names',
      type: '[String!]!',
      value: 'mroch',
    });

    expect(
      getNode(
        RelayClassic_DEPRECATED.QL`
      query {
        usernames(names:["a","b","c"]) {
          firstName
        }
      }
    `,
      ).getIdentifyingArg(),
    ).toEqual({
      name: 'names',
      type: '[String!]!',
      value: ['a', 'b', 'c'],
    });
  });

  it('returns ref params', () => {
    // non-ref query:
    expect(me.getBatchCall()).toBe(null);

    // ref query:
    const root = getNode({
      ...RelayClassic_DEPRECATED.QL`
        query {
          node(id: "123") {
            id
          }
        }
      `,
      calls: [
        QueryBuilder.createCall(
          'id',
          QueryBuilder.createBatchCallVariable('q0', '$.*.actor.id'),
        ),
      ],
    });
    const batchCall = root.getBatchCall();
    expect(batchCall).toEqual({
      refParamName: 'ref_q0',
      sourceQueryID: 'q0',
      sourceQueryPath: '$.*.actor.id',
    });
  });

  it('is not equal to non-root nodes', () => {
    const fragment = getNode(
      RelayClassic_DEPRECATED.QL`
      fragment on Viewer {
        actor {
          id
        }
      }
    `,
    );
    const id = fragment.getChildren()[0].getChildren()[0];
    expect(me.equals(fragment)).toBe(false);
    expect(me.equals(id)).toBe(false);
  });

  it('is not equal to queries with different root calls', () => {
    const diffRoot = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        usernames(names:"joesavona") {
          firstName
        }
      }
    `,
    );
    expect(usernames.equals(diffRoot)).toBe(false);
  });

  it('equals the same query', () => {
    expect(usernames.equals(usernames)).toBe(true);
    expect(me.equals(me)).toBe(true);
  });

  it('equals equivalent queries', () => {
    const me2 = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          name1: firstName
          name1: lastName
        }
      }
    `,
    );

    const usernames2 = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        usernames(names:"mroch") {
          firstName
        }
      }
    `,
    );
    usernames2.getConcreteQueryNode().metadata = {
      isPlural: true,
      identifyingArgName: 'names',
    };

    expect(me.equals(me2)).toBe(true);
    expect(usernames.equals(usernames2)).toBe(true);
    expect(me2.equals(me)).toBe(true);
    expect(usernames2.equals(usernames)).toBe(true);
  });

  it('does not equal different queries with the same root', () => {
    const me2 = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me {
          name1: firstName
          lastName
        }
      }
    `,
    );

    const usernames2 = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        usernames(names:"mroch") {
          firstName
          lastName
        }
      }
    `,
    );
    expect(me.equals(me2)).toBe(false);
    expect(usernames.equals(usernames2)).toBe(false);
    expect(me2.equals(me)).toBe(false);
    expect(usernames2.equals(usernames)).toBe(false);
  });

  it('equals identical ref queries with matching ref params', () => {
    const node = getNode({
      ...RelayClassic_DEPRECATED.QL`query { node(id: "123") }`,
      calls: [
        QueryBuilder.createCall(
          'id',
          QueryBuilder.createBatchCallVariable('q0', '$.*.actor.id'),
        ),
      ],
    });
    const other = getNode({
      ...RelayClassic_DEPRECATED.QL`query { node(id: "123") }`,
      calls: [
        QueryBuilder.createCall(
          'id',
          QueryBuilder.createBatchCallVariable('q0', '$.*.actor.id'),
        ),
      ],
    });
    expect(node.equals(other)).toBe(true);
  });

  it('does not equal queries with different ref params', () => {
    const node = getNode({
      ...RelayClassic_DEPRECATED.QL`query { node(id: "123") }`,
      calls: [
        QueryBuilder.createCall(
          'id',
          QueryBuilder.createBatchCallVariable('q0', '$.*.actor.id'),
        ),
      ],
    });
    const other = getNode({
      ...RelayClassic_DEPRECATED.QL`query { node(id: "123") }`,
      calls: [
        QueryBuilder.createCall(
          'id',
          QueryBuilder.createBatchCallVariable(
            'q0',
            '$.*.actor.current_city.id',
          ),
        ),
      ],
    });
    expect(node.equals(other)).toBe(false);
  });

  it('is not a ref query dependency', () => {
    expect(me.isRefQueryDependency()).toBe(false);
  });

  it('is not generated', () => {
    expect(me.isGenerated()).toBe(false);
  });

  it('returns the identifying argument type', () => {
    const nodeQuery = getNode(
      RelayClassic_DEPRECATED.QL`query{node(id:"123"){id}}`,
    );
    nodeQuery.getConcreteQueryNode().metadata = {
      identifyingArgName: 'id',
      identifyingArgType: 'scalar',
    };
    const nodeIdentifyingArg = nodeQuery.getIdentifyingArg();
    expect(nodeIdentifyingArg).toBeDefined();
    expect(nodeIdentifyingArg.type).toBe('scalar');

    me = getNode(RelayClassic_DEPRECATED.QL`query{me{id}}`);
    const meIdentifyingArg = me.getIdentifyingArg();
    expect(meIdentifyingArg).toBeUndefined();
  });

  it('returns numeric identifying arguments', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        task(number: 5) {
          title
        }
      }
    `,
    );
    const nodeIdentifyingArg = query.getIdentifyingArg();
    expect(nodeIdentifyingArg).toEqual({
      name: 'number',
      type: 'Int',
      value: 5,
    });
  });

  it('returns input-object identifying arguments', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        checkinSearchQuery(query: {query: "Facebook"}) {
          query
        }
      }
    `,
    );
    const nodeIdentifyingArg = query.getIdentifyingArg();
    expect(nodeIdentifyingArg).toEqual({
      name: 'query',
      type: 'CheckinSearchInput',
      value: {
        query: 'Facebook',
      },
    });
  });

  it('returns array identifying arguments', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        route(waypoints: [
          {lat: "0.0", lon: "0.0"}
          {lat: "1.1", lon: "1.1"}
        ]) {
          steps {
            note
          }
        }
      }
    `,
    );
    const nodeIdentifyingArg = query.getIdentifyingArg();
    expect(nodeIdentifyingArg).toEqual({
      name: 'waypoints',
      value: [{lat: '0.0', lon: '0.0'}, {lat: '1.1', lon: '1.1'}],
      type: '[WayPoint!]!',
    });
  });

  it('creates nodes', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `,
    );
    const node = RelayClassic_DEPRECATED.QL`
      fragment on Viewer {
        actor {
          id
        }
      }
    `;
    const actorID = query.createNode(node);
    expect(actorID instanceof RelayQuery.Fragment).toBe(true);
    expect(actorID.getType()).toBe('Viewer');
    expect(actorID.getRoute()).toBe(query.getRoute());
    expect(actorID.getVariables()).toBe(query.getVariables());
  });

  it('returns directives', () => {
    const query = getNode(
      RelayClassic_DEPRECATED.QL`
      query {
        me @include(if: $cond) {
          id
        }
      }
    `,
      {cond: true},
    );
    expect(query.getDirectives()).toEqual([
      {
        args: [{name: 'if', value: true}],
        name: 'include',
      },
    ]);
  });

  it('returns isAbstract', () => {
    expect(getNode(RelayClassic_DEPRECATED.QL`query { me }`).isAbstract()).toBe(
      false,
    );
    expect(
      getNode(RelayClassic_DEPRECATED.QL`query { viewer }`).isAbstract(),
    ).toBe(false);
    expect(
      getNode(RelayClassic_DEPRECATED.QL`query { node(id: "4") }`).isAbstract(),
    ).toBe(true);
  });

  it('returns the root type', () => {
    expect(getNode(RelayClassic_DEPRECATED.QL`query { me }`).getType()).toBe(
      'User',
    );
    expect(
      getNode(RelayClassic_DEPRECATED.QL`query { viewer }`).getType(),
    ).toBe('Viewer');
    expect(
      getNode(RelayClassic_DEPRECATED.QL`query { node(id: "123") }`).getType(),
    ).toBe('Node');
  });

  describe('canHaveSubselections()', () => {
    it('returns true', () => {
      // query with children
      expect(me.canHaveSubselections()).toBe(true);

      // empty query
      const query = getNode({
        ...RelayClassic_DEPRECATED.QL`query { viewer }`,
        children: [],
      });
      expect(query.canHaveSubselections()).toBe(true);
    });
  });

  describe('getStorageKey()', () => {
    it('delegates to RelayQueryField::getStorageKey', () => {
      const query = getNode(
        RelayClassic_DEPRECATED.QL`query { settings(environment: MOBILE) }`,
      );
      // Inherit all of the other RelayQueryField::getStorageKey() behavior,
      // like stripping out spurious if/unless and connection args.
      const mockField = {getStorageKey: jest.fn()};
      RelayQuery.Field.build = jest.fn().mockReturnValue(mockField);
      query.getStorageKey();
      expect(RelayQuery.Field.build).toBeCalled();
      expect(mockField.getStorageKey).toBeCalled();
    });

    it('strips identifying arguments', () => {
      const identifyingQuery = getNode(
        RelayClassic_DEPRECATED.QL`query { username(name:"yuzhi") }`,
      );
      identifyingQuery.getConcreteQueryNode().metadata = {
        identifyingArgName: 'name',
      };
      expect(identifyingQuery.getStorageKey()).toBe('username');
    });

    it('identifies itself as plural or not', () => {
      expect(me.isPlural()).toBe(false);
      expect(usernames.isPlural()).toBe(true);
    });

    /*
    Come a time when root fields support more than just identifying arguments,
    write a test to ensure that non-identifying args don't get stripped out.

    it('does not strip out non-identifying arguments', () => {
      const query = getNode(RelayClassic_DEPRECATED.QL`query { settings(environment: MOBILE) }`);
      expect(query.getStorageKey()).toBe('settings.environment(MOBILE)');
    });
    */
  });
});

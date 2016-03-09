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
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');

describe('splitDeferredRelayQueries()', () => {
  // helper functions
  const {defer, getNode, getRefNode} = RelayTestUtils;

  // remove the root `id` field
  function filterGeneratedRootFields(node) {
    const children = node.getChildren().filter(child => !(
      child instanceof RelayQuery.Field &&
      child.isGenerated()
    ));
    return node.clone(children);
  }

  beforeEach(() => {
    // Reset query numbers back to q0.
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the original query when there are no fragments', () => {
    const node = Relay.QL`query{node(id:"4"){id,name}}`;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required).toBe(queryNode);
    expect(deferred).toEqual([]);
  });

  it('returns the original query when there are no deferred fragments', () => {
    const fragment = Relay.QL`fragment on User{hometown{name}}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          ${fragment},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required).toBe(queryNode);
    expect(deferred).toEqual([]);
  });

  it('splits a deferred fragment on the viewer root', () => {
    const fragment = Relay.QL`
      fragment on Viewer {
        newsFeed(first: "10") {
          edges {
            node {
              id,
              actorCount,
            },
          },
        },
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
          ${defer(fragment)},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`query{viewer{actor{id}}}`));
    expect(required.getID()).toBe('q3');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${fragment},
        }
      }
    `));
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('splits a nested feed on the viewer root', () => {
    const nestedFragment = Relay.QL`
      fragment on Viewer {
        newsFeed(first: "10") {
          edges {
            node {
              id,
              actorCount,
            },
          },
        },
      }
    `;
    const fragment = Relay.QL`
      fragment on Viewer {
        actor {
          name,
        },
        ${defer(nestedFragment)},
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
          ${fragment},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
          ${Relay.QL`
      fragment on Viewer {
        actor {
          name,
        }
      }
    `}
        }
      }
    `));

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${nestedFragment},
        }
      }
    `));
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('splits nested deferred fragments', () => {
    const nestedFragment = Relay.QL`fragment on NonNodeStory{message{text}}`;
    const fragment = Relay.QL`
      fragment on Viewer {
        newsFeed(first: "10") {
          edges {
            node {
              tracking,
              ${defer(nestedFragment)},
            },
          },
        },
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          actor {
            name,
          },
          ${defer(fragment)},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `));
    expect(required.getID()).toBe('q5');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${Relay.QL`
      fragment on Viewer {
        newsFeed(first: "10") {
          edges {
            cursor,
            node {
              id,
              tracking
            }
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage
          }
        }
      }
    `}
        }
      }
    `));
    expect(deferred[0].required.getID()).toBe('q4');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // nested deferred part
    expect(deferred[0].deferred.length).toBe(1);
    expect(deferred[0].deferred[0].required.getName()).toBe(
      queryNode.getName()
    );

    // TODO (#7891872): test unflattened queries. The expected output's `edges`
    // field has two `node` children:
    // - the requisite `node{id}`
    // - the nested deferred fragment
    expect(flattenRelayQuery(deferred[0].deferred[0].required)).
      toEqualQueryRoot(flattenRelayQuery(getNode(Relay.QL`
      query {
        viewer {
          newsFeed(first: "10") {
            edges {
              cursor,
              node {
                ${nestedFragment},
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `)));
    expect(deferred[0].deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].deferred[0].required.isDeferred()).toBe(true);

    // no nested nested deferreds
    expect(deferred[0].deferred[0].deferred).toEqual([]);
  });

  it('splits deferred fragments using ref queries', () => {
    const fragment = Relay.QL`fragment on Page{profilePicture{uri}}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          hometown {
            ${defer(fragment)},
          },
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(
      getNode(Relay.QL`query{node(id:"4"){hometown{id},id,name}}`)
    );
    expect(required.getID()).toBe('q1');
    expect(
      required
        .getFieldByStorageKey('hometown')
        .getFieldByStorageKey('id')
        .isRefQueryDependency()
    ).toBe(true);

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.hometown.id'}
      ))
    );
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('splits a nested deferred fragments as a ref queries', () => {
    const nestedFragment = Relay.QL`fragment on Page{profilePicture{uri}}`;
    const fragment = Relay.QL`
      fragment on User {
        hometown {
          name,
          ${defer(nestedFragment)},
        },
      }
    `;
    const node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          ${defer(fragment)},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`query{node(id:"4"){id,name}}`));
    expect(required.getID()).toBe('q3');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          ${Relay.QL`fragment on User{hometown{name}}`},
          id
        }
      }
    `));
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);
    expect(
      deferred[0]
        .required
        .getChildren()[0] // node(4){hometown} (fragment)
        .getChildren()[0] // node(4){hometown} (field)
        .getChildren()[0] // node(4){hometown{id}} (field)
        .isRefQueryDependency()
    ).toBe(true);

    // nested deferred part
    expect(deferred[0].deferred.length).toBe(1);
    expect(deferred[0].deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q2) {
              ${nestedFragment},
            }
          }
        `,
        {path: '$.*.hometown.id'}
      ))
    );
    expect(deferred[0].deferred[0].required.getID()).toBe('q4');
    expect(deferred[0].deferred[0].required.isDeferred()).toBe(true);

    // no nested nested deferreds
    expect(deferred[0].deferred[0].deferred).toEqual([]);
  });

  it('splits a deferred fragment nested inside a ref query', () => {
    // this time, going to defer something inside the ref
    const nestedFragment = Relay.QL`fragment on Page{address{city}}`;
    const fragment = Relay.QL`
      fragment on Page {
        profilePicture {
          uri
        },
        ${defer(nestedFragment)}
      }
    `;
    const node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          hometown {
            ${defer(fragment)},
          },
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(
      getNode(Relay.QL`query{node(id:"4"){hometown{id},id,name}}`)
    );
    expect(
      required
        .getFieldByStorageKey('hometown')
        .getFieldByStorageKey('id')
        .isRefQueryDependency()
    ).toBe(true);
    expect(required.getID()).toBe('q1');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${Relay.QL`fragment on Page{id,profilePicture{uri}}`}
            }
          }
        `,
        {path: '$.*.hometown.id'}
      ))
    );
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // nested deferred part
    expect(deferred[0].deferred.length).toBe(1);
    expect(deferred[0].deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q2) {
              ${nestedFragment},
            }
          }
        `,
        {path: '$.*.hometown.id'}
      ))
    );
    expect(deferred[0].deferred[0].required.getID()).toBe('q3');
    expect(deferred[0].deferred[0].required.isDeferred()).toBe(true);

    // no nested nested deferreds
    expect(deferred[0].deferred[0].deferred).toEqual([]);
  });

  it('drops the required portion if it is empty', () => {
    const fragment = Relay.QL`
      fragment on Viewer {
        newsFeed(first: "10") {
          edges {
            node {
              id,
              actorCount,
            },
          },
        },
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          ${defer(fragment)},
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required).toBe(null);

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${fragment},
        }
      }
    `));
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferred part
    expect(deferred[0].deferred).toEqual([]);
  });

  it('handles a nested defer with no required part', () => {
    const nestedFragment = Relay.QL`fragment on Viewer{primaryEmail}`;
    const fragment = Relay.QL`
      fragment on Viewer {
        ${defer(nestedFragment)},
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          isFbEmployee,
          ${defer(fragment)}
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer{isFbEmployee}
      }
    `));

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toBe(null);

    // nested deferred part
    expect(deferred[0].deferred.length).toBe(1);
    expect(deferred[0].deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${nestedFragment},
        }
      }
    `));
    expect(deferred[0].deferred[0].required.isDeferred()).toBe(true);

    // no nested nested deferreds
    expect(deferred[0].deferred[0].deferred).toEqual([]);
  });

  it('handles a nested ref query defer with no required part', () => {
    const nestedFragment = Relay.QL`fragment on Actor{hometown{name}}`;
    const fragment = Relay.QL`
      fragment on Viewer {
        ${defer(nestedFragment)},
      }
    `;
    const node = Relay.QL`
      query {
        viewer {
          actor {
            name,
            ${defer(fragment)},
          },
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `));
    expect(required.getID()).toBe('q1');
    expect(
      required
        .getFieldByStorageKey('actor')
        .getFieldByStorageKey('id')
        .isRefQueryDependency()
    ).toBe(true);

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toBe(null);

    // nested deferred part
    expect(deferred[0].deferred.length).toBe(1);
    expect(deferred[0].deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${nestedFragment},
            }
          }
        `,
        {path: '$.*.actor.id'}
      ))
    );
    expect(deferred[0].deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].deferred[0].required.isDeferred()).toBe(true);

    // no nested nested deferreds
    expect(deferred[0].deferred[0].deferred).toEqual([]);
  });

  it('handles paths with plural fields', () => {
    const fragment = Relay.QL`fragment on Actor{name}`;
    const node = Relay.QL`
      query {
        node(id:"123") {
          actors {
            id,
            ${defer(fragment)},
          }
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          actors {
            id,
          }
        }
      }
    `));
    expect(required.getID()).toBe('q1');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(filterGeneratedRootFields(
      getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.actors.*.id'}
      )
    ));
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('works with nested node ancestors', () => {
    const fragment = Relay.QL`fragment on Node{name}`;
    const node = Relay.QL`
      query {
        viewer {
          actor {
            hometown {
              ${defer(fragment)},
            },
          },
        }
      }
    `;

    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          actor {
            hometown {
              id,
            },
          },
        }
      }
    `));
    expect(required.getID()).toBe('q1');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.actor.hometown.id'}
      ))
    );
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('uses the auto-generated alias in ref query paths', () => {
    const fragment = Relay.QL`fragment on User{firstName}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
          friends(first:"5") {
            edges {
              node {
                name,
                ${defer(fragment)},
              },
            },
          },
        }
      }
    `;

    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          friends(first:"5") {
            edges {
              node {
                id,
                name,
              },
            },
          },
        }
      }
    `));
    expect(required.getID()).toBe('q1');

    // deferred part
    const alias = generateRQLFieldAlias('friends.first(5)');
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].required).toEqualQueryRoot(filterGeneratedRootFields(
      getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.' + alias + '.edges.*.node.id'}
      )
    ));
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('correctly produces multi-level JSONPaths in ref queries', () => {
    const fragment = Relay.QL`fragment on Actor{name}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
          friends(first: "5") {
            edges {
              node {
                ${defer(fragment)},
              },
            },
          },
        }
      }
    `;

    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          friends(first: "5") {
            edges {
              node {
                id,
              },
            },
          },
        }
      }
    `));
    expect(required.getID()).toBe('q1');

    // deferred part
    const alias = generateRQLFieldAlias('friends.first(5)');
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(
      queryNode.getName()
    );
    expect(deferred[0].required).toEqualQueryRoot(filterGeneratedRootFields(
      getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.' + alias + '.edges.*.node.id'}
      )
    ));
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('handles fragments that are not nodes', () => {
    const fragment = Relay.QL`fragment on Image{uri}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"100") {
            ${defer(fragment)},
          },
        }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`query{node(id:"4"){id}}`));

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          profilePicture(size:"100") {
            ${fragment},
          },
        }
      }
    `));
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('omits required queries with only generated `id` fields', () => {
    const fragment = Relay.QL`fragment on Node{name}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
              ${defer(fragment)},
            }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(required).toBe(null);

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
          node(id:"4") {
            ${fragment},
        }
      }
    `));
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('does not omit "empty" required ref query dependencies', () => {
    // It isn't possible to produce an "empty" ref query dependency with
    // `Relay.QL`, but in order to be future-proof against this possible edge
    // case, we create such a query by hand.
    const fragment = Relay.QL`fragment on Node{name}`;
    const id = RelayQuery.Field.build({
      fieldName: 'id',
      metadata: {isRequisite: true},
      type: 'String',
    });
    const typename = RelayQuery.Field.build({
      fieldName: '__typename',
      metadata: {isRequisite: true},
      type: 'String',
    });
    let queryNode = RelayQuery.Root.build(
      'splitDeferredRelayQueries',
      'node',
      '4',
      [
        id,
        typename,
        RelayQuery.Field.build({
          fieldName: 'hometown',
          children: [id, getNode(defer(fragment))],
          metadata: {
            canHaveSubselections: true,
            isGenerated: true,
            inferredPrimaryKey: 'id',
            inferredRootCallName: 'node',
          },
          type: 'Page',
        }),
      ],
      {
        identifyingArgName: 'id',
      }
    );
    queryNode = queryNode.clone(
      queryNode.getChildren().map((outerChild, ii) => {
        if (ii === 1) {
          return outerChild.clone(
            outerChild.getChildren().map((innerChild, jj) => {
              if (jj === 0) {
                return innerChild.cloneAsRefQueryDependency();
              } else {
                return innerChild;
              }
            })
          );
        } else {
          return outerChild;
        }
      })
    );

    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4"){hometown{id},id}
      }
    `));
    expect(required.getID()).toBe('q1');

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(
      filterGeneratedRootFields(getRefNode(
        Relay.QL`
          query {
            nodes(ids:$ref_q1) {
              ${fragment},
            }
          }
        `,
        {path: '$.*.hometown.id'}
      ))
    );
    expect(deferred[0].required.getID()).toBe('q2');
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('preserves required queries with only a non-generated `id` field', () => {
    const fragment = Relay.QL`fragment on Node{name}`;
    const node = Relay.QL`
      query {
        node(id:"4") {
              id,
              ${defer(fragment)},
            }
      }
    `;
    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    // required part
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`query{node(id:"4"){id}}`));

    // deferred part
    expect(deferred.length).toBe(1);
    expect(deferred[0].required.getName()).toBe(queryNode.getName());
    expect(deferred[0].required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment},
        }
      }
    `));
    expect(deferred[0].required.isDeferred()).toBe(true);

    // no nested deferreds
    expect(deferred[0].deferred).toEqual([]);
  });

  it('does not split empty fragments', () => {
    // null fragment could be caused by an `if`/`unless` call + a GK
    const nullFragment = Relay.QL`fragment on Viewer{${null}}`;
    const fragment = Relay.QL`fragment on Viewer{${nullFragment}}`;
    const node = Relay.QL`
      query {
        viewer {
              primaryEmail,
              ${defer(fragment)},
            }
      }
    `;

    const queryNode = getNode(node);
    const {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer{primaryEmail}
      }
    `));
    expect(deferred.length).toBe(0);
  });

  it('does not flatten fragments when splitting root queries', () => {
    const fragment = Relay.QL`fragment on Node{name}`;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${defer(fragment)},
        }
      }
    `);
    const {deferred} = splitDeferredRelayQueries(query);

    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toContainQueryNode(getNode(fragment));
  });

  it('does not flatten fragments when splitting ref queries', () => {
    const fragment = Relay.QL`fragment on Feedback{likers{count}}`;
    const query = getNode(Relay.QL`
      query {
        node(id:"STORY_ID") {
          feedback {
            ${defer(fragment)},
          },
        }
      }
    `);
    const {deferred} = splitDeferredRelayQueries(query);

    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toContainQueryNode(getNode(fragment));
  });
});

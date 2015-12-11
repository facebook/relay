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
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');

describe('splitDeferredRelayQueries()', () => {
  // helper functions
  var {defer, getNode, getRefNode} = RelayTestUtils;

  // remove the root `id` field
  function filterGeneratedRootFields(node) {
    var children = node.getChildren().filter(node => !(
      node instanceof RelayQuery.Field &&
      node.isGenerated()
    ));
    return node.clone(children);
  }

  beforeEach(() => {
    // Reset query numbers back to q0.
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the original query when there are no fragments', () => {
    var node = Relay.QL`query{node(id:"4"){id,name}}`;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required).toBe(queryNode);
    expect(deferred).toEqual([]);
  });

  it('returns the original query when there are no deferred fragments', () => {
    var fragment = Relay.QL`fragment on User{hometown{name}}`;
    var node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          ${fragment},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required).toBe(queryNode);
    expect(deferred).toEqual([]);
  });

  it('splits a deferred fragment on the viewer root', () => {
    var fragment = Relay.QL`
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
    var node = Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
          ${defer(fragment)},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`
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
    var fragment = Relay.QL`
      fragment on Viewer {
        actor {
          name,
        },
        ${defer(nestedFragment)},
      }
    `;
    var node = Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
          ${fragment},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`fragment on NonNodeStory{message}`;
    var fragment = Relay.QL`
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
    var node = Relay.QL`
      query {
        viewer {
          actor {
            name,
          },
          ${defer(fragment)},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Page{profilePicture{uri}}`;
    var node = Relay.QL`
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
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`fragment on Page{profilePicture{uri}}`;
    var fragment = Relay.QL`
      fragment on User {
        hometown {
          name,
          ${defer(nestedFragment)},
        },
      }
    `;
    var node = Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          ${defer(fragment)},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`fragment on Page{address{city}}`;
    var fragment = Relay.QL`
      fragment on Page {
        profilePicture {
          uri
        },
        ${defer(nestedFragment)}
      }
    `;
    var node = Relay.QL`
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
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`
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
    var node = Relay.QL`
      query {
        viewer {
          ${defer(fragment)},
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`fragment on Viewer{primaryEmail}`;
    var fragment = Relay.QL`
      fragment on Viewer {
        ${defer(nestedFragment)},
      }
    `;
    var node = Relay.QL`
      query {
        viewer {
          isFbEmployee,
          ${defer(fragment)}
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nestedFragment = Relay.QL`fragment on Actor{hometown{name}}`;
    var fragment = Relay.QL`
      fragment on Viewer {
        ${defer(nestedFragment)},
      }
    `;
    var node = Relay.QL`
      query {
        viewer {
          actor {
            name,
            ${defer(fragment)},
          },
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Actor{name}`;
    var node = Relay.QL`
      query {
        node(id:"123") {
          actors {
            id,
            ${defer(fragment)},
          }
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Node{name}`;
    var node = Relay.QL`
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

    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on User{firstName}`;
    var node = Relay.QL`
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

    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var alias = generateRQLFieldAlias('friends.first(5)');
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
    var fragment = Relay.QL`fragment on Actor{name}`;
    var node = Relay.QL`
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

    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var alias = generateRQLFieldAlias('friends.first(5)');
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
    var fragment = Relay.QL`fragment on Image{uri}`;
    var node = Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"100") {
            ${defer(fragment)},
          },
        }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Node{name}`;
    var node = Relay.QL`
      query {
        node(id:"4") {
              ${defer(fragment)},
            }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Node{name}`;
    var id = RelayQuery.Field.build({
      fieldName: 'id',
      metadata: {isRequisite: true},
      type: 'String',
    });
    var typename = RelayQuery.Field.build({
      fieldName: '__typename',
      metadata: {isRequisite: true},
      type: 'String',
    });
    var queryNode = RelayQuery.Root.build(
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

    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var fragment = Relay.QL`fragment on Node{name}`;
    var node = Relay.QL`
      query {
        node(id:"4") {
              id,
              ${defer(fragment)},
            }
      }
    `;
    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

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
    var nullFragment = Relay.QL`fragment on Viewer{${null}}`;
    var fragment = Relay.QL`fragment on Viewer{${nullFragment}}`;
    var node = Relay.QL`
      query {
        viewer {
              primaryEmail,
              ${defer(fragment)},
            }
      }
    `;

    var queryNode = getNode(node);
    var {required, deferred} = splitDeferredRelayQueries(queryNode);

    expect(required.getName()).toBe(queryNode.getName());
    expect(required).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer{primaryEmail}
      }
    `));
    expect(deferred.length).toBe(0);
  });

  it('does not flatten fragments when splitting root queries', () => {
    var fragment = Relay.QL`fragment on Node{name}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${defer(fragment)},
        }
      }
    `);
    var {deferred} = splitDeferredRelayQueries(query);

    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toContainQueryNode(getNode(fragment));
  });

  it('does not flatten fragments when splitting ref queries', () => {
    var fragment = Relay.QL`fragment on Feedback{likers{count}}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"STORY_ID") {
          feedback {
            ${defer(fragment)},
          },
        }
      }
    `);
    var {deferred} = splitDeferredRelayQueries(query);

    expect(deferred.length).toBe(1);
    expect(deferred[0].required).toContainQueryNode(getNode(fragment));
  });
});

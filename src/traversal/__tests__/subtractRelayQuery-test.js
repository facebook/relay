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
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const subtractRelayQuery = require('subtractRelayQuery');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');

describe('subtractRelayQuery', () => {
  const {defer, getNode} = RelayTestUtils;

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  function subtractQuery(min, sub) {
    return subtractRelayQuery(min, flattenRelayQuery(sub));
  }

  it('persists query names', () => {
    const minQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          hometown {
            id
            name
          }
          name
        }
      }
    `);
    const subQuery = getNode(Relay.QL`
      query {
        node(id:"4"){name}
      }
    `);
    const diffQuery = subtractQuery(minQuery, subQuery);
    expect(diffQuery).not.toBe(minQuery);
    expect(diffQuery.getName()).toBe(minQuery.getName());
  });

  describe('fields', () => {
    it('subtracts top-level fields', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              name
            }
            name
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      const expected = getNode(Relay.QL`query{node(id:"4"){id,hometown{id,name}}}`);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('returns null when the resulting query would be empty', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
            }
            name
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      // this would subtract to node(4){id,hometown{id}}, which is "empty"
      // because it contains no non-requisite, non-id scalar fields
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(null);
    });

    it('returns null when the minuend query is empty', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      // this would subtract to node(4){id,hometown{id}}, which is "empty"
      // because it contains no non-requisite, non-id scalar fields
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(null);
    });

    it('does not consider requisite fields with aliases to be empty', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"10") {
              edges {
                live_cursor: cursor
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              count
            }
          }
        }
      `);
      const expected = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"10") {
              edges {
                live_cursor: cursor
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('does not consider id fields with aliases to be empty', () => {
      // the `id` here is a non-requisite id field
      const minQuery = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  special_id: id
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  actor {
                    name
                  }
                }
              }
            }
          }
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(minQuery).toBe(diffQuery);
    });

    it('does not consider ref query dependencies to be empty', () => {
      const fragment = Relay.QL`fragment on Feedback{canViewerLike}`;
      const query = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            feedback {
              doesViewerLike
              ${defer(fragment)}
            }
          }
        }
      `);
      const otherQuery = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            feedback {
              doesViewerLike
            }
          }
        }
      `);
      const splitQueries = splitDeferredRelayQueries(query);
      const required = splitQueries.required;
      const expected = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            id
            feedback {
              id
            }
          }
        }
      `);

      expect(subtractQuery(required, otherQuery)).toEqualQueryRoot(expected);
    });

    it('subtracts nested fields', () => {
      let minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            name
            birthdate {
              day
            }
          }
        }
      `);
      let subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){birthdate{day}}
        }
      `);
      let expected = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);

      minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              name
              url
            }
          }
        }
      `);
      subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{name}}
        }
      `);
      expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              url
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('subtracts deeply nested fields', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              address {
                country
                city
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{address{country}}}
        }
      `);
      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              address {
                city
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('returns null for no difference', () => {
      const minQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      const subQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      expect(subtractQuery(minQuery, subQuery)).toBeNull();
    });

    it('does not subtract when the root call arguments are different', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            name
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"660361306") {
            id
            name
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('ignores fields only in subtrahend query', () => {
      const minQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      const subQuery = getNode(Relay.QL`query{node(id:"4"){firstName}}`);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('preserves fields from fragments within a range', () => {
      const fragment = Relay.QL`
        fragment on User {
          name
        }
      `;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "10") {
              edges {
                node {
                  id
                  ${fragment}
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "10") {
              edges {
                node {
                  id
                  firstName
                }
              }
            }
          }
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(minQuery).toBe(diffQuery);
    });

    it('preserves fields from deferred fragments within a range', () => {
      const fragment = Relay.QL`
        fragment on User {
          name
        }
      `;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "5") {
              edges {
                node {
                  id
                  firstName
                  ${defer(fragment)}
                }
              }
            }
          }
        }
      `);
      const queries = splitDeferredRelayQueries(minQuery);

      const {required, deferred} = queries;
      expect(deferred.length).toBe(1); // sanity check
      expect(subtractQuery(deferred[0].required, required))
        .toBe(deferred[0].required);
    });
  });

  describe('id', () => {
    it('preserves `id` field if difference is non-empty', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              name
              url
            }
            name
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{id,url}}
        }
      `);
      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              name
            }
            name
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('removes `id` fields if no non-requisite fields', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            hometown {
              name
            }
            friends(first:"5") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"5") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      const expected = getNode(Relay.QL`
        query {
          node(id:"123") {
            hometown {
              name
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('preserves exported `id` fields', () => {
      let minQuery = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      minQuery = minQuery.clone([
        minQuery.getChildren()[0].clone([
          minQuery.getChildren()[0].getChildren()[0]
            .cloneAsRefQueryDependency(),
        ]),
      ]);
      const subQuery = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(minQuery);
    });
  });

  describe('fragments', () => {
    it('returns null for no difference with fragments', () => {
      const minFragment = Relay.QL`fragment on Node{name}`;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4"){id,${minFragment}}
        }
      `);
      const subFragment = Relay.QL`fragment on Node{name}`;
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){id,${subFragment}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('subtracts fields from minuend fragments', () => {
      const minFragment = Relay.QL`fragment on Node{hometown{name},name}`;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${minFragment}
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{name}}
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);

      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${Relay.QL`fragment on Node{name}`}
          }
        }
      `);

      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('subtracts entire minuend fragments when empty', () => {
      const minFragment = Relay.QL`fragment on Actor{birthdate{day},hometown{id}}`;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            name
            ${minFragment}
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){birthdate{day},hometown{id}}
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);

      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${Relay.QL`fragment on Actor{id}`},
            id,
            name
          }
        }
      `);
      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('subtracts fields in subtrahend fragments', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              name
              url
            }
            name
          }
        }
      `);
      const subFragment = Relay.QL`fragment on Page{name}`;
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            hometown {
              id
              ${subFragment}
            }
          }
        }
      `);

      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            hometown {
              id
              url
            }
            name
          }
        }
      `);

      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('subtracts subtrahend fragments from minuend fragments', () => {
      const minFragment = Relay.QL`fragment on Node{hometown{id,name,url},name}`;
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            ${minFragment}
          }
        }
      `);
      const subFragmentNode = Relay.QL`fragment on Node{name}`;
      const subFragmentPage = Relay.QL`fragment on Page{name}`;
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            hometown {
              id
              ${subFragmentPage}
            }
            ${subFragmentNode}
          }
        }
      `);

      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${Relay.QL`
        fragment on Node {
          hometown {
            url
          }
        }
      `},
            id,
          }
        }
      `);

      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });
  });

  describe('calls', () => {
    it('subtracts fields with matching calls', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            url(site:"www")
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){url(site:"www")}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves fields with non-matching calls', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            url(site:"www")
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){url(site:"mobile")}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('subtracts nested fields with matching calls', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            profilePicture(size:"32") {
              uri
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){profilePicture(size:"32"){uri}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves nested fields with non-matching calls', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            profilePicture(size:"32") {
              uri
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){profilePicture(size:"64"){uri}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });
  });

  describe('ranges', () => {
    it('subtracts fields from range supersets', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"3") {
              edges {
                node {
                  name
                  firstName
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"5") {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `);
      const expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"3") {
              edges {
                node {
                  firstName
                }
              }
            }
          }
        }
      `);
      const diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('removes empty ranges', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id
            friends(first:"5") {
              edges {
                cursor
                node {
                  id
                  name
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"5") {
              edges {
                cursor
                node {
                  id
                  name
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves all fields from range subsets', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"5") {
              edges {
                node {
                  name
                  firstName
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"3") {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('preserves ranges with non-matching calls', () => {
      const minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(orderby:"importance",first:"3") {
              edges {
                node {
                  name
                  firstName
                }
              }
            }
          }
        }
      `);
      const subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"3") {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });
  });
});

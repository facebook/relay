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
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const subtractRelayQuery = require('subtractRelayQuery');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');

describe('subtractRelayQuery', () => {
  var {defer, getNode} = RelayTestUtils;

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  function subtractQuery(min, sub) {
    return subtractRelayQuery(min, flattenRelayQuery(sub));
  }

  it('persists query names', () => {
    var minQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          hometown {
            id,
            name,
          },
          name
        }
      }
    `);
    var subQuery = getNode(Relay.QL`
      query {
        node(id:"4"){name}
      }
    `);
    var diffQuery = subtractQuery(minQuery, subQuery);
    expect(diffQuery).not.toBe(minQuery);
    expect(diffQuery.getName()).toBe(minQuery.getName());
  });

  describe('fields', () => {
    it('subtracts top-level fields', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              name,
            },
            name
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      var expected = getNode(Relay.QL`query{node(id:"4"){id,hometown{id,name}}}`);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('returns null when the resulting query would be empty', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
            },
            name
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      // this would subtract to node(4){id,hometown{id}}, which is "empty"
      // because it contains no non-requisite, non-id scalar fields
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(null);
    });

    it('returns null when the minuend query is empty', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){name}
        }
      `);
      // this would subtract to node(4){id,hometown{id}}, which is "empty"
      // because it contains no non-requisite, non-id scalar fields
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(null);
    });

    it('does not consider requisite fields with aliases to be empty', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"10") {
              edges {
                live_cursor: cursor,
              },
            },
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              count,
            },
          }
        }
      `);
      var expected = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"10") {
              edges {
                live_cursor: cursor,
              },
            },
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('does not consider id fields with aliases to be empty', () => {
      // the `id` here is a non-requisite id field
      var minQuery = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  special_id: id,
                },
              },
            },
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  actor {
                    name,
                  },
                },
              },
            },
          }
        }
      `);
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(minQuery).toBe(diffQuery);
    });

    it('does not consider ref query dependencies to be empty', () => {
      var fragment = Relay.QL`fragment on Feedback{canViewerLike}`;
      var query = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            feedback {
              doesViewerLike,
              ${defer(fragment)},
            }
          }
        }
      `);
      var otherQuery = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            feedback {
              doesViewerLike
            }
          }
        }
      `);
      var splitQueries = splitDeferredRelayQueries(query);
      var required = splitQueries.required;
      var expected = getNode(Relay.QL`
        query {
          node(id:"UzpfSTU0MTUzNTg0MzoxMDE1Mjk3MDY0NjAzNTg0NA==") {
            id,
            feedback {
              id,
            },
          }
        }
      `);

      expect(subtractQuery(required, otherQuery)).toEqualQueryRoot(expected);
    });

    it('subtracts nested fields', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            name,
            birthdate {
              day
            },
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){birthdate{day}}
        }
      `);
      var expected = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);

      minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              name,
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
            id,
            hometown {
              id,
              url
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('subtracts deeply nested fields', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              address {
                country,
                city
              }
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{address{country}}}
        }
      `);
      var expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
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
      var minQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      var subQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      expect(subtractQuery(minQuery, subQuery)).toBeNull();
    });

    it('does not subtract when the root call arguments are different', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            name,
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"660361306") {
            id,
            name,
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('ignores fields only in subtrahend query', () => {
      var minQuery = getNode(Relay.QL`query{node(id:"4"){id,name}}`);
      var subQuery = getNode(Relay.QL`query{node(id:"4"){firstName}}`);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('preserves fields from fragments within a range', () => {
      var fragment = Relay.QL`
        fragment on User {
          name,
        }
      `;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "10") {
              edges {
                node {
                  id,
                  ${fragment},
                },
              },
            },
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "10") {
              edges {
                node {
                  id,
                  firstName
                },
              },
            },
          }
        }
      `);
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(minQuery).toBe(diffQuery);
    });

    it('preserves fields from deferred fragments within a range', () => {
      var fragment = Relay.QL`
        fragment on User {
          name,
        }
      `;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first: "5") {
              edges {
                node {
                  id,
                  firstName,
                  ${defer(fragment)},
                },
              },
            },
          }
        }
      `);
      var queries = splitDeferredRelayQueries(minQuery);

      var {required, deferred} = queries;
      expect(deferred.length).toBe(1); // sanity check
      expect(subtractQuery(deferred[0].required, required))
        .toBe(deferred[0].required);
    });
  });

  describe('id', () => {
    it('preserves `id` field if difference is non-empty', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              name,
              url
            },
            name
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{id,url}}
        }
      `);
      var expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              name
            },
            name
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toEqualQueryRoot(expected);
    });

    it('removes `id` fields if no non-requisite fields', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            hometown {
              name
            },
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
      var subQuery = getNode(Relay.QL`
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
      var expected = getNode(Relay.QL`
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
      var minQuery = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            },
          }
        }
      `);
      minQuery = minQuery.clone([
        minQuery.getChildren()[0].clone([
          minQuery.getChildren()[0].getChildren()[0]
            .cloneAsRefQueryDependency(),
        ]),
      ]);
      var subQuery = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toBe(minQuery);
    });
  });

  describe('fragments', () => {
    it('returns null for no difference with fragments', () => {
      var minFragment = Relay.QL`fragment on Node{name}`;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4"){id,${minFragment}}
        }
      `);
      var subFragment = Relay.QL`fragment on Node{name}`;
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){id,${subFragment}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('subtracts fields from minuend fragments', () => {
      var minFragment = Relay.QL`fragment on Node{hometown{name},name}`;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${minFragment}
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){hometown{name}}
        }
      `);
      var diffQuery = subtractQuery(minQuery, subQuery);

      var expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            ${Relay.QL`fragment on Node{name}`}
          }
        }
      `);

      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('subtracts entire minuend fragments when empty', () => {
      var minFragment = Relay.QL`fragment on Actor{birthdate{day},hometown{id}}`;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            name,
            ${minFragment}
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){birthdate{day},hometown{id}}
        }
      `);
      var diffQuery = subtractQuery(minQuery, subQuery);

      var expected = getNode(Relay.QL`
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
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              name,
              url
            },
            name
          }
        }
      `);
      var subFragment = Relay.QL`fragment on Page{name}`;
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            hometown {
              id,
              ${subFragment}
            }
          }
        }
      `);

      var expected = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            hometown {
              id,
              url
            },
            name
          }
        }
      `);

      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('subtracts subtrahend fragments from minuend fragments', () => {
      var minFragment = Relay.QL`fragment on Node{hometown{id,name,url},name}`;
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            ${minFragment}
          }
        }
      `);
      var subFragmentNode = Relay.QL`fragment on Node{name}`;
      var subFragmentPage = Relay.QL`fragment on Page{name}`;
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            hometown {
              id,
              ${subFragmentPage}
            },
            ${subFragmentNode}
          }
        }
      `);

      var expected = getNode(Relay.QL`
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

      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });
  });

  describe('calls', () => {
    it('subtracts fields with matching calls', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            url(site:"www")
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){url(site:"www")}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves fields with non-matching calls', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            url(site:"www")
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){url(site:"mobile")}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });

    it('subtracts nested fields with matching calls', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            profilePicture(size:"32") {
              uri
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){profilePicture(size:"32"){uri}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves nested fields with non-matching calls', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            profilePicture(size:"32") {
              uri
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4"){profilePicture(size:"64"){uri}}
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(minQuery);
    });
  });

  describe('ranges', () => {
    it('subtracts fields from range supersets', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"3") {
              edges {
                node {
                  name,
                  firstName
                }
              }
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
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
      var expected = getNode(Relay.QL`
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
      var diffQuery = subtractQuery(minQuery, subQuery);
      expect(diffQuery).toEqualQueryRoot(expected);
    });

    it('removes empty ranges', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            id,
            friends(first:"5") {
              edges {
                cursor,
                node {
                  id,
                  name
                }
              },
              pageInfo {
                hasNextPage,
                hasPreviousPage
              }
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"5") {
              edges {
                cursor,
                node {
                  id,
                  name
                }
              },
              pageInfo {
                hasNextPage,
                hasPreviousPage
              }
            }
          }
        }
      `);
      expect(subtractQuery(minQuery, subQuery)).toBe(null);
    });

    it('preserves all fields from range subsets', () => {
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(first:"5") {
              edges {
                node {
                  name,
                  firstName
                }
              }
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
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
      var minQuery = getNode(Relay.QL`
        query {
          node(id:"4") {
            friends(orderby:"importance",first:"3") {
              edges {
                node {
                  name,
                  firstName
                }
              }
            }
          }
        }
      `);
      var subQuery = getNode(Relay.QL`
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

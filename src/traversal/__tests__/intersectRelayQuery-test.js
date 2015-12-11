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

const intersectRelayQuery = require('intersectRelayQuery');

describe('intersectRelayQuery', () => {
  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('fields', () => {
    it('returns null for mutually exclusive nodes', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Date {
          day,
          month,
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Date {
          year,
        }
      `);
      expect(intersectRelayQuery(subjectNode, patternNode)).toBe(null);
    });

    it('intersects shallow fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          name,
          firstName,
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          lastName,
          name,
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          name,
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('intersects nested fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          birthdate {
            day,
            month,
            year,
          },
          hometown {
            name,
            url,
          },
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          hometown {
            name,
          },
          screennames {
            service,
          },
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          hometown {
            name
          },
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('includes fields with different arguments', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          id,
          url(site:"www")
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          id,
          url
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          id,
          url(site:"www")
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('intersects aliased fields by storage key', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          name,
          firstName,
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          name,
          name: firstName,
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          name,
          firstName,
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('includes all fields of fields without sub-fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          hometown {
            name,
            url,
          },
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          hometown,
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          hometown {
            name,
            url,
          },
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });
  });

  describe('ranges', () => {
    it('includes range fields for connections without sub-fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          friends
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('includes non-range connection fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count,
            edges {
              node {
                id,
                friends,
                name,
              }
            }
          }
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor @relay(pattern: true) {
          friends {
            count
          }
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count
          }
        }
      `);
      expect(
        intersectRelayQuery(subjectNode, patternNode)
      ).toEqualQueryNode(expected);
    });

    it('excludes filtered unterminated ranges', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count,
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          friends
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count
          }
        }
      `);
      var filterUnterminatedRange = function(node) {
        return node.getSchemaName() === 'friends';
      };
      expect(
        intersectRelayQuery(subjectNode, patternNode, filterUnterminatedRange)
      ).toEqualQueryNode(expected);
    });

    it('excludes filtered unterminated ranges with different arguments', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          friends(orderby:"name",first: "10") {
            count,
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor {
          friends
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          friends(orderby:"name",first: "10") {
            count
          }
        }
      `);
      var filterUnterminatedRange = function(node) {
        return node.getSchemaName() === 'friends';
      };
      expect(
        intersectRelayQuery(subjectNode, patternNode, filterUnterminatedRange)
      ).toEqualQueryNode(expected);
    });

    it('does not exclude ranges from connections with sub-fields', () => {
      var subjectNode = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count,
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var patternNode = getNode(Relay.QL`
        fragment on Actor @relay(pattern: true) {
          friends {
            count,
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var expected = getNode(Relay.QL`
        fragment on Actor {
          friends(first: "10") {
            count,
            edges {
              node {
                id,
                name,
              }
            }
          }
        }
      `);
      var filterUnterminatedRange = jest.genMockFunction();
      expect(
        intersectRelayQuery(subjectNode, patternNode, filterUnterminatedRange)
      ).toEqualQueryNode(expected);
      expect(filterUnterminatedRange).not.toBeCalled();
    });
  });
});

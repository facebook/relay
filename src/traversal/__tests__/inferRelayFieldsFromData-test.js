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
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');
const inferRelayFieldsFromData = require('inferRelayFieldsFromData');

describe('inferRelayFieldsFromData', () => {
  const {getVerbatimNode, matchers} = RelayTestUtils;
  let HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO,
    } = RelayConnectionInterface);

    jasmine.addMatchers({
      ...RelayTestUtils.matchers,
      toEqualFields() {
        return {
          compare(actual, expected) {
            expected = flattenRelayQuery(getVerbatimNode(expected));
            actual = flattenRelayQuery(expected.clone(actual));
            // NOTE: Generated fields might get in the way.
            return matchers.toEqualQueryNode().compare(actual, expected);
          },
        };
      },
    });
  });

  it('generates metadata for fields', () => {
    const query = inferRelayFieldsFromData({
      id: '123',
    });
    expect(query).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
      }
    `);
    expect(query[0].isPlural()).toBe(false);
  });

  it('infers scalar fields from scalars', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      name: 'Alice',
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        name,
      }
    `);
  });

  it('infers nested fields from objects', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      address: {
        city: 'Menlo Park',
      },
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        address {
          city,
        },
      }
    `);
  });

  it('infers unterminated fields from null', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      address: null,
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        address,
      }
    `);
  });

  it('infers plural fields from arrays of scalars', () => {
    const fields = inferRelayFieldsFromData({
      id: '123',
      websites: [
        'facebook.com',
        'google.com',
      ],
    });
    expect(fields).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        websites,
      }
    `);
    expect(fields[1].isPlural()).toBe(true);
  });

  it('infers plural nested fields from arrays of objects', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      screennames: [
        {service: 'GTALK'},
        {service: 'TWITTER'},
      ],
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        screennames {
          service,
        },
      }
    `);
  });

  it('infers unterminated fields from empty arrays', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      websites: [],
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        websites,
      }
    `);
  });

  it('infers unterminated fields from null elements in arrays', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      websites: [null],
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        websites,
      }
    `);
  });

  it('infers String field arguments from keys', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      'url(site: "www")': 'https://...',
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        url(site: "www"),
      }
    `);
  });

  it('infers Boolean field arguments from keys', () => {
    expect(inferRelayFieldsFromData({
      'url(relative: true)': '//...',
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        url(relative: true),
      }
    `);
  });

  it('infers Int field arguments from keys', () => {
    expect(inferRelayFieldsFromData({
      'comments(last: 10)': {
        count: 20,
      },
    })).toEqualFields(Relay.QL`
      fragment on Comment {
        comments(last: 10) {
          count,
        }
      }
    `);
  });

  it('throws for keys with invalid call encodings', () => {
    expect(() => {
      inferRelayFieldsFromData({
        'url.site': 'https://...',
      });
    }).toFailInvariant(
      'inferRelayFieldsFromData(): Malformed data key, `url.site`.'
    );

    expect(() => {
      inferRelayFieldsFromData({
        'url(site)': 'https://...',
      });
    }).toFailInvariant(
      'inferRelayFieldsFromData(): Malformed or unsupported data key, ' +
      '`url(site)`. Only booleans, strings, and numbers are currenly ' +
      'supported, and commas are required. Parse failure reason was ' +
      '`Unexpected token s`.'
    );
  });

  it('infers `id` and `cursor` fields for `node` data', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      'friends(first: "2")': {
        edges: [
          {node: {name: 'Alice'}},
          {node: {name: 'Bob'}},
        ],
        [PAGE_INFO]: {
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
      },
    })).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
        friends(first: "2") {
          edges {
            node {
              id,
              name,
            },
            cursor,
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage,
          },
        },
      }
    `);
  });

  it('infers field for mutation field named `node`', () => {
    expect(inferRelayFieldsFromData({
      node: {
        id: '123',
        name: 'name',
      },
    })).toEqualFields(Relay.QL`
      fragment on NodeSavedStateResponsePayload {
        node {
          id,
          name
        }
      }
    `);
  });

  it('ignores metadata fields', () => {
    expect(inferRelayFieldsFromData({
      __dataID__: '123',
      __range__: null,
      __status__: 0,
      id: '123',
      name: 'Alice',
    })).toEqualFields(Relay.QL`
      fragment on Node {
        id,
        name,
      }
    `);
  });
});

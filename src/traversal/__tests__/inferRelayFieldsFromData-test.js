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
var flattenRelayQuery = require('flattenRelayQuery');
var inferRelayFieldsFromData = require('inferRelayFieldsFromData');

describe('inferRelayFieldsFromData', function() {
  var {getVerbatimNode, matchers} = RelayTestUtils;
  var HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  beforeEach(function() {
    jest.resetModuleRegistry();

    ({
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO
    } = RelayConnectionInterface);

    jest.addMatchers({
      ...RelayTestUtils.matchers,
      toEqualFields(expected) {
        expected = flattenRelayQuery(getVerbatimNode(expected));
        this.actual = flattenRelayQuery(expected.clone(this.actual));
        // NOTE: Generated fields might get in the way.
        return matchers.toEqualQueryNode.call(this, expected);
      }
    });
  });

  it('generates metadata for `id` fields', () => {
    var query = inferRelayFieldsFromData({
      id: '123',
    });
    expect(query).toEqualFields(Relay.QL`
      fragment on Actor {
        id,
      }
    `);
    expect(query[0].getParentType()).toBe('Node');
  });

  it('infers scalar fields from scalars', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      name: 'Alice',
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            name,
          }`);
  });

  it('infers nested fields from objects', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      address: {
        city: 'Menlo Park',
      },
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            address {
              city,
            },
          }`);
  });

  it('infers unterminated fields from null', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      address: null,
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            address,
          }`);
  });

  it('infers plural fields from arrays of scalars', () => {
    var fields = inferRelayFieldsFromData({
      id: '123',
      websites: [
        'facebook.com',
        'google.com',
      ],
    });
    expect(fields).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            websites,
          }`);
    expect(fields[1].isPlural()).toBe(true);
  });

  it('infers plural nested fields from arrays of objects', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      screennames: [
        {service: 'GTALK'},
        {service: 'TWITTER'},
      ],
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            screennames {
              service,
            },
          }`);
  });

  it('infers unterminated fields from empty arrays', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      websites: [],
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            websites,
          }`);
  });

  it('infers unterminated fields from null elements in arrays', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      websites: [null],
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            websites,
          }`);
  });

  it('infers field arguments from keys', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      'url.site(www)': 'https://...',
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            url(site:"www"),
          }`);
  });

  it('throws for keys with invalid call encodings', () => {
    expect(() => {
      inferRelayFieldsFromData({
        'url.site': 'https://...',
      });
    }).toFailInvariant(
      'inferRelayFieldsFromData(): Malformed data key, `url.site`.'
    );
  });

  it('infers `id` and `cursor` fields for `node` data', () => {
    expect(inferRelayFieldsFromData({
      id: '123',
      'friends.first(2)': {
        edges: [
          {node: {name: 'Alice'}},
          {node: {name: 'Bob'}},
        ],
        [PAGE_INFO]: {
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
      },
    })).toEqualFields(Relay.QL`  fragment on Actor {
            id,
            friends(first:"2") {
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
          }`);
  });

  it('infers field for mutation field named `node`', () => {
    expect(inferRelayFieldsFromData({
      node: {
        id: '123',
        name: 'name',
      }
    })).toEqualFields(Relay.QL`  fragment on NodeSavedStateResponsePayload {
            node {
              id,
              name
            }
          }`);
  });

  it('ignores metadata fields', () => {
    expect(inferRelayFieldsFromData({
      __dataID__: '123',
      __range__: null,
      __status__: 0,
      id: '123',
      name: 'Alice',
    })).toEqualFields(Relay.QL`  fragment on Node {
            id,
            name,
          }`);
  });
});

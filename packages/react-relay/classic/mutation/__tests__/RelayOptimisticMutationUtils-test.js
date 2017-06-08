/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayOptimisticMutationUtils = require('RelayOptimisticMutationUtils');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const flattenRelayQuery = require('flattenRelayQuery');

describe('RelayOptimisticMutationUtils', () => {
  const {getVerbatimNode, matchers} = RelayTestUtils;
  let HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  beforeEach(() => {
    jest.resetModules();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayConnectionInterface);

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

  describe('inferRelayFieldsFromData', () => {
    it('generates metadata for fields', () => {
      const query = RelayOptimisticMutationUtils.inferRelayFieldsFromData({
        id: '123',
      });
      expect(query).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
        }
      `,
      );
      expect(query[0].isPlural()).toBe(false);
    });

    it('infers scalar fields from scalars', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          id: '123',
          name: 'Alice',
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          name
        }
      `,
      );
    });

    it('infers nested fields from objects', () => {
      const fields = RelayOptimisticMutationUtils.inferRelayFieldsFromData({
        id: '123',
        address: {
          city: 'Menlo Park',
        },
      });
      expect(fields).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          address {
            city
          }
        }
      `,
      );
      expect(fields[1].canHaveSubselections()).toBe(true);
    });

    it('infers unterminated fields from null', () => {
      const inferredFields = RelayOptimisticMutationUtils.inferRelayFieldsFromData(
        {
          id: '123',
          address: null,
        },
      );

      expect(inferredFields[0] instanceof RelayQuery.Field).toBe(true);
      expect(inferredFields[0].canHaveSubselections()).toBe(false);
      expect(inferredFields[0].getSchemaName()).toBe('id');

      expect(inferredFields[1] instanceof RelayQuery.Field).toBe(true);
      // Though this field can have subselections, there is no way we can infer
      // this from `address: null`. Defaults to false.
      expect(inferredFields[1].canHaveSubselections()).toBe(false);
      expect(inferredFields[1].getSchemaName()).toBe('address');
    });

    it('infers plural fields from arrays of scalars', () => {
      const fields = RelayOptimisticMutationUtils.inferRelayFieldsFromData({
        id: '123',
        websites: ['facebook.com', 'google.com'],
      });
      expect(fields).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          websites
        }
      `,
      );
      expect(fields[1].isPlural()).toBe(true);
    });

    it('infers plural nested fields from arrays of objects', () => {
      const fields = RelayOptimisticMutationUtils.inferRelayFieldsFromData({
        id: '123',
        screennames: [{service: 'GTALK'}, {service: 'TWITTER'}],
      });
      expect(fields).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          screennames {
            service
          }
        }
      `,
      );
      expect(fields[1].isPlural()).toBe(true);
    });

    it('infers unterminated fields from empty arrays', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          id: '123',
          websites: [],
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          websites
        }
      `,
      );
    });

    it('infers unterminated fields from null elements in arrays', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          id: '123',
          websites: [null],
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          websites
        }
      `,
      );
    });

    it('infers String field arguments from keys', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          id: '123',
          'url(site: "www")': 'https://...',
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          url(site: "www")
        }
      `,
      );
    });

    it('infers Boolean field arguments from keys', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          'url(relative: true)': '//...',
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          url(relative: true)
        }
      `,
      );
    });

    it('infers Int field arguments from keys', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          'comments(last: 10)': {
            count: 20,
          },
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Comment {
          comments(last: 10) {
            count
          }
        }
      `,
      );
    });

    it('throws for keys with invalid call encodings', () => {
      expect(() => {
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          'url.site': 'https://...',
        });
      }).toFailInvariant(
        'RelayOptimisticMutationUtils: Malformed data key, `url.site`.',
      );

      expect(() => {
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          'url(site)': 'https://...',
        });
      }).toFailInvariant(
        'RelayOptimisticMutationUtils: Malformed or unsupported data key, ' +
          '`url(site)`. Only booleans, strings, and numbers are currently ' +
          'supported, and commas are required. Parse failure reason was ' +
          '`' +
          RelayTestUtils.getJSONTokenError('s', 1) +
          '`.',
      );
    });

    it('infers `id` and `cursor` fields for `node` data', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          id: '123',
          'friends(first: 2)': {
            edges: [{node: {name: 'Alice'}}, {node: {name: 'Bob'}}],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Actor {
          id
          friends(first: 2) {
            edges {
              node {
                id
                name
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
      );
    });

    it('infers field for mutation field named `node`', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          node: {
            id: '123',
            name: 'name',
          },
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on NodeSavedStateResponsePayload {
          node {
            id
            name
          }
        }
      `,
      );
    });

    it('ignores metadata fields', () => {
      expect(
        RelayOptimisticMutationUtils.inferRelayFieldsFromData({
          __dataID__: '123',
          __range__: null,
          __status__: 0,
          id: '123',
          name: 'Alice',
        }),
      ).toEqualFields(
        Relay.QL`
        fragment on Node {
          id
          name
        }
      `,
      );
    });
  });

  describe('inferRelayPayloadFromData', () => {
    it('generates payload for scalar fields', () => {
      const data = {
        id: '123',
      };
      const payload = RelayOptimisticMutationUtils.inferRelayPayloadFromData(
        data,
      );
      expect(payload).toBe(data);
    });

    it('generates payload for plural fields', () => {
      const data = {
        usernames: [{id: '123'}, {id: '456'}],
      };
      const payload = RelayOptimisticMutationUtils.inferRelayPayloadFromData(
        data,
      );
      expect(payload).toBe(data);
    });

    it('generates payload for nested fields', () => {
      const data = {
        viewer: {
          actor: {
            id: '123',
          },
        },
      };
      const payload = RelayOptimisticMutationUtils.inferRelayPayloadFromData(
        data,
      );
      expect(payload).toBe(data);
    });

    it('generates payload for String field arguments from keys', () => {
      const field = RelayQuery.Field.build({
        calls: [{name: 'site', value: 'www'}],
        fieldName: 'url',
      });

      expect(
        RelayOptimisticMutationUtils.inferRelayPayloadFromData({
          id: '123',
          'url(site: "www")': 'https://...',
        }),
      ).toEqual({
        id: '123',
        [field.getSerializationKey()]: 'https://...',
      });
    });

    it('generates payload Boolean field arguments from keys', () => {
      const field = RelayQuery.Field.build({
        calls: [{name: 'relative', value: true}],
        fieldName: 'url',
      });
      expect(
        RelayOptimisticMutationUtils.inferRelayPayloadFromData({
          'url(relative: true)': '//...',
        }),
      ).toEqual({
        [field.getSerializationKey()]: '//...',
      });
    });

    it('infers Int field arguments from keys', () => {
      const field = RelayQuery.Field.build({
        calls: [{name: 'last', value: 10}],
        fieldName: 'comments',
      });
      expect(
        RelayOptimisticMutationUtils.inferRelayPayloadFromData({
          'comments(last: 10)': {
            count: 20,
          },
        }),
      ).toEqual({
        [field.getSerializationKey()]: {
          count: 20,
        },
      });
    });

    it('throws for keys with invalid call encodings', () => {
      expect(() => {
        RelayOptimisticMutationUtils.inferRelayPayloadFromData({
          'url.site': 'https://...',
        });
      }).toFailInvariant(
        'RelayOptimisticMutationUtils: Malformed data key, `url.site`.',
      );

      expect(() => {
        RelayOptimisticMutationUtils.inferRelayPayloadFromData({
          'url(site)': 'https://...',
        });
      }).toFailInvariant(
        'RelayOptimisticMutationUtils: Malformed or unsupported data key, ' +
          '`url(site)`. Only booleans, strings, and numbers are currently ' +
          'supported, and commas are required. Parse failure reason was ' +
          '`' +
          RelayTestUtils.getJSONTokenError('s', 1) +
          '`.',
      );
    });
  });
});

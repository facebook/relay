/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

jest.mock('generateClientID');

const RelayDataLoader = require('../RelayDataLoader');
const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayStoreUtils = require('../RelayStoreUtils');
const RelayModernRecord = require('../RelayModernRecord');
const RelayModernTestUtils = require('RelayModernTestUtils');
const getRelayHandleKey = require('../../util/getRelayHandleKey');

const {check} = RelayDataLoader;
const {ROOT_ID} = RelayStoreUtils;

describe('RelayDataLoader', () => {
  const {generateWithTransforms} = RelayModernTestUtils;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('check()', () => {
    let Query;
    let sampleData;

    beforeEach(() => {
      sampleData = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'friends(first:3)': {__ref: 'client:1'},
          'profilePicture(size:32)': {__ref: 'client:4'},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          firstName: 'Bob',
        },
        '3': {
          __id: '3',
          __typename: 'User',
          id: '3',
          firstName: 'Claire',
        },
        'client:1': {
          __id: 'client:1',
          __typename: 'FriendsConnection',
          edges: {
            __refs: ['client:2', null, 'client:3'],
          },
        },
        'client:2': {
          __id: 'client:2',
          __typename: 'FriendsConnectionEdge',
          cursor: 'cursor:2',
          node: {__ref: '2'},
        },
        'client:3': {
          __id: 'client:3',
          __typename: 'FriendsConnectionEdge',
          cursor: 'cursor:3',
          node: {__ref: '3'},
        },
        'client:4': {
          __id: 'client:4',
          __typename: 'Photo',
          uri: 'https://...',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          'node(id:"1")': {__ref: '1'},
        },
      };
      ({Query} = generateWithTransforms(
        `
        query Query($id: ID, $size: [Int]) {
          node(id: $id) {
            id
            __typename
            ... on Page {
              actors {
                name
              }
            }
            ... on User {
              firstName
              friends(first: 3) {
                edges {
                  cursor
                  node {
                    id
                    firstName
                  }
                }
              }
              profilePicture(size: $size) {
                uri
              }
            }
          }
        }
      `,
      ));
    });

    it('reads query data', () => {
      const source = new RelayInMemoryRecordSource(sampleData);
      const target = new RelayInMemoryRecordSource();
      const status = check(
        source,
        target,
        {
          dataID: ROOT_ID,
          node: Query.fragment,
          variables: {id: '1', size: 32},
        },
        [],
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });

    it('reads fragment data', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'friends(first:1)': {__ref: 'client:1'},
          'profilePicture(size:32)': {__ref: 'client:3'},
        },
        '2': {
          __id: '2',
          __typename: 'User',
          id: '2',
          firstName: 'Bob',
        },
        'client:1': {
          __id: 'client:1',
          __typename: 'FriendsConnection',
          edges: {
            __refs: ['client:2'],
          },
        },
        'client:2': {
          __id: 'client:2',
          __typename: 'FriendsConnectionEdge',
          cursor: 'cursor:2',
          node: {__ref: '2'},
        },
        'client:3': {
          __id: 'client:3',
          __typename: 'Photo',
          uri: 'https://...',
        },
      };
      const source = new RelayInMemoryRecordSource(data);
      const target = new RelayInMemoryRecordSource();
      const {BarFragment} = generateWithTransforms(
        `
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          friends(first: 1) {
            edges {
              cursor
              node {
                id
                firstName
              }
            }
          }
          profilePicture(size: $size) {
            uri
          }
        }
      `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        [],
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });

    it('reads handle fields', () => {
      const handleKey = getRelayHandleKey('test', null, 'profilePicture');
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'profilePicture(size:32)': {__ref: 'client:1'},
          [handleKey]: {__ref: 'client:3'},
        },
        'client:1': {
          __id: 'client:2',
          __typename: 'Photo',
          uri: 'https://...',
        },
        'client:3': {
          __id: 'client:2',
          __typename: 'Photo',
          uri: 'https://...',
        },
      };
      const source = new RelayInMemoryRecordSource(data);
      const target = new RelayInMemoryRecordSource();
      const {Fragment} = generateWithTransforms(
        `
          fragment Fragment on User {
            profilePicture(size: 32) @__clientField(handle: "test") {
              uri
            }
          }
        `,
      );
      const status = check(
        source,
        target,
        {
          dataID: '1',
          node: Fragment,
          variables: {},
        },
        [],
      );
      expect(status).toBe(true);
      expect(target.size()).toBe(0);
    });

    describe('when the data is complete', () => {
      it('returns `true`', () => {
        const source = new RelayInMemoryRecordSource(sampleData);
        const target = new RelayInMemoryRecordSource();
        const status = check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query.fragment,
            variables: {id: '1', size: 32},
          },
          [],
        );
        expect(status).toBe(true);
        expect(target.size()).toBe(0);
      });
    });

    describe('when some data is missing', () => {
      it('returns false on missing records', () => {
        const data = {
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'profilePicture(size:32)': {__ref: 'client:3'},
          },
          // missing profilePicture record
        };
        const source = new RelayInMemoryRecordSource(data);
        const target = new RelayInMemoryRecordSource();
        const {BarFragment} = generateWithTransforms(
          `
            fragment BarFragment on User @argumentDefinitions(
              size: {type: "[Int]"}
            ) {
              id
              firstName
              profilePicture(size: $size) {
                uri
              }
            }
          `,
        );
        const status = check(
          source,
          target,
          {
            dataID: '1',
            node: BarFragment,
            variables: {size: 32},
          },
          [],
        );
        expect(status).toBe(false);
        expect(target.size()).toBe(0);
      });

      it('returns false on missing fields', () => {
        const data = {
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'profilePicture(size:32)': {__ref: 'client:3'},
          },
          'client:3': {
            __id: 'client:3',
            // missing 'uri'
          },
        };
        const source = new RelayInMemoryRecordSource(data);
        const target = new RelayInMemoryRecordSource();
        const {BarFragment} = generateWithTransforms(
          `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
        );
        const status = check(
          source,
          target,
          {
            dataID: '1',
            node: BarFragment,
            variables: {size: 32},
          },
          [],
        );
        expect(status).toBe(false);
        expect(target.size()).toBe(0);
      });

      it('allows handlers to supplement missing fields', () => {
        const data = {
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'profilePicture(size:32)': {__ref: 'client:3'},
          },
          'client:3': {
            __id: 'client:3',
            // missing 'uri'
          },
        };
        const source = new RelayInMemoryRecordSource(data);
        const target = new RelayInMemoryRecordSource();
        const {BarFragment} = generateWithTransforms(
          `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
        );
        const status = check(
          source,
          target,
          {
            dataID: '1',
            node: BarFragment,
            variables: {size: 32},
          },
          [
            {
              kind: 'scalar',
              handle: (field, record, argValues) => {
                return 'thebestimage.uri';
              },
            },
          ],
        );
        expect(status).toBe(true);
        expect(target.toJSON()).toEqual({
          'client:3': {
            __id: 'client:3',
            __typename: undefined,
            uri: 'thebestimage.uri',
          },
        });
      });

      it('returns modified records with the target', () => {
        const data = {
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
          },
          profile_1_32: {
            __id: 'profile_1_32',
            id: 'profile_1_32',
            __typename: 'Profile',
            uri: 'thebestimage.uri',
          },
        };
        const source = new RelayInMemoryRecordSource(data);
        const target = new RelayInMemoryRecordSource();
        const {BarFragment} = generateWithTransforms(
          `
          fragment BarFragment on User @argumentDefinitions(
            size: {type: "[Int]"}
          ) {
            id
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        `,
        );
        const status = check(
          source,
          target,
          {
            dataID: '1',
            node: BarFragment,
            variables: {size: 32},
          },
          [
            {
              kind: 'scalar',
              handle: (field, record, argValues) => {
                if (
                  record &&
                  RelayModernRecord.getDataID(record) === '1' &&
                  field.name === 'firstName'
                ) {
                  return 'Alice';
                }
              },
            },
            {
              kind: 'linked',
              handle: (field, record, argValues) => {
                const id = record && RelayModernRecord.getDataID(record);
                if (
                  field.name === 'profilePicture' &&
                  record &&
                  typeof id === 'string'
                ) {
                  return `profile_${id}_${argValues.size}`;
                }
              },
            },
          ],
        );
        expect(status).toBe(true);
        expect(target.toJSON()).toEqual({
          '1': {
            __id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'profilePicture(size:32)': {__ref: 'profile_1_32'},
          },
        });
      });
    });
  });
});

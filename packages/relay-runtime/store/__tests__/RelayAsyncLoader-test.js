/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff()
  .mock('generateClientID');

const RelayAsyncLoader = require('RelayAsyncLoader');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayStaticTestUtils = require('RelayStaticTestUtils');
const getRelayStaticHandleKey = require('getRelayStaticHandleKey');

const {
  check,
  load,
} = RelayAsyncLoader;
const {ROOT_ID} = RelayStoreUtils;

describe('RelayAsyncLoader', () => {
  const {generateWithTransforms} = RelayStaticTestUtils;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('check()', () => {
    let Query;
    let data;
    let source;
    let target;

    beforeEach(() => {
      data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'friends{"first":3}': {__ref: 'client:1'},
          'profilePicture{"size":32}': {__ref: 'client:4'},
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
          'node{"id":"1"}': {__ref: '1'},
        },
      };
      ({Query} = generateWithTransforms(`
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
      `));
      target = new RelayInMemoryRecordSource();
    });

    describe('when the data is complete', () => {
      beforeEach(() => {
        source = new RelayInMemoryRecordSource(data);
      });

      it('returns `true`', () => {
        const status = check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query,
            variables: {id: '1', size: 32},
          }
        );
        expect(status).toBe(true);
      });

      it('makes the checked data available in the target sink', () => {
        check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query,
            variables: {id: '1', size: 32},
          }
        );
        expect(target.toJSON()).toEqual(source.toJSON());
        expect(target.getRecordIDs().sort()).toEqual(source.getRecordIDs().sort());
      });
    });

    describe('when some data is missing', () => {
      it('returns `false`', () => {
        delete data['client:3'];
        source = new RelayInMemoryRecordSource(data);
        const status = check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query,
            variables: {id: '1', size: 32},
          }
        );
        expect(status).toBe(false);
      });
    });

    describe('when the source is asynchronous', () => {
      let loadCount;

      beforeEach(() => {
        // RelayInMemoryRecordSource is synchronous; so we put it inside an
        // asynchronous wrapper.
        loadCount = 0;
        const innerSource = new RelayInMemoryRecordSource(data);
        source = {
          get: dataID => innerSource.get(dataID),
          getRecordIDs: () => innerSource.getRecordIDs(),
          getStatus: dataID => innerSource.getStatus(dataID),
          has: dataID => innerSource.has(dataID),
          load: (dataID, callback) => {
            loadCount++;
            setImmediate(() => {
              innerSource.load(dataID, callback);
            });
          },
          size: () => innerSource.size(),
        };
      });

      it('immediately returns `false`', () => {
        const status = check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query,
            variables: {id: '1', size: 32},
          }
        );
        expect(status).toBe(false);
      });

      it('cancels the async traversal by invoking `dispose`', () => {
        expect(loadCount).toBe(0);
        check(
          source,
          target,
          {
            dataID: ROOT_ID,
            node: Query,
            variables: {id: '1', size: 32},
          }
        );
        expect(loadCount).toBe(1);
        jest.runAllTimers();
        expect(loadCount).toBe(1); // Without the `dispose`, this would be 8.
      });
    });
  });

  describe('load()', () => {
    it('reads query data', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'friends{"first":3}': {__ref: 'client:1'},
          'profilePicture{"size":32}': {__ref: 'client:4'},
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
          'node{"id":"1"}': {__ref: '1'},
        },
      };
      const source = new RelayInMemoryRecordSource(data);
      const {FooQuery} = generateWithTransforms(`
        query FooQuery($id: ID, $size: [Int]) {
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
      `);
      const target = new RelayInMemoryRecordSource();
      const fn = jest.fn();
      load(
        source,
        target,
        {
          dataID: ROOT_ID,
          node: FooQuery,
          variables: {id: '1', size: 32},
        },
        fn
      );
      expect(fn.mock.calls[0][0]).toEqual({status: 'complete'});
      expect(target.toJSON()).toEqual(source.toJSON());
      expect(target.getRecordIDs().sort()).toEqual(source.getRecordIDs().sort());
    });

    it('reads fragment data', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'friends{"first":1}': {__ref: 'client:1'},
          'profilePicture{"size":32}': {__ref: 'client:3'},
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
      const {BarFragment} = generateWithTransforms(`
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
      `);
      const target = new RelayInMemoryRecordSource();
      const fn = jest.fn();
      load(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        fn
      );
      expect(fn).toBeCalled();
      expect(fn.mock.calls[0][0]).toEqual({status: 'complete'});
      expect(target.toJSON()).toEqual(source.toJSON());
      expect(target.getRecordIDs().sort()).toEqual(source.getRecordIDs().sort());
    });

    it('reads handle fields', () => {
      const handleKey = getRelayStaticHandleKey('test', null, 'profilePicture');
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          'profilePicture{"size":32}': {__ref: 'client:1'},
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
      const {Fragment} = generateWithTransforms(`
        fragment Fragment on User {
          profilePicture(size: 32) @__clientField(handle: "test") {
            uri
          }
        }
      `);
      const target = new RelayInMemoryRecordSource();
      const fn = jest.fn();
      load(
        source,
        target,
        {
          dataID: '1',
          node: Fragment,
          variables: {},
        },
        fn
      );
      expect(fn).toBeCalled();
      expect(fn.mock.calls[0][0]).toEqual({status: 'complete'});
      expect(target.toJSON()).toEqual(source.toJSON());
      expect(target.getRecordIDs().sort()).toEqual(source.getRecordIDs().sort());
    });

    it('reports missing records', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture{"size":32}': {__ref: 'client:3'},
        },
        // missing profilePicture record
      };
      const source = new RelayInMemoryRecordSource(data);
      const {BarFragment} = generateWithTransforms(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const target = new RelayInMemoryRecordSource();
      const fn = jest.fn();
      load(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        fn
      );
      expect(fn).toBeCalled();
      expect(fn.mock.calls[0][0]).toEqual({status: 'missing'});
    });

    it('reports missing fields', () => {
      const data = {
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          firstName: 'Alice',
          'profilePicture{"size":32}': {__ref: 'client:3'},
        },
        'client:3': {
          __id: 'client:3',
          // missing 'uri'
        },
      };
      const source = new RelayInMemoryRecordSource(data);
      const {BarFragment} = generateWithTransforms(`
        fragment BarFragment on User @argumentDefinitions(
          size: {type: "[Int]"}
        ) {
          id
          firstName
          profilePicture(size: $size) {
            uri
          }
        }
      `);
      const target = new RelayInMemoryRecordSource();
      const fn = jest.fn();
      load(
        source,
        target,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        fn
      );
      expect(fn).toBeCalled();
      expect(fn.mock.calls[0][0]).toEqual({status: 'missing'});
    });
  });
});

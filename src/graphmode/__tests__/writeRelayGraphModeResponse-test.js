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

jest
  .unmock('GraphQLRange')
  .unmock('GraphQLSegment');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryPath = require('RelayQueryPath');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('readRelayQueryData');
const writeRelayGraphModeResponse = require('writeRelayGraphModeResponse');

const {
  HAS_NEXT_PAGE,
  PAGE_INFO,
} = RelayConnectionInterface;

describe('writeRelayGraphModeResponse()', () => {
  const {getNode} = RelayTestUtils;

  let environment;
  let store;
  let storeData;
  let writeGraph;

  beforeEach(() => {
    jest.resetModuleRegistry();

    environment = new RelayEnvironment();
    storeData = environment.getStoreData();
    store = storeData.getQueuedStore();
    const writer = storeData.getRecordWriter();

    writeGraph = (payload) => {
      const changeSet = writeRelayGraphModeResponse(store, writer, payload);
      return changeSet.getChangeSet();
    };
  });

  describe('roots', () => {
    it('writes argument-less root fields without an id', () => {
      const payload = [
        {
          op: 'putRoot',
          args: null,
          field: 'viewer',
          root: {
            actor: {__ref: '123'},
          },
        },
        {
          op: 'putNodes',
          nodes: {
            123: {id: '123'},
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          'client:1': true,
          '123': true,
        },
        updated: {},
      });
      expect(store.getDataID('viewer', null)).toBe('client:1');
      const data = environment.readQuery(getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `));
      expect(data[0]).toEqual({
        __dataID__: 'client:1',
        actor: {
          __dataID__: '123',
          id: '123',
        },
      });
    });

    it('writes paths to id-less root fields', () => {
      const query = getNode(Relay.QL`query{viewer{actor{id}}}`);
      const path = RelayQueryPath.create(query);
      const payload = [
        {
          op: 'putRoot',
          args: null,
          field: 'viewer',
          root: {
            __path__: path,
          },
        },
      ];
      writeGraph(payload);
      expect(store.getDataID('viewer', null)).toBe('client:1');
      expect(store.getPathToRecord('client:1')).toBe(path);
    });

    it('writes argument-less root fields with an id', () => {
      const payload = [
        {
          op: 'putRoot',
          args: null,
          field: 'me',
          root: {__ref: '123'},
        },
        {
          op: 'putNodes',
          nodes: {
            123: {id: '123'},
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getDataID('me', null)).toBe('123');
      const data = environment.readQuery(getNode(Relay.QL`
        query {
          me {
            id
          }
        }
      `));
      expect(data[0]).toEqual({
        __dataID__: '123',
        id: '123',
      });
    });

    it('writes root fields with arguments', () => {
      const payload = [
        {
          op: 'putRoot',
          identifier: 123,
          field: 'task',
          root: {
            title: 'Implement GraphMode',
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          'client:1': true,
        },
        updated: {},
      });
      expect(store.getDataID('task', '123')).toBe('client:1');
      const data = environment.readQuery(getNode(Relay.QL`
        query {
          task(number: 123) {
            title
          }
        }
      `));
      expect(data[0]).toEqual({
        __dataID__: 'client:1',
        title: 'Implement GraphMode',
      });
    });
  });

  describe('nodes', () => {
    it('writes nodes with scalar fields', () => {
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              id: '123',
              name: 'Alice',
            },
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          123: true,
        },
        updated: {},
      });
      const {data} = readRelayQueryData(
        storeData,
        getNode(Relay.QL`
          fragment on User {
            id
            name
          }
        `),
        '123',
      );
      expect(data).toEqual({
        __dataID__: '123',
        id: '123',
        name: 'Alice',
      });
    });

    it('writes nodes with linked records', () => {
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              id: '123',
              hometown: {__ref: '456'},
              name: 'Alice',
            },
            456: {
              id: '456',
              name: 'Menlo Park',
            },
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          123: true,
          456: true,
        },
        updated: {},
      });
      const {data} = readRelayQueryData(
        storeData,
        getNode(Relay.QL`
          fragment on User {
            id
            hometown {
              id
              name
            }
            name
          }
        `),
        '123',
      );
      expect(data).toEqual({
        __dataID__: '123',
        id: '123',
        hometown: {
          __dataID__: '456',
          id: '456',
          name: 'Menlo Park',
        },
        name: 'Alice',
      });
    });

    it('writes nodes with linked client records', () => {
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              id: '123',
              hometown: {
                name: 'Menlo Park',
              },
              name: 'Alice',
            },
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          123: true,
          'client:1': true,
        },
        updated: {},
      });
      const {data} = readRelayQueryData(
        storeData,
        getNode(Relay.QL`
          fragment on User {
            id
            hometown {
              name
            }
            name
          }
        `),
        '123'
      );
      expect(data).toEqual({
        __dataID__: '123',
        id: '123',
        hometown: {
          __dataID__: 'client:1',
          name: 'Menlo Park',
        },
        name: 'Alice',
      });
    });

    it('writes paths to id-less records', () => {
      const query = getNode(Relay.QL`query{me{hometown}}`);
      const path = RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        query.getFieldByStorageKey('hometown'),
        null
      );
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              id: '123',
              hometown: {
                __path__: path,
              },
            },
          },
        },
      ];
      writeGraph(payload);
      expect(store.getLinkedRecordID('123', 'hometown')).toBe('client:1');
      expect(store.getPathToRecord('client:1')).toBe(path);
    });

    it('writes nodes with plural linked records', () => {
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              actors: [
                {__ref: '456'},
              ],
              id: '123',
              name: 'Alice',
            },
            456: {
              id: '456',
              name: 'Bob',
            },
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          123: true,
          456: true,
        },
        updated: {},
      });
      const {data} = readRelayQueryData(
        storeData,
        getNode(Relay.QL`
          fragment on User {
            actors {
              id
              name
            }
            id
            name
          }
        `),
        '123'
      );
      expect(data).toEqual({
        __dataID__: '123',
        actors: [
          {
            __dataID__: '456',
            id: '456',
            name: 'Bob',
          },
        ],
        id: '123',
        name: 'Alice',
      });
    });

    it('writes nodes with plural linked client records', () => {
      const payload = [
        {
          op: 'putNodes',
          nodes: {
            123: {
              actors: [
                {
                  name: 'Bob',
                },
              ],
              id: '123',
              name: 'Alice',
            },
          },
        },
      ];
      const changes = writeGraph(payload);
      expect(changes).toEqual({
        created: {
          123: true,
          'client:1': true,
        },
        updated: {},
      });

      const {data} = readRelayQueryData(
        storeData,
        getNode(Relay.QL`
          fragment on User {
            actors {
              name
            }
            id
            name
          }
        `),
        '123'
      );
      expect(data).toEqual({
        __dataID__: '123',
        actors: [
          {
            __dataID__: 'client:1',
            name: 'Bob',
          },
        ],
        id: '123',
        name: 'Alice',
      });
    });

    describe('edges', () => {
      it('writes connection edges', () => {
        const payload = [
          {
            op: 'putNodes',
            nodes: {
              123: {
                id: '123',
                friends: {
                  __key: '__123_friends',
                  count: 5000,
                },
              },
              456: {
                id: '456',
                name: 'Bob',
              },
              789: {
                id: '789',
                name: 'Claire',
              },
            },
          },
          {
            op: 'putEdges',
            args: [{name: 'first', value: 2}],
            edges: [
              {
                cursor: 'edge456',
                node: {__ref: '456'},
              },
              {
                cursor: 'edge789',
                node: {__ref: '789'},
              },
            ],
            pageInfo: {
              [HAS_NEXT_PAGE]: true,
            },
            range: {
              __key: '__123_friends',
            },
          },
        ];

        const changes = writeGraph(payload);
        expect(changes).toEqual({
          created: {
            123: true,
            456: true,
            789: true,
            'client:1': true,
            'client:client:1:456': true,
            'client:client:1:789': true,
          },
          updated: {},
        });

        const {data} = readRelayQueryData(
          storeData,
          getNode(Relay.QL`
            fragment on User {
              friends(first: "2") {
                count
                edges {
                  cursor
                  node {
                    id
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          `),
          '123'
        );
        expect(data).toEqual({
          __dataID__: '123',
          friends: {
            __dataID__: 'client:1_first(2)',
            count: 5000,
            edges: [
              {
                __dataID__: 'client:client:1:456',
                cursor: 'edge456',
                node: {
                  __dataID__: '456',
                  id: '456',
                  name: 'Bob',
                },
              },
              {
                __dataID__: 'client:client:1:789',
                cursor: 'edge789',
                node: {
                  __dataID__: '789',
                  id: '789',
                  name: 'Claire',
                },
              },
            ],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
            },
          },
        });
      });
    });
  });
});

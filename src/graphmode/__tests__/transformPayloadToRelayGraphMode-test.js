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
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

const forEachObject = require('forEachObject');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const transformPayloadToRelayGraphMode = require('transformPayloadToRelayGraphMode');

describe('transformPayloadToRelayGraphMode()', () => {
  const {getNode} = RelayTestUtils;
  let queryTracker;
  let store;

  beforeEach(() => {
    jest.resetModuleRegistry();

    queryTracker = new RelayQueryTracker();
    store = new RelayRecordStore({records: {}});

    function mapWithoutPaths(value) {
      if (Array.isArray(value)) {
        return value.map(mapWithoutPaths);
      } else if (typeof value === 'object' && value) {
        const result = {};
        forEachObject(value, (keyValue, key) => {
          if (key !== '__path__') {
            result[key] = mapWithoutPaths(keyValue);
          }
        });
        return result;
      } else {
        return value;
      }
    }

    jasmine.addMatchers({
      toEqualWithoutPaths() {
        return {
          compare(actual, expected) {
            expect(mapWithoutPaths(actual)).toEqual(expected);
            return {
              pass: true,
            };
          },
        };
      },
    });
  });

  describe('roots', () => {
    it('transforms argument-less root fields without an id', () => {
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            __typename: 'User',
            id: '123',
          },
        },
      };
      const graphPayload = transformPayloadToRelayGraphMode(
        store,
        queryTracker,
        query,
        payload
      );
      expect(graphPayload).toEqual([
        {
          op: 'putNodes',
          nodes: {
            123: {
              __typename: 'User',
              id: '123',
            },
          },
        },
        {
          op: 'putRoot',
          field: 'viewer',
          identifier: null,
          root: {
            __typename: 'Viewer',
            __path__: RelayQueryPath.create(query),
            actor: {
              __ref: '123',
            },
          },
        },
      ]);
    });

    it('transforms argument-less root fields with an id', () => {
      const query = getNode(Relay.QL`
        query {
          me {
            id
          }
        }
      `);
      const payload = {
        me: {
          id: '123',
        },
      };
      const graphPayload = transformPayloadToRelayGraphMode(
        store,
        queryTracker,
        query,
        payload
      );
      expect(graphPayload).toEqual([
        {
          op: 'putNodes',
          nodes: {
            123: {
              __typename: 'User',
              id: '123',
            },
          },
        },
        {
          op: 'putRoot',
          field: 'me',
          identifier: null,
          root: {
            __ref: '123',
          },
        },
      ]);
    });

    it('transforms root fields with arguments', () => {
      const query = getNode(Relay.QL`
        query {
          task(number: 123) {
            title
          }
        }
      `);
      const payload = {
        task: {
          title: 'Implement GraphMode',
        },
      };
      const graphPayload = transformPayloadToRelayGraphMode(
        store,
        queryTracker,
        query,
        payload
      );
      expect(graphPayload).toEqual([
        {
          op: 'putRoot',
          field: 'task',
          identifier: 123,
          root: {
            __typename: 'Task',
            __path__: RelayQueryPath.create(query),
            title: 'Implement GraphMode',
          },
        },
      ]);
    });
  });

  it('transforms payloads with connections', () => {
    const query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ... on Story {
            canViewerDelete
            feedback {
              body {
                text
              }
            }
            comments(first: "1", orderby: "date") {
              count
              edges {
                node {
                  id
                  body {
                    text
                  }
                }
              }
            }
          }
        }
      }
    `);
    const commentsAlias =
      generateRQLFieldAlias('comments.first(1).orderby(date)');
    const payload = {
      node: {
        id: '123',
        __typename: 'Story',
        canViewerDelete: true,
        feedback: {
          id: '456',
          body: {
            text: 'Feedback!',
          },
        },
        [commentsAlias]: {
          count: 1,
          edges: [
            {
              cursor: 'comment1cursor',
              node: {
                id: 'comment1',
                body: {
                  text: 'Comment!',
                },
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
          },
        },
      },
    };
    const graphPayload = transformPayloadToRelayGraphMode(
      store,
      queryTracker,
      query,
      payload
    );
    const expectedPayload = [
      {
        op: 'putNodes',
        nodes: {
          123: {
            __typename: 'Story',
            id: '123',
            canViewerDelete: true,
            feedback: {
              __ref: '456',
            },
            'comments{orderby:"date"}': {
              __key: '0',
              __typename: 'CommentsConnection',
              count: 1,
            },
          },
          456: {
            __typename: 'Feedback',
            id: '456',
            body: {
              __typename: 'Text',
              text: 'Feedback!',
            },
          },
          'comment1': {
            __typename: 'Comment',
            id: 'comment1',
            body: {
              __typename: 'Text',
              text: 'Comment!',
            },
          },
        },
      },
      {
        op: 'putRoot',
        field: 'node',
        identifier: '123',
        root: {__ref: '123'},
      },
      {
        op: 'putEdges',
        args: [{name: 'first', value: '1'}, {name: 'orderby', value: 'date'}],
        edges: [
          {
            __typename: 'CommentsEdge',
            cursor: 'comment1cursor',
            node: {
              __ref: 'comment1',
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: true,
        },
        range: {__key: '0'},
      },
    ];
    expect(graphPayload).toEqualWithoutPaths(expectedPayload);
  });
});

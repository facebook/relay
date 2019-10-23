/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayConnectionResolver = require('../RelayConnectionResolver');

describe('RelayConnectionResolver', () => {
  describe('insert', () => {
    it('inserts edges into an empty connection', () => {
      const prev = RelayConnectionResolver.initialize();
      const event = {
        kind: 'insert',
        args: {},
        edge: {
          __id: 'edge-0',
          cursor: 'cursor-0',
          node: {__id: 'node-0', id: 'node-0'},
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [event.edge],
        pageInfo: {
          endCursor: 'cursor-0',
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      });
    });

    it('appends new edges', () => {
      const prev = {
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-0',
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      };
      const event = {
        kind: 'insert',
        args: {},
        edge: {
          __id: 'edge-1',
          cursor: 'cursor-1',
          node: {__id: 'node-1', id: 'node-1'},
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [prev.edges[0], event.edge],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      });
    });

    it('ignores new edges with duplicate node data id  (client id)', () => {
      const prev = {
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'client:1', id: null},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-0',
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      };
      const event = {
        kind: 'insert',
        args: {},
        edge: {
          __id: 'edge-1',
          cursor: 'cursor-1',
          node: {__id: 'client:1', id: null},
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [prev.edges[0]],
        pageInfo: {
          endCursor: 'cursor-0',
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      });
    });
  });

  describe('update', () => {
    it('removes deleted edges', () => {
      const prev = {
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      };
      const event = {
        kind: 'update',
        edgeData: {
          'edge-0': null,
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('removes edges with deleted nodes', () => {
      const prev = {
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      };
      const event = {
        kind: 'update',
        edgeData: {
          'edge-0': {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: null,
          },
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });
  });

  describe('fetch (initial)', () => {
    it('initializes from a fetch', () => {
      const args = {first: 10, orderby: ['first name']};
      const prev = RelayConnectionResolver.initialize();
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('initializes from a fetch with default page info', () => {
      const args = {first: 10, orderby: ['first name']};
      const prev = RelayConnectionResolver.initialize();
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: null,
          hasPrevPage: null,
          startCursor: null,
        },
      });
    });
  });

  describe('fetch (pagination/refetch)', () => {
    let prev;

    beforeEach(() => {
      const args = {first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-0',
            cursor: 'cursor-0',
            node: {__id: 'node-0', id: 'node-0'},
          },
          {
            __id: 'edge-1',
            cursor: 'cursor-1',
            node: {__id: 'node-1', id: 'node-1'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      };
      prev = RelayConnectionResolver.reduce(
        RelayConnectionResolver.initialize(),
        event,
      );
    });
    it('paginates forward', () => {
      const args = {after: 'cursor-1', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...prev.edges, ...event.edges],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('paginates backward', () => {
      const args = {before: 'cursor-0', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: null,
          hasPrevPage: true,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...event.edges, ...prev.edges],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: true,
          startCursor: 'cursor-2',
        },
      });
    });

    it('resets the connection for head loads (no after/before args)', () => {
      const args = {first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...event.edges],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      });
    });

    it('paginates forward with edges with null cursors', () => {
      const args = {after: 'cursor-1', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {__id: 'edge-2', cursor: null, node: {__id: 'node-2', id: 'node-2'}},
          {__id: 'edge-3', cursor: null, node: {__id: 'node-3', id: 'node-3'}},
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: null,
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...prev.edges, ...event.edges],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('ignores edges with duplicate node data id (server `id`)', () => {
      const args = {after: 'cursor-1', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-dup', id: 'node-dup'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-dup', id: 'node-dup'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          ...prev.edges,
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-dup', id: 'node-dup'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('ignores edges with duplicate node data id (client ids)', () => {
      const args = {after: 'cursor-1', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'client:1', id: null},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'client:1', id: null},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [
          ...prev.edges,
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'client:1', id: null},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('adds edges with duplicate cursors', () => {
      const args = {after: 'cursor-1', first: 10, orderby: ['first name']};
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-dup',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-dup',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-dup',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-dup',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...prev.edges, ...event.edges],
        pageInfo: {
          endCursor: 'cursor-dup',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('ignores forward pagination payloads with unknown cursors', () => {
      const args = {
        after: 'cursor-unknown',
        first: 10,
        orderby: ['first name'],
      };
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...prev.edges],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });

    it('ignores backward pagination payloads with unknown cursors', () => {
      const args = {
        before: 'cursor-unknown',
        first: 10,
        orderby: ['first name'],
      };
      const event = {
        kind: 'fetch',
        args,
        edges: [
          {
            __id: 'edge-2',
            cursor: 'cursor-2',
            node: {__id: 'node-2', id: 'node-2'},
          },
          {
            __id: 'edge-3',
            cursor: 'cursor-3',
            node: {__id: 'node-3', id: 'node-3'},
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-2',
        },
      };
      const next = RelayConnectionResolver.reduce(prev, event);
      expect(next).toEqual({
        edges: [...prev.edges],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-0',
        },
      });
    });
  });
});

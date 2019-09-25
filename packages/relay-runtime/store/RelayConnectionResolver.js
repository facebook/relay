/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {DataID} from '../util/RelayRuntimeTypes';
import type {ConnectionEvent} from './RelayConnection';

export type ConnectionState<
  TEdge: {+__id: DataID, +cursor: ?string, +node: ?{+__id: DataID}},
> = $ReadOnly<{|
  edges: $ReadOnlyArray<TEdge>,
  pageInfo: {
    endCursor: ?string,
    hasNextPage: ?boolean,
    hasPrevPage: ?boolean,
    startCursor: ?string,
  },
|}>;

const ConnectionResolver = {
  initialize<
    TEdge: {+__id: DataID, +cursor: ?string, +node: ?{+__id: DataID}},
  >(): ConnectionState<TEdge> {
    return {
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: null,
        hasPrevPage: null,
        startCursor: null,
      },
    };
  },
  reduce<TEdge: {+__id: DataID, +cursor: ?string, +node: ?{+__id: DataID}}>(
    state: ConnectionState<TEdge>,
    event: ConnectionEvent<TEdge>,
  ): ConnectionState<TEdge> {
    const nextEdges = [];
    let nextPageInfo = {...state.pageInfo};
    const seenNodes = new Set();
    function pushEdge(edge) {
      if (edge != null && edge.node != null && !seenNodes.has(edge.node.__id)) {
        seenNodes.add(edge.node.__id);
        nextEdges.push(edge);
        return edge;
      }
    }
    if (event.kind === 'update') {
      state.edges.forEach(edge => {
        const nextEdge = event.edgeData.hasOwnProperty(edge.__id)
          ? event.edgeData[edge.__id]
          : edge;
        pushEdge(nextEdge);
      });
    } else if (event.kind === 'fetch') {
      const eventPageInfo = event.pageInfo;
      if (event.args.after != null) {
        if (event.args.after !== state.pageInfo.endCursor) {
          return state;
        }
        state.edges.forEach(edge => {
          pushEdge(edge);
        });
        event.edges.forEach(nextEdge => {
          pushEdge(nextEdge);
        });
        nextPageInfo.endCursor =
          eventPageInfo?.endCursor ?? nextPageInfo.endCursor;
        nextPageInfo.hasNextPage =
          eventPageInfo?.hasNextPage ?? nextPageInfo.hasNextPage;
      } else if (event.args.before != null) {
        if (event.args.before !== state.pageInfo.startCursor) {
          return state;
        }
        event.edges.forEach(nextEdge => {
          pushEdge(nextEdge);
        });
        state.edges.forEach(edge => {
          pushEdge(edge);
        });
        nextPageInfo.startCursor =
          eventPageInfo?.startCursor ?? nextPageInfo.startCursor;
        nextPageInfo.hasPrevPage =
          eventPageInfo?.hasPrevPage ?? nextPageInfo.hasPrevPage;
      } else if (event.args.before == null && event.args.after == null) {
        event.edges.forEach(nextEdge => {
          pushEdge(nextEdge);
        });
        if (eventPageInfo != null) {
          nextPageInfo = eventPageInfo;
        }
      }
    } else if (event.kind === 'insert') {
      state.edges.forEach(edge => {
        pushEdge(edge);
      });
      const nextEdge = pushEdge(event.edge);
      if (nextEdge != null) {
        nextPageInfo.endCursor = nextEdge.cursor ?? nextPageInfo.endCursor;
      }
    } else if (event.kind === 'stream.edge') {
      if (event.args.after != null) {
        if (
          event.index === 0 &&
          state.pageInfo.endCursor != null &&
          event.args.after !== state.pageInfo.endCursor
        ) {
          return state;
        }
        state.edges.forEach(edge => {
          pushEdge(edge);
        });
        const nextEdge = pushEdge(event.edge);
        if (nextEdge) {
          nextPageInfo.endCursor = nextEdge.cursor ?? nextPageInfo.endCursor;
        }
      } else if (event.args.before != null) {
        if (
          event.index === 0 &&
          state.pageInfo.startCursor != null &&
          event.args.before !== state.pageInfo.startCursor
        ) {
          return state;
        }
        const nextEdge = pushEdge(event.edge);
        if (nextEdge) {
          nextPageInfo.startCursor =
            nextEdge.cursor ?? nextPageInfo.startCursor;
        }
        state.edges.forEach(edge => {
          pushEdge(edge);
        });
      } else if (event.args.after == null || event.args.before == null) {
        state.edges.forEach(edge => {
          pushEdge(edge);
        });
        const nextEdge = pushEdge(event.edge);
        if (nextEdge != null) {
          nextPageInfo.endCursor = nextEdge.cursor ?? nextPageInfo.endCursor;
        }
      }
    } else if (event.kind === 'stream.pageInfo') {
      nextEdges.push(...state.edges);
      if (event.args.after != null) {
        nextPageInfo.endCursor =
          event.pageInfo.endCursor ?? nextPageInfo.endCursor;
        nextPageInfo.hasNextPage = !!event.pageInfo.hasNextPage;
      } else if (event.args.before != null) {
        nextPageInfo.startCursor =
          event.pageInfo.startCursor ?? nextPageInfo.startCursor;
        nextPageInfo.hasPrevPage = !!event.pageInfo.hasPrevPage;
      } else {
        // stream refetch
        nextPageInfo = event.pageInfo;
      }
    } else {
      (event: empty);
      invariant(
        false,
        'ConnectionResolver-test: Unexpected event kind `%s`.',
        event.kind,
      );
    }
    return {
      edges: nextEdges,
      pageInfo: nextPageInfo,
    };
  },
};

module.exports = ConnectionResolver;

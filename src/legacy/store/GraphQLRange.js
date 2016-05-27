/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLRange
 * @typechecks
 */

'use strict';

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');
const GraphQLSegment = require('GraphQLSegment');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayRecord = require('RelayRecord');

const forEachObject = require('forEachObject');
const invariant = require('invariant');
const rangeOperationToMetadataKey = require('rangeOperationToMetadataKey');
const serializeRelayQueryCall = require('serializeRelayQueryCall');
const warning = require('warning');

const {
  END_CURSOR,
  HAS_NEXT_PAGE,
  HAS_PREV_PAGE,
  START_CURSOR,
} = RelayConnectionInterface;

/**
 * @param {array<object>} queryCalls
 * @return {object}
 */
function callsArrayToObject(queryCalls) {
  const calls = {};
  for (let ii = 0; ii < queryCalls.length; ii++) {
    if (RelayConnectionInterface.isConnectionCall(queryCalls[ii])) {
      const queryCall = queryCalls[ii];
      let {value} = queryCall;
      // assuming that range calls will only have a single argument
      if (Array.isArray(value) && value.length) {
        value = value[0];
      }
      // Ignore the whole call when the value is null
      if (value === null) {
        continue;
      }
      calls[queryCall.name] = value;
    }
  }
  // update first and last call values to be numbers
  if (calls.first) {
    invariant(
      !isNaN(calls.first),
      'GraphQLRange: Expected `first` argument to be a number, got ' +
      '`%s`.',
      calls.first
    );
    calls.first = +calls.first;
  } else if (calls.last) {
    invariant(
      !isNaN(calls.last),
      'GraphQLRange: Expected `last` argument to be a number, got ' +
      '`%s`.',
      calls.last
    );
    calls.last = +calls.last;
  }
  return calls;
}

/**
 * Returns whether this is currently a set of static calls that GraphQLRange
 * supports. Static calls define ranges that do not change over a period
 * of time, given the same set of arguments.
 *
 * @param {object} calls
 * @return {?boolean}
 */
function isStaticCall(calls) {
  return calls.hasOwnProperty('surrounds') || calls.hasOwnProperty('find');
}

/**
 * Returns whether this is currently a set of calls that GraphQLRange
 * supports
 *
 * @param {object} calls
 * @return {boolean}
 */
function isValidRangeCall(calls) {
  const hasFirst = calls.hasOwnProperty('first');
  const hasLast = calls.hasOwnProperty('last');

  // Currently only supports: first(), after().first(), last(), before().last()
  // before().first(), after().last(), after().before().first(), and
  // after().before().last()
  // first() can never be called with last().
  return ((hasFirst || hasLast) && !(hasFirst && hasLast));
}

/**
 * Returns whether the call values are supported by GraphQLRange
 *
 * @param {object} calls
 * @return {boolean}
 */
function isValidRangeCallValues(calls) {
  return (calls.hasOwnProperty('first') && calls.first > 0) ||
         (calls.hasOwnProperty('last') && calls.last > 0);
}

/**
 * Validates edge to ensure it has all the fields needed to be store properly.
 *
 * @param {object} edge
 */
function validateEdge(edge) {
  invariant(
    RelayRecord.getDataIDForObject(edge) !== undefined,
    'GraphQLStore: `edge` must have a data id'
  );
  invariant(
    edge.node !== undefined,
    'GraphQLStore: `edge` must have `node` field'
  );
}

/**
 * @param {array<object>} edges
 */
function validateEdges(edges) {
  edges.forEach(validateEdge);
}

/**
 * @internal
 *
 * A range represents an ordered set of edges. Methods are provided for adding
 * edges (`appendEdge`, `prependEdge`, `addItems`) and removing them
 * (`removeEdgeWithID`).
 *
 * Within a range, each contiguous group of edges is modeled using a
 * `GraphQLSegment`, but this is an implementation detail that `GraphQLRange`
 * hides from its callers.
 *
 * Ranges model GraphQL connections, which are the means of traversing from a
 * node to a set of associated objects; for example, in the following query the
 * "friends" connection produces a range containing edges that lead to the
 * requested friend nodes:
 *
 *     node(4) {
 *       friends.first(2) {
 *         edges {
 *           node {
 *             id,
 *             name,
 *           },
 *         },
 *       },
 *     }
 *
 * @see `GraphQLSegment`
 * @see http://facebook.github.io/relay/docs/graphql-connections.html
 */
class GraphQLRange {
  constructor() {
    this.reset();
  }

  reset() {
    // List of segments where each segment is a continuous chunk.
    // There are gaps in between the segments. The first segment in the list
    // should be cursors beginning at the top of the range (i.e. first(N)).
    // The last segment in the list should be cursors at the bottom of
    // the range (i.e. last(N)).
    this._orderedSegments = [
      new GraphQLSegment(),
      new GraphQLSegment(),
    ];

    // GraphQLRange nodes can also support static queries like surrounds,
    // find, whose contents won't ever change for a given set of arguments.
    // Store these queries' results in this map, since you can't do first()
    // or last() queries on these ranges.
    this._staticQueriesMap = {};

    this._hasFirst = false;
    this._hasLast = false;
  }

  /**
   * @param {number} index
   */
  _resetSegment(index) {
    invariant(
      index >= 0 && index < this._orderedSegments.length,
      'cannot reset non-existent segment'
    );
    this._orderedSegments[index] = new GraphQLSegment();
  }

  /**
   * @param {string} cursor
   * @return {?number}
   */
  _getSegmentIndexByCursor(cursor) {
    let deletedIndex = null;
    // TODO: revisit if we end up having too many segments
    for (let ii = 0; ii < this._orderedSegments.length; ii++) {
      if (this._orderedSegments[ii].containsEdgeWithCursor(cursor)) {
        return ii;
      } else if (this._orderedSegments[ii].containsEdgeWithCursor(
        cursor,
        true
      )) {
        deletedIndex = ii;
      }
    }
    return deletedIndex;
  }

  /**
   * @param {string} id
   * @return {?number}
   */
  _getSegmentIndexByID(id) {
    // TODO: revisit if we end up having too many segments
    for (let ii = 0; ii < this._orderedSegments.length; ii++) {
      if (this._orderedSegments[ii].containsEdgeWithID(id)) {
        return ii;
      }
    }
    return null;
  }

  /**
   * Add edges' data into the static queries map for the query calls,
   * overwriting any previously existing data for these calls.
   * @param {array<object>} queryCalls
   * @param {array} edges
   */
  _addStaticEdges(queryCalls, edges) {
    const calls = _callsToString(queryCalls);
    const edgeIDsToStore = [];
    const cursorsToStore = [];

    for (let ii = 0; ii < edges.length; ii++) {
      const edge = edges[ii];
      edgeIDsToStore.push(RelayRecord.getDataIDForObject(edge));
      cursorsToStore.push(edge.cursor);
    }

    this._staticQueriesMap[calls] = {
      edgeIDs: edgeIDsToStore,
      cursors: cursorsToStore,
    };
  }

  /**
   * Add edges into the range based on the query calls. New edges will replace
   * previous edges in the range.
   * @param {array<object>} queryCalls
   * @param {array} edges
   * @param {object} pageInfo
   */
  addItems(queryCalls, edges, pageInfo) {
    validateEdges(edges);
    const calls = callsArrayToObject(queryCalls);
    let segmentCount, segmentIndex;

    if (isStaticCall(calls)) {
      this._addStaticEdges(queryCalls, edges);
      return;
    }

    if (!isValidRangeCall(calls)) {
      console.error(
        'GraphQLRange currently only handles first(<count>), ' +
        'after(<cursor>).first(<count>), last(<count>), ' +
        'before(<cursor>).last(<count>), before(<cursor>).first(<count>), ' +
        'and after(<cursor>).last(<count>)'
      );
      return;
    }

    // Skip the update if cursors are invalid
    if (calls.before === null || calls.after === null) {
      console.error(
        'GraphQLRange received null as a cursor.'
      );
      return;
    }

    if (calls.first) {
      // before().first() calls can produce gaps
      if (calls.before && !calls.after) {
        // make a new segment if there is a gap
        if (pageInfo[HAS_NEXT_PAGE] === true) {
          if (this._getSegmentIndexByCursor(calls.before) === 0) {
            this._orderedSegments.unshift(
              new GraphQLSegment()
            );
          }
          // When there is a gap from before().first() query, this is the same
          // as just storing a first().
          this._addAfterFirstItems(
            edges, pageInfo[HAS_NEXT_PAGE], undefined, calls.before
          );
        } else {
          // Since there is no gap, we can stitch into the beginning
          // of existing segment
          this._addBeforeLastItems(
            edges,
            pageInfo[HAS_PREV_PAGE],
            calls.before
          );
        }
      } else {
        // These elements are added from paging to extend the the range.
        if (!calls.after) {
          segmentIndex = 0;
          segmentCount = this.getFirstSegment().getCount();
          if (
            segmentCount &&
            (calls.first > segmentCount || edges.length > segmentCount) &&
            !this.getFirstSegment().getFirstCursor()
          ) {
            // this is a range for which we don't have a cursor, and we've
            // fetched more data by increasing the `first(N)` variable; we
            // blow away and replace the first segment in order to side-step
            // issues where the order of IDs in the range may change between
            // queries
            this._resetSegment(segmentIndex);
          }
        }
        this._addAfterFirstItems(
          edges, pageInfo[HAS_NEXT_PAGE], calls.after, calls.before
        );
      }
    } else if (calls.last) {
      // after().last() calls can produce gaps
      if (calls.after && !calls.before) {
        // make a new segment if there is a gap
        if (pageInfo[HAS_PREV_PAGE] === true) {
          if (this._getSegmentIndexByCursor(calls.after) ===
              this._orderedSegments.length - 1) {
            this._orderedSegments.push(new GraphQLSegment());
          }
          // When there is a gap from after().last() query, this is the same as
          // just storing a last().
          this._addBeforeLastItems(
            edges, pageInfo[HAS_PREV_PAGE], undefined, calls.after
          );
        } else {
          // Since there is no gap, we can stitch to the end
          // of existing segment
          this._addAfterFirstItems(
            edges,
            pageInfo[HAS_NEXT_PAGE],
            calls.after
          );
        }
      } else {
        // These elements are added from paging to extend the the range.
        if (!calls.before) {
          segmentIndex = this._orderedSegments.length - 1;
          segmentCount = this.getLastSegment().getCount();
          if (
            segmentCount &&
            (calls.last > segmentCount || edges.length > segmentCount) &&
            !this.getLastSegment().getLastCursor()
          ) {
            // this is a range for which we don't have a cursor, and we've
            // fetched more data by increasing the `last(N)` variable; we
            // blow away and replace the last segment in order to side-step
            // issues where the order of IDs in the range may change between
            // queries
            this._resetSegment(segmentIndex);
          }
        }
        this._addBeforeLastItems(
          edges, pageInfo[HAS_PREV_PAGE], calls.before, calls.after
        );
      }
    }
  }

  /**
   * @return {GraphQLSegment}
   */
  getFirstSegment() {
    return this._orderedSegments[0];
  }

  /**
   * @return {GraphQLSegment}
   */
  getLastSegment() {
    return this._orderedSegments[this._orderedSegments.length - 1];
  }

  /**
   * Tries to concat segments at segmentIndex and segmentIndex + 1.
   * This is an all or nothing operation.
   * If concat is successful, we'll remove the segment at segmentIndex + 1
   * from the orderedSegments after all elements has been added to the segment
   * at segmentIndex.
   * If concat is unsuccessful, nothing will be changed.
   * @param {number} segmentIndex
   */
  _concatSegments(segmentIndex) {
    invariant(
      (segmentIndex + 1) < this._orderedSegments.length &&
      segmentIndex >= 0,
      'GraphQLRange cannot concat segments outside the range ' +
      'of orderedSegments'
    );
    const firstSegment = this._orderedSegments[segmentIndex];
    const secondSegment = this._orderedSegments[segmentIndex + 1];
    if (firstSegment.concatSegment(secondSegment)) {
      this._orderedSegments.splice(segmentIndex + 1, 1);
    } else {
      console.warn(
        'GraphQLRange was unable to concat segment %d and segment %d',
        segmentIndex,
        segmentIndex + 1
      );
    }
  }

  /**
   * Adds the edge to the front of the range. New edge will replace previous
   * edge that have the same id.
   * @param {object} edge
   */
  prependEdge(edge) {
    validateEdge(edge);
    this._hasFirst = true;
    this._removeEdgeIfApplicable(edge);
    const segment = this.getFirstSegment();
    segment.prependEdge(edge);
  }

  /**
   * Adds the edge to the end of the range. New edge will replace previous
   * edge that have the same id.
   * @param {object} edge
   */
  appendEdge(edge) {
    validateEdge(edge);
    this._hasLast = true;
    this._removeEdgeIfApplicable(edge);
    const segment = this.getLastSegment();
    segment.appendEdge(edge);
  }

  /**
   * Removes edge in range if it matches id in input edge.
   * @param {object} edge
   */
  _removeEdgeIfApplicable(edge) {
    const id = RelayRecord.getDataIDForObject(edge);
    const index = this._getSegmentIndexByID(id);
    if (index != null) {
      this._orderedSegments[index].removeEdge(id);
    }
  }

  /**
   * Remove any edges in the range if it matches any of the ids in the input.
   * This function is used to prevent us from adding any id that already exist
   * in the range.
   *
   * @param {array} edges
   */
  _removeEdgesIfApplicable(edges) {
    for (let ii = 0; ii < edges.length; ii++) {
      this._removeEdgeIfApplicable(edges[ii]);
    }
  }

  /**
   * Add items into the correct segment with the cursor. If no cursor
   * is present, items are added to the very first segment.
   *
   * @param {array} edges
   * @param {boolean} hasNextPage
   * @param {?string} afterCursor
   * @param {?string} beforeCursor
   */
  _addAfterFirstItems(
    edges,
    hasNextPage,
    afterCursor,
    beforeCursor
  ) {
    let segment;
    let segmentIndex;
    let lastCursor;
    if (afterCursor !== undefined) {
      segmentIndex = this._getSegmentIndexByCursor(afterCursor);
      if (segmentIndex == null) {
        warning(
          false,
          'GraphQLRange cannot find a segment that has the cursor: %s',
          afterCursor
        );
        return;
      }
      segment = this._orderedSegments[segmentIndex];
      lastCursor = segment.getLastCursor();
      if (lastCursor !== afterCursor) {
        edges = this._reconcileAfterFirstEdges(segment, edges, afterCursor);
        afterCursor = lastCursor;
        if (!edges) {
          return;
        }
      }
    } else {
      segmentIndex = 0;
      segment = this._orderedSegments[segmentIndex];
      lastCursor = segment.getLastCursor();
      if (lastCursor !== undefined) {
        edges = this._reconcileAfterFirstEdges(segment, edges);
        afterCursor = lastCursor;
        if (!edges) {
          return;
        }
      }
    }
    if (beforeCursor !== undefined) {
      if (segmentIndex === this._orderedSegments.length - 1) {
        console.warn(
          'GraphQLRange cannot add because there is no next segment'
        );
        return;
      } else if (this._orderedSegments[segmentIndex + 1].getFirstCursor() !==
                 beforeCursor) {
        warning(
          false,
          'GraphQLRange cannot add because beforeCursor does not match first ' +
          'cursor of the next segment'
        );
        return;
      }
    }

    if (afterCursor === undefined) {
      this._hasFirst = true;
    }

    this._removeEdgesIfApplicable(edges);
    segment.addEdgesAfterCursor(edges, afterCursor);
    if (!hasNextPage) {
      if (beforeCursor !== undefined) {
        // If we have a beforeCursor and there is no next page,
        // then there is no gap between the current segment and the next.
        // We can concat the two segments when there is no gap.
        this._concatSegments(segmentIndex);
      } else {
        this._hasLast = true;
        // If this segment already has the last element, we don't
        // need any segments after this.
        this._orderedSegments.splice(
          segmentIndex + 1,
          this._orderedSegments.length - 1 - segmentIndex
        );
      }
    }
  }

  /**
   * In the case the cursor does not correspond last cursor,
   * walk through the edges to see if we can trim edges to
   * only those after the last cursor. Returns undefined when
   * the input cannot be reconciled.
   *
   * @param {GraphQLSegment} segment
   * @param {array} edges
   * @param {?string} cursor
   * @return {?array} trimmed edges
   */
  _reconcileAfterFirstEdges(segment, edges, cursor) {
    const metadata = segment.getMetadataAfterCursor(edges.length + 1, cursor);
    const edgeIDs = metadata.edgeIDs;
    if (edgeIDs.length > edges.length) {
      // Already have more edges than the input.
      return undefined;
    }

    for (let ii = 0; ii < edgeIDs.length; ii++) {
      if (edgeIDs[ii] !== RelayRecord.getDataIDForObject(edges[ii])) {
        warning(
          false,
          'Relay was unable to reconcile edges on a connection. This most ' +
          'likely occurred while trying to handle a server response that ' +
          'includes connection edges with nodes that lack an `id` field.'
        );
        return undefined;
      }
    }
    return edges.slice(edgeIDs.length);
  }

  /**
   * Add items into the correct segment with the cursor. If no cursor
   * is present, items are added to the very last segment.
   * @param {array} edges
   * @param {boolean} hasPrevPage
   * @param {?string} beforeCursor
   * @param {?string} afterCursor
   */
  _addBeforeLastItems(
    edges,
    hasPrevPage,
    beforeCursor,
    afterCursor
  ) {
    let segment;
    let segmentIndex;
    let firstCursor;
    if (beforeCursor !== undefined) {
      segmentIndex = this._getSegmentIndexByCursor(beforeCursor);
      if (segmentIndex == null) {
        warning(
          false,
          'GraphQLRange cannot find a segment that has the cursor: %s',
          beforeCursor
        );
        return;
      }
      segment = this._orderedSegments[segmentIndex];
      firstCursor = segment.getFirstCursor();
      if (firstCursor !== beforeCursor) {
        edges = this._reconcileBeforeLastEdges(segment, edges, beforeCursor);
        beforeCursor = firstCursor;
        if (!edges) {
          return;
        }
      }
    } else {
      segmentIndex = this._orderedSegments.length - 1;
      segment = this._orderedSegments[segmentIndex];
      firstCursor = segment.getFirstCursor();
      if (firstCursor !== undefined) {
        edges = this._reconcileBeforeLastEdges(segment, edges, beforeCursor);
        beforeCursor = firstCursor;
        if (!edges) {
          return;
        }
      }
    }

    if (afterCursor !== undefined) {
      if (segmentIndex === 0) {
        console.warn(
          'GraphQLRange cannot add because there is no previous segment'
        );
        return;
      } else if (this._orderedSegments[segmentIndex - 1].getLastCursor() !==
                 afterCursor) {
        warning(
          false,
          'GraphQLRange cannot add because afterCursor does not match last ' +
          'cursor of the previous segment'
        );
        return;
      }
    }

    if (beforeCursor === undefined) {
      this._hasLast = true;
    }

    this._removeEdgesIfApplicable(edges);
    segment.addEdgesBeforeCursor(edges, beforeCursor);
    if (!hasPrevPage) {
      if (afterCursor !== undefined) {
        // If we have an afterCursor and there is no previous page,
        // then there is no gap between the current segment and the previous.
        // We can concat the two segments when there is no gap.
        this._concatSegments(segmentIndex - 1);
      } else {
        this._hasFirst = true;
        // If this segment already has the first element, we don't
        // need any segments before this.
        this._orderedSegments.splice(0, segmentIndex);
      }
    }
  }

  /**
   * In the case the cursor does not correspond first cursor,
   * walk through the edges to see if we can trim edges to
   * only those before the first cursor. Returns undefined when
   * the input cannot be reconciled.
   *
   * @param {GraphQLSegment} segment
   * @param {array} edges
   * @param {?string} cursor
   * @return {?array} trimmed edges
   */
  _reconcileBeforeLastEdges(segment, edges, cursor) {
    const metadata = segment.getMetadataBeforeCursor(edges.length + 1, cursor);
    const edgeIDs = metadata.edgeIDs;
    if (edgeIDs.length > edges.length) {
      // Already have more edges than the input.
      return undefined;
    }

    for (let ii = 1; ii <= edgeIDs.length; ii++) {
      if (edgeIDs[edgeIDs.length - ii] !==
          RelayRecord.getDataIDForObject(edges[edges.length - ii])) {
        warning(
          false,
          'Relay was unable to reconcile edges on a connection. This most ' +
          'likely occurred while trying to handle a server response that ' +
          'includes connection edges with nodes that lack an `id` field.'
        );
        return undefined;
      }
    }
    return edges.slice(0, edges.length - edgeIDs.length);
  }

  /**
   * Removes an edge from this range such that the edge will never be reachable
   * regardless of the client session. This is used by delete mutations.
   *
   * @param {string} id
   */
  removeEdgeWithID(id) {
    for (let ii = 0; ii < this._orderedSegments.length; ii++) {
      this._orderedSegments[ii].removeAllEdges(id);
    }
  }

  /**
   * @param {array<object>} queryCalls
   * @param {?object} queuedRecord
   * @return {object} includes fields: requestedEdgeIDs, diffCalls
   */
  retrieveRangeInfoForQuery(queryCalls, queuedRecord) {
    const calls = callsArrayToObject(queryCalls);

    if (isStaticCall(calls)) {
      return this._retrieveRangeInfoForStaticCalls(
        queryCalls,
      );
    }

    // Convert to name => true, so we can test for whether the key exists
    // without comparing to undefined
    if (!isValidRangeCall(calls)) {
      console.error(
        'GraphQLRange currently only handles first(<count>), ' +
        'after(<cursor>).first(<count>), last(<count>), ' +
        'before(<cursor>).last(<count>), before(<cursor>).first(<count>), ' +
        'and after(<cursor>).last(<count>)'
      );
      return {
        requestedEdgeIDs: [],
        diffCalls: [],
        pageInfo: RelayConnectionInterface.getDefaultPageInfo(),
      };
    }
    if ((calls.first && calls.before) || (calls.last && calls.after)) {
      // TODO #7556678: add support for first/before and last/after
      return {
        requestedEdgeIDs: [],
        diffCalls: [],
        pageInfo: RelayConnectionInterface.getDefaultPageInfo(),
      };
    }
    if (!isValidRangeCallValues(calls)) {
      console.error(
        'GraphQLRange only supports first(<count>) or last(<count>) ' +
        'where count is greater than 0'
      );
      return {
        requestedEdgeIDs: [],
        diffCalls: [],
        pageInfo: RelayConnectionInterface.getDefaultPageInfo(),
      };
    }
    if (calls.first) {
      return this._retrieveRangeInfoForFirstQuery(
        queryCalls,
        queuedRecord
      );
    } else if (calls.last) {
      return this._retrieveRangeInfoForLastQuery(
        queryCalls,
        queuedRecord
      );
    }
  }

  /**
   * @param {array<object>} queryCalls
   * @return {object} includes fields: requestedEdgeIDs, diffCalls
   */
  _retrieveRangeInfoForStaticCalls(queryCalls) {
    const calls = _callsToString(queryCalls);
    const storedInfo = this._staticQueriesMap[calls];

    if (storedInfo) {
      return {
        requestedEdgeIDs: storedInfo.edgeIDs,
        diffCalls: [],
        pageInfo: {
          [START_CURSOR]: storedInfo.cursors[0],
          [END_CURSOR]: storedInfo.cursors[storedInfo.cursors.length - 1],
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: true,
        },
      };
    }

    // if we don't have the data for this static call already,
    // return empty arrays with the corresponding diffCalls
    return {
      requestedEdgeIDs: [],
      diffCalls: queryCalls,
      pageInfo: RelayConnectionInterface.getDefaultPageInfo(),
    };
  }

  /**
   * @param {object} queuedRecord
   * @return {?array<string>}
   */
  _getAppendedIDsForQueuedRecord(queuedRecord) {
    return queuedRecord[
      rangeOperationToMetadataKey[GraphQLMutatorConstants.APPEND]
    ];
  }

  /**
   * @param {object} queuedRecord
   * @return {?array<string>}
   */
  _getRemovedIDsForQueuedRecord(queuedRecord) {
    return queuedRecord[
      rangeOperationToMetadataKey[GraphQLMutatorConstants.REMOVE]
    ];
  }

  /**
   * @param {object} queuedRecord
   * @return {?array<string>}
   */
  _getPrependedIDsForQueuedRecord(queuedRecord) {
    return queuedRecord[
      rangeOperationToMetadataKey[GraphQLMutatorConstants.PREPEND]
    ];
  }

  /**
   * @param {array<object>} queryCalls
   * @param {?object} queuedRecord
   * @return {object} includes fields: requestedEdgeIDs, diffCalls
   */
  _retrieveRangeInfoForFirstQuery(
    queryCalls,
    queuedRecord
  ) {
    let appendEdgeIDs;
    let prependEdgeIDs;
    let removeIDs;
    if (queuedRecord) {
      appendEdgeIDs = this._getAppendedIDsForQueuedRecord(queuedRecord);
      prependEdgeIDs = this._getPrependedIDsForQueuedRecord(queuedRecord);
      removeIDs = this._getRemovedIDsForQueuedRecord(queuedRecord);
    }
    const calls = callsArrayToObject(queryCalls);
    let countNeeded = calls.first + (removeIDs ? removeIDs.length : 0);
    let segment;
    let segmentIndex;
    const pageInfo = {
      ...RelayConnectionInterface.getDefaultPageInfo(),
    };

    const afterCursor = calls.after;
    if (afterCursor !== undefined) {
      segmentIndex = this._getSegmentIndexByCursor(afterCursor);
      if (segmentIndex == null) {
        console.warn(
          'GraphQLRange cannot find a segment that has the cursor: ' +
          afterCursor
        );
        return {
          requestedEdgeIDs: [],
          diffCalls: [],
          pageInfo: pageInfo,
        };
      }
      segment = this._orderedSegments[segmentIndex];
    } else {
      const prependEdgesCount = prependEdgeIDs ? prependEdgeIDs.length : 0;
      countNeeded -= prependEdgesCount;

      segmentIndex = 0;
      segment = this._orderedSegments[segmentIndex];
    }

    const requestedMetadata =
      segment.getMetadataAfterCursor(countNeeded, afterCursor);
    let requestedEdgeIDs = requestedMetadata.edgeIDs;
    const requestedCursors = requestedMetadata.cursors;
    const diffCalls = [];
    if (requestedCursors.length) {
      pageInfo[START_CURSOR] = requestedCursors[0];
      pageInfo[END_CURSOR] = requestedCursors[requestedCursors.length - 1];
    }
    const lastID = requestedEdgeIDs[requestedEdgeIDs.length - 1];
    // Only requested segment that does not include very last item from
    // the range can have next page and diff calls
    if (!this._hasLast ||
        segmentIndex !== this._orderedSegments.length - 1 ||
        (lastID && lastID !== segment.getLastID())) {
      pageInfo[HAS_NEXT_PAGE] = true;
      if (requestedEdgeIDs.length < countNeeded) {
        countNeeded -= requestedEdgeIDs.length;
        const lastCursor = segment.getLastCursor();
        // If segment has null cursors, retrieve whole range.
        if (lastCursor === null) {
          diffCalls.push({name: 'first', value: calls.first});
        } else {
          if (lastCursor !== undefined) {
            diffCalls.push({name: 'after', value: lastCursor});
          }
          // If this is not the last segment, we should not request edges
          // that would overlap the first element of the next segment.
          if (segmentIndex !== this._orderedSegments.length - 1) {
            const nextSegment = this._orderedSegments[segmentIndex + 1];
            const firstCursor = nextSegment.getFirstCursor();
            if (firstCursor !== undefined) {
              diffCalls.push({name: 'before', value: firstCursor});
            }
          }
          diffCalls.push({name: 'first', value: countNeeded});
        }
      }
    }

    if (queuedRecord) {
      if (prependEdgeIDs && prependEdgeIDs.length && !calls.after) {
        requestedEdgeIDs = prependEdgeIDs.concat(requestedEdgeIDs);
      }
      if (appendEdgeIDs && appendEdgeIDs.length && !pageInfo[HAS_NEXT_PAGE]) {
        requestedEdgeIDs = requestedEdgeIDs.concat(appendEdgeIDs);
      }
      if (removeIDs && removeIDs.length) {
        requestedEdgeIDs = requestedEdgeIDs.filter(function(edgeID) {
          return (removeIDs.indexOf(edgeID) === -1);
        });
      }
      if (requestedEdgeIDs.length > calls.first) {
        requestedEdgeIDs = requestedEdgeIDs.slice(0, calls.first);
      }
    }

    return {
      requestedEdgeIDs: requestedEdgeIDs,
      diffCalls: diffCalls,
      pageInfo: pageInfo,
    };
  }

  /**
   * @param {array<object>} queryCalls
   * @param {?object} queuedRecord
   * @return {object} includes fields: requestedEdgeIDs, diffCalls
   */
  _retrieveRangeInfoForLastQuery(
    queryCalls,
    queuedRecord
  ) {
    let appendEdgeIDs;
    let prependEdgeIDs;
    let removeIDs;
    if (queuedRecord) {
      appendEdgeIDs = this._getAppendedIDsForQueuedRecord(queuedRecord);
      prependEdgeIDs = this._getPrependedIDsForQueuedRecord(queuedRecord);
      removeIDs = this._getRemovedIDsForQueuedRecord(queuedRecord);
    }
    const calls = callsArrayToObject(queryCalls);
    let countNeeded = calls.last + (removeIDs ? removeIDs.length : 0);
    let segment;
    let segmentIndex;
    const pageInfo = {
      ...RelayConnectionInterface.getDefaultPageInfo(),
    };

    const beforeCursor = calls.before;
    if (beforeCursor !== undefined) {
      segmentIndex = this._getSegmentIndexByCursor(beforeCursor);
      if (segmentIndex == null) {
        console.warn(
          'GraphQLRange cannot find a segment that has the cursor: ' +
          beforeCursor
        );
        return {
          requestedEdgeIDs: [],
          diffCalls: [],
          pageInfo: pageInfo,
        };
      }
      segment = this._orderedSegments[segmentIndex];
    } else {
      const appendEdgesCount = appendEdgeIDs ? appendEdgeIDs.length : 0;
      countNeeded -= appendEdgesCount;

      segmentIndex = this._orderedSegments.length - 1;
      segment = this._orderedSegments[segmentIndex];
    }

    const requestedMetadata =
      segment.getMetadataBeforeCursor(countNeeded, beforeCursor);
    let requestedEdgeIDs = requestedMetadata.edgeIDs;
    const requestedCursors = requestedMetadata.cursors;
    const diffCalls = [];
    if (requestedCursors.length) {
      pageInfo[START_CURSOR] = requestedCursors[0];
      pageInfo[END_CURSOR] = requestedCursors[requestedCursors.length - 1];
    }
    const firstID = requestedEdgeIDs[0];
    // Only requested segment that does not include very first item from
    // the range can have next page and diff calls
    if (!this._hasFirst ||
        segmentIndex !== 0 ||
        (firstID && firstID !== segment.getFirstID())) {
      pageInfo[HAS_PREV_PAGE] = true;
      if (requestedEdgeIDs.length < countNeeded) {
        countNeeded -= requestedEdgeIDs.length;
        const firstCursor = segment.getFirstCursor();
        // If segment has null cursors, retrieve whole range.
        if (firstCursor === null) {
          diffCalls.push({name: 'last', value: calls.last});
        } else {
          if (firstCursor !== undefined) {
            diffCalls.push({name: 'before', value: firstCursor});
          }
          // If this is not the first segment, we should not request edges
          // that would overlap the last element of the previous segment.
          if (segmentIndex !== 0) {
            const prevSegment = this._orderedSegments[segmentIndex - 1];
            const lastCursor = prevSegment.getLastCursor();
            if (lastCursor !== undefined) {
              diffCalls.push({name: 'after', value: lastCursor});
            }
          }
          diffCalls.push({name: 'last', value: countNeeded});
        }
      }
    }

    if (queuedRecord) {
      if (appendEdgeIDs && appendEdgeIDs.length && !calls.before) {
        requestedEdgeIDs = requestedEdgeIDs.concat(appendEdgeIDs);
      }
      if (prependEdgeIDs && prependEdgeIDs.length && !pageInfo[HAS_PREV_PAGE]) {
        requestedEdgeIDs = prependEdgeIDs.concat(requestedEdgeIDs);
      }
      if (removeIDs && removeIDs.length) {
        requestedEdgeIDs = requestedEdgeIDs.filter(function(edgeID) {
          return (removeIDs.indexOf(edgeID) === -1);
        });
      }
      if (requestedEdgeIDs.length > calls.last) {
        const length = requestedEdgeIDs.length;
        requestedEdgeIDs = requestedEdgeIDs.slice(length - calls.last, length);
      }
    }

    return {
      requestedEdgeIDs: requestedEdgeIDs,
      diffCalls: diffCalls,
      pageInfo: pageInfo,
    };
  }

  static fromJSON(descriptor) {
    const [
      hasFirst,
      hasLast,
      staticQueriesMap,
      orderedSegments,
    ] = descriptor;
    const range = new GraphQLRange();
    range._hasFirst = hasFirst;
    range._hasLast = hasLast;
    range._staticQueriesMap = staticQueriesMap;
    range._orderedSegments = orderedSegments.map(
      segmentDescriptor => GraphQLSegment.fromJSON(segmentDescriptor)
    );
    return range;
  }

  toJSON() {
    return [
      this._hasFirst,
      this._hasLast,
      this._staticQueriesMap,
      this._orderedSegments,
    ];
  }

  __debug() {
    return {
      orderedSegments: this._orderedSegments,
    };
  }

  getEdgeIDs() {
    const edgeIDs = [];
    this._orderedSegments.forEach(segment => {
      edgeIDs.push(...segment.getEdgeIDs());
    });
    forEachObject(this._staticQueriesMap, (query) => {
      edgeIDs.push(...query.edgeIDs);
    });
    return edgeIDs;
  }

  getSegmentedEdgeIDs() {
    return this._orderedSegments.map(segment => segment.getEdgeIDs());
  }
}

/**
 * @param {array<object>} calls
 * @return {string}
 */
function _callsToString(calls) {
  return calls.map(
    call => serializeRelayQueryCall(call).substring(1)
  ).join(',');
}

module.exports = GraphQLRange;

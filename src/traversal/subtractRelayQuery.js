/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule subtractRelayQuery
 * @flow
 * @typechecks
 */

'use strict';

var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');
var RelayQueryTransform = require('RelayQueryTransform');

var areEqual = require('areEqual');
var invariant = require('invariant');

type SubtractState = {
  isEmpty: boolean;
  subtrahend: RelayQuery.Node;
};

/**
 * @internal
 *
 * `subtractRelayQuery(minuend, subtrahend)` returns a new query
 * that matches the structure of `minuend`, minus any fields which also
 * occur in `subtrahend`. Returns null if all fields can be subtracted,
 * `minuend` if no fields can be subtracted, and a new query otherwise.
 */
function subtractRelayQuery(
  minuend: RelayQuery.Root,
  subtrahend: RelayQuery.Root
): ?RelayQuery.Root {
  var visitor = new RelayQuerySubtractor();
  var state = {
    isEmpty: true,
    subtrahend,
  };
  var diff = visitor.visit(minuend, state);
  if (!state.isEmpty) {
    invariant(
      diff instanceof RelayQuery.Root,
      'subtractRelayQuery(): Expected a subtracted query root.'
    );
    return diff;
  }
  return null;
}

class RelayQuerySubtractor extends RelayQueryTransform<SubtractState> {
  visitRoot(
    node: RelayQuery.Root,
    state: SubtractState
  ): ?RelayQuery.Node {
    var {subtrahend} = state;
    invariant(
      subtrahend instanceof RelayQuery.Root,
      'subtractRelayQuery(): Cannot subtract a non-root node from a root.'
    );
    if (!canSubtractRoot(node, subtrahend)) {
      state.isEmpty = false;
      return node;
    }
    return this._subtractChildren(node, state);
  }

  visitFragment(
    node: RelayQuery.Fragment,
    state: SubtractState
  ): ?RelayQuery.Node {
    return this._subtractChildren(node, state);
  }

  visitField(
    node: RelayQuery.Field,
    state: SubtractState
  ): ?RelayQuery.Node {
    var diff;
    if (node.isScalar()) {
      diff = this._subtractScalar(node, state);
    } else if (node.isConnection()) {
      diff = this._subtractConnection(node, state);
    } else {
      diff = this._subtractField(node, state);
    }
    if (diff && (diff.isRequisite() || !state.isEmpty)) {
      return diff;
    }
    return null;
  }

  _subtractScalar(
    node: RelayQuery.Field,
    state: SubtractState
  ): ?RelayQuery.Node {
    var subField = state.subtrahend.getField(node);

    if (subField && !node.isRequisite()) {
      return null;
    }
    state.isEmpty = isEmptyField(node);
    return node;
  }

  _subtractConnection(
    node: RelayQuery.Field,
    state: SubtractState
  ): ?RelayQuery.Node {
    var subtrahendRanges = getMatchingRangeFields(node, state.subtrahend);

    if (!subtrahendRanges.length) {
      state.isEmpty = isEmptyField(node);
      return node;
    }

    var diff = node;
    var fieldState;
    for (var ii = 0; ii < subtrahendRanges.length; ii++) {
      fieldState = {
        isEmpty: true,
        subtrahend: subtrahendRanges[ii],
      };
      diff = this._subtractChildren(diff, fieldState);
      state.isEmpty = fieldState.isEmpty;
      if (!diff) {
        break;
      }
    }
    return diff;
  }

  /**
   * Subtract a non-scalar/range field.
   */
  _subtractField(
    node: RelayQuery.Field,
    state: SubtractState
  ): ?RelayQuery.Node {
    var subField = state.subtrahend.getField(node);

    if (!subField) {
      state.isEmpty = isEmptyField(node);
      return node;
    }

    var fieldState = {
      isEmpty: true,
      subtrahend: subField,
    };
    var diff = this._subtractChildren(node, fieldState);
    state.isEmpty = fieldState.isEmpty;
    return diff;
  }

  /**
   * Subtracts any RelayQuery.Node that contains subfields.
   */
  _subtractChildren(
    node: RelayQuery.Node,
    state: SubtractState
  ): ?RelayQuery.Node {
    return node.clone(node.getChildren().map(child => {
      var childState = {
        isEmpty: true,
        subtrahend: state.subtrahend
      };
      var diff = this.visit(child, childState);
      state.isEmpty = state.isEmpty && childState.isEmpty;
      return diff;
    }));
  }
}

/**
 * Determine if the subtree is effectively 'empty'; all non-metadata sub-fields
 * have been removed.
 */
function isEmptyField(
  node: RelayQuery.Node
): boolean {
  if (node instanceof RelayQuery.Field && node.isScalar()) {
    // Note: product-specific hacks use aliased cursors/ids to poll for data.
    // Without the alias check these queries would be considered empty.
    return (
      node.isRequisite() &&
      !node.isRefQueryDependency() &&
      node.getApplicationName() === node.getSchemaName()
    );
  } else {
    return node.getChildren().every(isEmptyField);
  }
}

/**
 * Determine if the two queries have the same root field and identifying arg.
 */
function canSubtractRoot(
  min: RelayQuery.Root,
  sub: RelayQuery.Root
): boolean {
  var minIdentifyingCall = min.getIdentifyingArg();
  var subIdentifyingCall = sub.getIdentifyingArg();
  return (
    min.getFieldName() === sub.getFieldName() &&
    areEqual(minIdentifyingCall, subIdentifyingCall)
  );
}

/**
 * Find all subfields that may overlap with the range rooted at `node`.
 */
function getMatchingRangeFields(
  node: RelayQuery.Field,
  subtrahend: RelayQuery.Node
): Array<RelayQuery.Node> {
  return subtrahend.getChildren().filter(
    child => child instanceof RelayQuery.Field && canSubtractField(node, child)
  );
}

/**
 * Determine if `minField` is a subset of the range specified by `subField`
 * such that they can be subtracted.
 */
function canSubtractField(
  minField: RelayQuery.Field,
  subField: RelayQuery.Field
): boolean {
  if (minField.getSchemaName() !== subField.getSchemaName()) {
    return false;
  }
  var minArgs = minField.getCallsWithValues();
  var subArgs = subField.getCallsWithValues();
  if (minArgs.length !== subArgs.length) {
    return false;
  }
  return minArgs.every((minArg, ii) => {
    var subArg = subArgs[ii];
    if (subArg == null) {
      return false;
    }
    if (minArg.name !== subArg.name) {
      return false;
    }
    if (minArg.name === 'first' || minArg.name === 'last') {
      /* $FlowFixMe(>=0.13.0)
       *
       * subArg and minArg are of type 'Call' (defined in RelayQueryField) which
       * specifies that its 'value' property is nullable. This code assumes that
       * it is not, however, and Flow points out that it may produce
       * `parseInt('undefined')`.
       */
      return parseInt('' + minArg.value, 10) <= parseInt('' + subArg.value, 10);
    }
    return areEqual(minArg.value, subArg.value);
  });
}

module.exports = RelayProfiler.instrument(
  'subtractRelayQuery',
  subtractRelayQuery
);

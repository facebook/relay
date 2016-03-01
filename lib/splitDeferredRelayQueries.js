/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule splitDeferredRelayQueries
 * 
 * @typechecks
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var QueryBuilder = require('./QueryBuilder');
var RelayNodeInterface = require('./RelayNodeInterface');
var RelayProfiler = require('./RelayProfiler');
var RelayQuery = require('./RelayQuery');
var RelayQueryTransform = require('./RelayQueryTransform');
var RelayRefQueryDescriptor = require('./RelayRefQueryDescriptor');

var invariant = require('fbjs/lib/invariant');

/**
 * Traverse `node` splitting off deferred query fragments into separate queries.
 *
 * @internal
 */
function splitDeferredRelayQueries(node) {
  var splitter = new GraphQLSplitDeferredQueries();
  var splitQueries = {
    __nodePath__: [],
    __parent__: null,
    __refQuery__: null,
    deferred: [],
    required: null
  };
  splitter.visit(node, splitQueries);

  return buildQueries(splitQueries);
}

/**
 * Returns the requisite siblings of `node`, but filters any non-requisite
 * children of those siblings.
 */
function getRequisiteSiblings(node, parent) {
  // Get the requisite siblings.
  var siblings = parent.getChildren().filter(function (child) {
    return child !== node && child instanceof RelayQuery.Field && child.isRequisite();
  });

  // Filter the non-requisite children from those siblings.
  return siblings.map(function (sibling) {
    var children = sibling.getChildren().filter(function (child) {
      return child instanceof RelayQuery.Field && child.isRequisite();
    });
    var clone = sibling.clone(children);
    !clone ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Unexpected non-scalar, requisite field.') : invariant(false) : undefined;
    return clone;
  });
}

/**
 * Traverse the parent chain of `node` wrapping it at each level until it is
 * either:
 *
 * - wrapped in a RelayQuery.Root node
 * - wrapped in a non-root node that can be split off in a "ref query" (ie. a
 *   root call with a ref param that references another query)
 *
 * Additionally ensures that any requisite sibling fields are embedded in each
 * layer of the wrapper.
 */
function wrapNode(node, nodePath) {
  for (var ii = nodePath.length - 1; ii >= 0; ii--) {
    var _parent = nodePath[ii];
    if (_parent instanceof RelayQuery.Field && _parent.getInferredRootCallName()) {
      // We can make a "ref query" at this point, so stop wrapping.
      return new RelayRefQueryDescriptor(node, nodePath.slice(0, ii + 1));
    }

    var siblings = getRequisiteSiblings(node, _parent);
    var children = [node].concat(siblings);

    // Cast here because we know that `clone` will never return `null` (because
    // we always give it at least one child).
    node = _parent.clone(children);
  }
  !(node instanceof RelayQuery.Root) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Cannot build query without a root node.') : invariant(false) : undefined;
  var identifyingArg = node.getIdentifyingArg();
  var identifyingArgName = identifyingArg && identifyingArg.name || null;
  var identifyingArgValue = identifyingArg && identifyingArg.value || null;
  var metadata = {
    identifyingArgName: identifyingArgName,
    identifyingArgType: RelayNodeInterface.ID_TYPE,
    isAbstract: true,
    isDeferred: true,
    isPlural: false
  };
  return RelayQuery.Root.build(node.getName(), node.getFieldName(), identifyingArgValue, node.getChildren(), metadata, node.getType());
}

/**
 * Returns `true` if `node` is considered "empty", which means that it contains
 * no non-generated fields, and no ref query dependencies.
 */
function isEmpty(node) {
  if (!node.canHaveSubselections()) {
    return node.isGenerated() && !node.isRefQueryDependency();
  } else {
    return node.getChildren().every(isEmpty);
  }
}

/**
 * Mutates and returns a nested `SplitQueries` structure, updating any deferred
 * "ref queries" to actually reference their contexts.
 */
function buildQueries(splitQueries) {
  if (splitQueries.required && isEmpty(splitQueries.required)) {
    splitQueries.required = null;
  }
  splitQueries.deferred = splitQueries.deferred.map(function (nestedSplitQueries) {
    var descriptor = nestedSplitQueries.__refQuery__;
    if (descriptor) {
      // Wrap the ref query node with a reference to the required query that is
      // its context.
      var context = splitQueries.required;
      if (!context) {
        // Traverse upwards looking for context.
        var parentSplitQueries = splitQueries;
        while (parentSplitQueries.__parent__) {
          context = parentSplitQueries.__parent__.required;
          if (context) {
            break;
          }
          parentSplitQueries = parentSplitQueries.__parent__;
        }
      }
      !context ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Expected a context root query.') : invariant(false) : undefined;
      nestedSplitQueries.required = createRefQuery(descriptor, context);
    }

    return buildQueries(nestedSplitQueries);
  });
  return splitQueries;
}

/**
 * Wraps `descriptor` in a new top-level ref query.
 */
function createRefQuery(descriptor, context) {
  var node = descriptor.node;
  !(node instanceof RelayQuery.Field || node instanceof RelayQuery.Fragment) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Ref query requires a field or fragment.') : invariant(false) : undefined;

  // Build up JSONPath.
  var jsonPath = ['$', '*'];
  var parent = undefined;
  for (var ii = 0; ii < descriptor.nodePath.length; ii++) {
    parent = descriptor.nodePath[ii];
    if (parent instanceof RelayQuery.Field) {
      jsonPath.push(parent.getSerializationKey());
      if (parent.isPlural()) {
        jsonPath.push('*');
      }
    }
  }
  !(jsonPath.length > 2) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Ref query requires a complete path.') : invariant(false) : undefined;
  var field = parent; // Flow
  var primaryKey = field.getInferredPrimaryKey();
  !primaryKey ? process.env.NODE_ENV !== 'production' ? invariant(false, 'splitDeferredRelayQueries(): Ref query requires a primary key.') : invariant(false) : undefined;
  jsonPath.push(primaryKey);

  // Create the wrapper root query.
  var root = RelayQuery.Root.build(context.getName(), RelayNodeInterface.NODES, QueryBuilder.createBatchCallVariable(context.getID(), jsonPath.join('.')), [node], {
    identifyingArgName: RelayNodeInterface.ID,
    identifyingArgType: RelayNodeInterface.ID_TYPE,
    isAbstract: true,
    isDeferred: true,
    isPlural: false
  }, RelayNodeInterface.NODE_TYPE);

  var result = root; // Flow
  return result;
}

/**
 * Traverses an input query, updating the passed in `SplitQueries` state object
 * to contain a nested structure representing the required and deferred portions
 * of the input query.
 */

var GraphQLSplitDeferredQueries = (function (_RelayQueryTransform) {
  _inherits(GraphQLSplitDeferredQueries, _RelayQueryTransform);

  function GraphQLSplitDeferredQueries() {
    _classCallCheck(this, GraphQLSplitDeferredQueries);

    _RelayQueryTransform.apply(this, arguments);
  }

  GraphQLSplitDeferredQueries.prototype.visitField = function visitField(node, splitQueries) {
    if (!node.hasDeferredDescendant()) {
      return node;
    }

    splitQueries.__nodePath__.push(node);
    var result = this.traverse(node, splitQueries);
    splitQueries.__nodePath__.pop();

    if (result && node.getInferredRootCallName()) {
      (function () {
        // The node is a ref query dependency; mark it as one.
        var key = node.getInferredPrimaryKey();
        var children = result.getChildren().map(function (child) {
          if (child instanceof RelayQuery.Field && child.getSchemaName() === key) {
            return child.cloneAsRefQueryDependency();
          } else {
            return child;
          }
        });
        result = result.clone(children);
      })();
    }

    return result;
  };

  GraphQLSplitDeferredQueries.prototype.visitFragment = function visitFragment(node, splitQueries) {
    if (!node.getChildren().length) {
      return null;
    }

    if (node.isDeferred()) {
      var nodePath = splitQueries.__nodePath__;
      var _deferred = {
        __nodePath__: nodePath,
        __parent__: splitQueries,
        __refQuery__: null,
        deferred: [],
        required: null
      };
      var result = this.traverse(node, _deferred);
      if (result) {
        var wrapped = wrapNode(result, nodePath);
        if (wrapped instanceof RelayQuery.Root) {
          _deferred.required = wrapped;
        } else if (wrapped instanceof RelayRefQueryDescriptor) {
          // for Flow
          _deferred.__refQuery__ = wrapped;
        }
      }
      if (result || _deferred.deferred.length) {
        splitQueries.deferred.push(_deferred);
      }
      return null;
    } else if (node.hasDeferredDescendant()) {
      return this.traverse(node, splitQueries);
    } else {
      return node;
    }
  };

  GraphQLSplitDeferredQueries.prototype.visitRoot = function visitRoot(node, splitQueries) {
    if (!node.hasDeferredDescendant()) {
      splitQueries.required = node;
      return node;
    } else {
      splitQueries.__nodePath__.push(node);
      var result = this.traverse(node, splitQueries);
      splitQueries.__nodePath__.pop();
      splitQueries.required = result;
      return result;
    }
  };

  return GraphQLSplitDeferredQueries;
})(RelayQueryTransform);

module.exports = RelayProfiler.instrument('splitDeferredRelayQueries', splitDeferredRelayQueries);
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule splitDeferredRelayQueries
 * @flow
 * @typechecks
 */

'use strict';

var GraphQL = require('GraphQL');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');
var RelayQueryTransform = require('RelayQueryTransform');
var RelayRefQueryDescriptor = require('RelayRefQueryDescriptor');
import type {NodePath} from 'RelayRefQueryDescriptor';

var invariant = require('invariant');

export type SplitQueries = {
  __parent__: ?SplitQueries;
  __path__: NodePath;
  __refQuery__: ?RelayRefQueryDescriptor;
  deferred: Array<SplitQueries>;
  required: ?RelayQuery.Root;
};

/**
 * Traverse `node` splitting off deferred query fragments into separate queries.
 *
 * @internal
 */
function splitDeferredRelayQueries(node: RelayQuery.Root): SplitQueries {
  var splitter = new GraphQLSplitDeferredQueries();
  var splitQueries = {
    __parent__: null,
    __path__: [],
    __refQuery__: null,
    deferred: [],
    required: null,
  };
  splitter.visit(node, splitQueries);

  return buildQueries(splitQueries);
}

/**
 * Returns the requisite siblings of `node`, but filters any non-requisite
 * children of those siblings.
 */
function getRequisiteSiblings(
  node: RelayQuery.Node,
  parent: RelayQuery.Node
): Array<RelayQuery.Node> {
  // Get the requisite siblings.
  var siblings = parent.getChildren().filter(child => (
    child !== node &&
    child instanceof RelayQuery.Field &&
    child.isRequisite()
  ));

  // Filter the non-requisite children from those siblings.
  return siblings.map(sibling => {
    var children = sibling.getChildren().filter(child => (
      child instanceof RelayQuery.Field &&
      child.isRequisite()
    ));
    var clone = sibling.clone(children);
    invariant(
      clone,
      'splitDeferredRelayQueries(): Unexpected non-scalar, requisite field.'
    );
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
function wrapNode(
  node: RelayQuery.Node,
  path: NodePath
): (RelayQuery.Node | RelayRefQueryDescriptor) {
  for (var ii = path.length - 1; ii >= 0; ii--) {
    var parent = path[ii];
    if (
      parent instanceof RelayQuery.Field &&
      parent.getInferredRootCallName()
    ) {
      // We can make a "ref query" at this point, so stop wrapping.
      return new RelayRefQueryDescriptor(node, path.slice(0, ii + 1));
    }

    var siblings = getRequisiteSiblings(node, parent);
    var children = [node].concat(siblings);

    // Cast here because we know that `clone` will never return `null` (because
    // we always give it at least one child).
    node = (parent.clone(children): any);
  }
  invariant(
    node instanceof RelayQuery.Root,
    'splitDeferredRelayQueries(): Cannot build query without a root node.'
  );
  const identifyingArg = node.getIdentifyingArg();
  const identifyingArgName = (identifyingArg && identifyingArg.name) || null;
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  const metadata = {};
  metadata.isDeferred = true;
  if (identifyingArgName != null) {
    metadata.identifyingArgName = identifyingArgName;
  }
  return RelayQuery.Root.build(
    node.getFieldName(),
    identifyingArgValue,
    node.getChildren(),
    metadata,
    node.getName()
  );
}

/**
 * Returns `true` if `node` is considered "empty", which means that it contains
 * no non-generated fields, and no ref query dependencies.
 */
function isEmpty(node: RelayQuery.Node): boolean {
  if (node.isScalar()) {
    return node.isGenerated() && !node.isRefQueryDependency();
  } else {
    return node.getChildren().every(isEmpty);
  }
}

/**
 * Mutates and returns a nested `SplitQueries` structure, updating any deferred
 * "ref queries" to actually reference their contexts.
 */
function buildQueries(splitQueries: SplitQueries): SplitQueries {
  if (splitQueries.required && isEmpty(splitQueries.required)) {
    splitQueries.required = null;
  }
  splitQueries.deferred = splitQueries.deferred.map(nestedSplitQueries => {
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
      invariant(
        context,
        'splitDeferredRelayQueries(): Expected a context root query.'
      );
      nestedSplitQueries.required = createRefQuery(descriptor, context);
    }

    return buildQueries(nestedSplitQueries);
  });
  return splitQueries;
}

/**
 * Wraps `descriptor` in a new top-level ref query.
 */
function createRefQuery(
  descriptor: RelayRefQueryDescriptor,
  context: RelayQuery.Root
): RelayQuery.Root {
  var node = descriptor.node;
  invariant(
    node instanceof RelayQuery.Field ||
    node instanceof RelayQuery.Fragment,
    'splitDeferredRelayQueries(): Ref query requires a field or fragment.'
  );

  // Build up JSONPath.
  var path = ['$', '*'];
  var parent;
  for (var ii = 0; ii < descriptor.path.length; ii++) {
    parent = descriptor.path[ii];
    if (parent instanceof RelayQuery.Field) {
      path.push(parent.getSerializationKey());
      if (parent.isPlural()) {
        path.push('*');
      }
    }
  }
  invariant(
    path.length > 2,
    'splitDeferredRelayQueries(): Ref query requires a complete path.'
  );
  var field: RelayQuery.Field = (parent: any); // Flow
  var primaryKey = field.getInferredPrimaryKey();
  invariant(
    primaryKey,
    'splitDeferredRelayQueries(): Ref query requires a primary key.'
  );
  path.push(primaryKey);

  // Create the wrapper root query.
  var root = RelayQuery.Root.build(
    RelayNodeInterface.NODES,
    new GraphQL.BatchCallVariable(context.getID(), path.join('.')),
    [node],
    {
      isDeferred: true,
      identifyingArgName: RelayNodeInterface.ID,
    },
    context.getName()
  );

  var result: RelayQuery.Root = (root: any); // Flow
  return result;
}

/**
 * Traverses an input query, updating the passed in `SplitQueries` state object
 * to contain a nested structure representing the required and deferred portions
 * of the input query.
 */
class GraphQLSplitDeferredQueries extends RelayQueryTransform<SplitQueries> {
  visitField(
    node: RelayQuery.Field,
    splitQueries: SplitQueries
  ): ?RelayQuery.Node {
    if (!node.hasDeferredDescendant()) {
      return node;
    }

    splitQueries.__path__.push(node);
    var result = this.traverse(node, splitQueries);
    splitQueries.__path__.pop();

    if (result && node.getInferredRootCallName()) {
      // The node is a ref query dependency; mark it as one.
      var key = node.getInferredPrimaryKey();
      var children = result.getChildren().map(child => {
        if (
          child instanceof RelayQuery.Field &&
          child.getSchemaName() === key
        ) {
          return child.cloneAsRefQueryDependency();
        } else {
          return child;
        }
      });
      result = result.clone(children);
    }

    return result;
  }

  visitFragment(
    node: RelayQuery.Fragment,
    splitQueries: SplitQueries
  ): ?RelayQuery.Node {
    if (!node.getChildren().length) {
      return null;
    }

    if (node.isDeferred()) {
      var path = splitQueries.__path__;
      var deferred = {
        __parent__: splitQueries,
        __path__: path,
        __refQuery__: null,
        deferred: [],
        required: null,
      };
      var result = this.traverse(node, deferred);
      if (result) {
        var wrapped = wrapNode(result, path);
        if (wrapped instanceof RelayQuery.Root) {
          deferred.required = wrapped;
        } else if (wrapped instanceof RelayRefQueryDescriptor) { // for Flow
          deferred.__refQuery__ = (wrapped: RelayRefQueryDescriptor);
        }
      }
      if (result || deferred.deferred.length) {
        splitQueries.deferred.push(deferred);
      }
      return null;
    } else if (node.hasDeferredDescendant()) {
      return this.traverse(node, splitQueries);
    } else {
      return node;
    }
  }

  visitRoot(
    node: RelayQuery.Root,
    splitQueries: SplitQueries
  ): ?RelayQuery.Node {
    var result;
    if (!node.hasDeferredDescendant()) {
      splitQueries.required = node;
      return node;
    } else {
      splitQueries.__path__.push(node);
      result = this.traverse(node, splitQueries);
      splitQueries.__path__.pop();
      splitQueries.required = result;
      return result;
    }
  }
}

var instrumented = RelayProfiler.instrument(
  'splitDeferredRelayQueries',
  splitDeferredRelayQueries
);

// #7573861: Type export collides with CommonJS export in presence of
// `instrument()` call:
module.exports = (instrumented: $FlowIssue);

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule splitDeferredRelayQueries
 * @flow
 * @format
 */

'use strict';

const QueryBuilder = require('QueryBuilder');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryTransform = require('RelayQueryTransform');
const RelayRefQueryDescriptor = require('RelayRefQueryDescriptor');

const invariant = require('invariant');

import type {NodePath} from 'RelayRefQueryDescriptor';

export type SplitQueries = {
  __nodePath__: NodePath,
  __parent__: ?SplitQueries,
  __refQuery__: ?RelayRefQueryDescriptor,
  deferred: Array<SplitQueries>,
  required: ?RelayQuery.Root,
};

/**
 * Traverse `node` splitting off deferred query fragments into separate queries.
 *
 * @internal
 */
function splitDeferredRelayQueries(node: RelayQuery.Root): SplitQueries {
  const splitter = new GraphQLSplitDeferredQueries();
  const splitQueries = {
    __nodePath__: [],
    __parent__: null,
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
  parent: RelayQuery.Node,
): Array<RelayQuery.Node> {
  // Get the requisite siblings.
  const siblings = parent
    .getChildren()
    .filter(
      child =>
        child !== node &&
        child instanceof RelayQuery.Field &&
        child.isRequisite(),
    );

  // Filter the non-requisite children from those siblings.
  return siblings.map(sibling => {
    const children = sibling
      .getChildren()
      .filter(
        child => child instanceof RelayQuery.Field && child.isRequisite(),
      );
    const clone = sibling.clone(children);
    invariant(
      clone,
      'splitDeferredRelayQueries(): Unexpected non-scalar, requisite field.',
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
  nodePath: NodePath,
): RelayQuery.Node | RelayRefQueryDescriptor {
  for (let ii = nodePath.length - 1; ii >= 0; ii--) {
    const parent = nodePath[ii];
    if (
      parent instanceof RelayQuery.Field &&
      parent.getInferredRootCallName()
    ) {
      // We can make a "ref query" at this point, so stop wrapping.
      return new RelayRefQueryDescriptor(node, nodePath.slice(0, ii + 1));
    }

    const siblings = getRequisiteSiblings(node, parent);
    const children = [node].concat(siblings);

    // Cast here because we know that `clone` will never return `null` (because
    // we always give it at least one child).
    node = (parent.clone(children): any);
  }
  invariant(
    node instanceof RelayQuery.Root,
    'splitDeferredRelayQueries(): Cannot build query without a root node.',
  );
  const identifyingArg = node.getIdentifyingArg();
  const identifyingArgName = (identifyingArg && identifyingArg.name) || null;
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  const metadata = {
    identifyingArgName,
    identifyingArgType: RelayNodeInterface.ID_TYPE,
    isAbstract: true,
    isDeferred: true,
    isPlural: false,
  };
  return RelayQuery.Root.build(
    node.getName(),
    node.getFieldName(),
    identifyingArgValue,
    node.getChildren(),
    metadata,
    node.getType(),
  );
}

/**
 * Returns `true` if `node` is considered "empty", which means that it contains
 * no non-generated fields, and no ref query dependencies.
 */
function isEmpty(node: RelayQuery.Node): boolean {
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
function buildQueries(splitQueries: SplitQueries): SplitQueries {
  if (splitQueries.required && isEmpty(splitQueries.required)) {
    splitQueries.required = null;
  }
  splitQueries.deferred = splitQueries.deferred.map(nestedSplitQueries => {
    const descriptor = nestedSplitQueries.__refQuery__;
    if (descriptor) {
      // Wrap the ref query node with a reference to the required query that is
      // its context.
      let context = splitQueries.required;
      if (!context) {
        // Traverse upwards looking for context.
        let parentSplitQueries = splitQueries;
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
        'splitDeferredRelayQueries(): Expected a context root query.',
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
  context: RelayQuery.Root,
): RelayQuery.Root {
  const node = descriptor.node;
  invariant(
    node instanceof RelayQuery.Field || node instanceof RelayQuery.Fragment,
    'splitDeferredRelayQueries(): Ref query requires a field or fragment.',
  );

  // Build up JSONPath.
  const jsonPath = ['$', '*'];
  let parent;
  for (let ii = 0; ii < descriptor.nodePath.length; ii++) {
    parent = descriptor.nodePath[ii];
    if (parent instanceof RelayQuery.Field) {
      jsonPath.push(parent.getSerializationKey());
      if (parent.isPlural()) {
        jsonPath.push('*');
      }
    }
  }
  invariant(
    jsonPath.length > 2,
    'splitDeferredRelayQueries(): Ref query requires a complete path.',
  );
  const field: RelayQuery.Field = (parent: any); // Flow
  const primaryKey = field.getInferredPrimaryKey();
  invariant(
    primaryKey,
    'splitDeferredRelayQueries(): Ref query requires a primary key.',
  );
  jsonPath.push(primaryKey);

  // Create the wrapper root query.
  const root = RelayQuery.Root.build(
    context.getName(),
    RelayNodeInterface.NODES,
    QueryBuilder.createBatchCallVariable(context.getID(), jsonPath.join('.')),
    [node],
    {
      identifyingArgName: RelayNodeInterface.ID,
      identifyingArgType: RelayNodeInterface.ID_TYPE,
      isAbstract: true,
      isDeferred: true,
      isPlural: false,
    },
    RelayNodeInterface.NODE_TYPE,
  );

  const result: RelayQuery.Root = (root: any); // Flow
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
    splitQueries: SplitQueries,
  ): ?RelayQuery.Node {
    if (!node.hasDeferredDescendant()) {
      return node;
    }

    splitQueries.__nodePath__.push(node);
    let result = this.traverse(node, splitQueries);
    splitQueries.__nodePath__.pop();

    if (result && node.getInferredRootCallName()) {
      // The node is a ref query dependency; mark it as one.
      const key = node.getInferredPrimaryKey();
      const children = result.getChildren().map(child => {
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
    splitQueries: SplitQueries,
  ): ?RelayQuery.Node {
    if (!node.getChildren().length) {
      return null;
    }

    if (node.isDeferred()) {
      const nodePath = splitQueries.__nodePath__;
      const deferred: SplitQueries = {
        __nodePath__: nodePath,
        __parent__: splitQueries,
        __refQuery__: null,
        deferred: [],
        required: null,
      };
      const result = this.traverse(node, deferred);
      if (result) {
        const wrapped = wrapNode(result, nodePath);
        if (wrapped instanceof RelayQuery.Root) {
          deferred.required = wrapped;
        } else if (wrapped instanceof RelayRefQueryDescriptor) {
          // for Flow
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
    splitQueries: SplitQueries,
  ): ?RelayQuery.Node {
    if (!node.hasDeferredDescendant()) {
      splitQueries.required = node;
      return node;
    } else {
      splitQueries.__nodePath__.push(node);
      const result = this.traverse(node, splitQueries);
      splitQueries.__nodePath__.pop();
      splitQueries.required = result;
      return result;
    }
  }
}

module.exports = RelayProfiler.instrument(
  'splitDeferredRelayQueries',
  splitDeferredRelayQueries,
);

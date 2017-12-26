/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const QueryBuilder = require('./QueryBuilder');
const RelayFragmentReference = require('./RelayFragmentReference');
const RelayRouteFragment = require('./RelayRouteFragment');

const generateConcreteFragmentID = require('./generateConcreteFragmentID');
const invariant = require('invariant');

import type {
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from './ConcreteQuery';
import type {VariableMapping} from './RelayFragmentReference';
import type {GraphQLTaggedNode} from 'RelayRuntime';

export type RelayConcreteNode = mixed;

/**
 * @public
 *
 * This is a tag function used with template strings to provide the facade of a
 * runtime GraphQL parser. Example usage:
 *
 *   Relay.QL`fragment on User { name }`
 *
 * In actuality, a Babel transform parses these tag templates and replaces it
 * with an internal representation of the query structure.
 */
function RelayQL(
  strings: Array<string>,
  ...substitutions: Array<any>
): RelayConcreteNode {
  invariant(
    false,
    'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `Relay.QL`.',
  );
}

function assertValidFragment(substitution: any): void {
  invariant(
    substitution instanceof RelayFragmentReference ||
      QueryBuilder.getFragment(substitution) ||
      QueryBuilder.getFragmentSpread(substitution),
    'RelayQL: Invalid fragment composition, use ' +
      "`${Child.getFragment('name')}`.",
  );
}

const CLASSIC_NODE = '__classic_node__';

/**
 * Private helper methods used by the transformed code.
 */
Object.assign(RelayQL, {
  __frag(substitution: any): any {
    if (typeof substitution === 'function') {
      // Route conditional fragment, e.g. `${route => matchRoute(route, ...)}`.
      return new RelayRouteFragment(substitution);
    }
    if (substitution != null) {
      if (Array.isArray(substitution)) {
        substitution.forEach(assertValidFragment);
      } else {
        assertValidFragment(substitution);
      }
    }
    return substitution;
  },
  __var(expression: mixed): mixed {
    const variable = QueryBuilder.getCallVariable(expression);
    if (variable) {
      invariant(
        false,
        'RelayQL: Invalid argument `%s` supplied via template substitution. ' +
          'Instead, use an inline variable (e.g. `comments(count: $count)`).',
        variable.callVariableName,
      );
    }
    return QueryBuilder.createCallValue(expression);
  },
  __id(): string {
    return generateConcreteFragmentID();
  },
  __createFragment(
    fragment: ConcreteFragment,
    variableMapping: VariableMapping,
  ): RelayFragmentReference {
    return new RelayFragmentReference(() => fragment, null, variableMapping);
  },

  /**
   * Memoizes the results of executing the `.classic()` functions on
   * graphql`...` tagged expressions. Memoization allows the framework to use
   * object equality checks to compare fragments (useful, for example, when
   * comparing two `Selector`s to see if they select the same data).
   */
  __getClassicNode(taggedNode) {
    let concreteNode = (taggedNode: any)[CLASSIC_NODE];
    if (concreteNode == null) {
      const fn = taggedNode.classic;
      invariant(
        typeof fn === 'function',
        'RelayQL: Expected a graphql literal, got `%s`.\n' +
          'The "relay" Babel plugin must enable "compat" mode to be used with ' +
          '"react-relay/compat" or "react-relay/classic".\n' +
          'See: https://facebook.github.io/relay/docs/babel-plugin-relay.html',
        JSON.stringify(taggedNode),
      );
      concreteNode = fn(this);
      (taggedNode: any)[CLASSIC_NODE] = concreteNode;
    }
    return concreteNode;
  },

  __getClassicFragment(
    taggedNode: GraphQLTaggedNode,
    isUnMasked: ?boolean,
  ): ConcreteFragmentDefinition {
    const concreteNode = this.__getClassicNode(taggedNode);
    const fragment = QueryBuilder.getFragmentDefinition(concreteNode);
    invariant(
      fragment,
      'RelayQL: Expected a fragment, got `%s`.\n' +
        'The "relay" Babel plugin must enable "compat" mode to be used with ' +
        '"react-relay/compat" or "react-relay/classic".\n' +
        'See: https://facebook.github.io/relay/docs/babel-plugin-relay.html',
      concreteNode,
    );
    if (isUnMasked) {
      /*
       * For a regular `Fragment` or `Field` node, its variables have been declared
       * in the parent. However, since unmasked fragment is actually parsed as `FragmentSpread`,
       * we need to manually hoist its arguments to the parent.
       * In reality, we do not actually hoist the arguments because Babel transform is per file.
       * Instead, we could put the `argumentDefinitions` in the `metadata` and resolve the variables
       * when building the concrete fragment node.
       */
      const hoistedRootArgs: Array<string> = [];
      fragment.argumentDefinitions.forEach(argDef => {
        invariant(
          argDef.kind === 'RootArgument',
          'RelayQL: Cannot unmask fragment `%s`. Expected all the arguments are root argument' +
            ' but get `%s`',
          concreteNode.node.name,
          argDef.name,
        );
        hoistedRootArgs.push(argDef.name);
      });

      fragment.node.metadata = {
        ...concreteNode.node.metadata,
        hoistedRootArgs,
      };
    }
    return fragment;
  },

  __getClassicOperation(
    taggedNode: GraphQLTaggedNode,
  ): ConcreteOperationDefinition {
    const concreteNode = this.__getClassicNode(taggedNode);
    const operation = QueryBuilder.getOperationDefinition(concreteNode);
    invariant(
      operation,
      'RelayQL: Expected an operation, got `%s`.\n' +
        'The "relay" Babel plugin must enable "compat" mode to be used with ' +
        '"react-relay/compat" or "react-relay/classic".\n' +
        'See: https://facebook.github.io/relay/docs/babel-plugin-relay.html',
      concreteNode,
    );
    return operation;
  },
});

module.exports = RelayQL;

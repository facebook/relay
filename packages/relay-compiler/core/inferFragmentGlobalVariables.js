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

const GraphQLCompilerContext = require('./GraphQLCompilerContext');
const GraphQLIRVisitor = require('./GraphQLIRVisitor');

const {createCompilerError} = require('./RelayCompilerError');

import type {ArgumentDefinition, Fragment} from 'relay-compiler';

type ArgumentMap = Map<string, ArgumentDefinition>;

/**
 * Given a compiler context and some fragments, returns a new
 * context with transformed versions of the input fragments
 * such that each output fragment's argumentDefinitions *fully*
 * describes both its local argument definitions and all
 * root variables that are referenced by the fragment itself
 * or any fragments it transitively references.
 *
 * The returned context will only contain the transformed versions
 * of the input fragments and no other documents.
 */
function inferFragmentGlobalVariables(
  context: GraphQLCompilerContext,
  fragments: Iterable<Fragment>,
): GraphQLCompilerContext {
  // This transform does two main tasks:
  // - Determine the set of root variables referenced locally in each
  //   fragment. Note that RootArgumentDefinitions in the fragment's
  //   argumentDefinitions can contain spurious entries for legacy
  //   reasons. Instead of using those the fragment is traversed
  //   to reanalyze variable usage.
  // - Determine the set of root variables that are transitively referenced
  //   by each fragment, ie the union of all root variables used in the
  //   fragment and any fragments it transitively spreads.

  // Cache fragments as they are transformed to avoid duplicate processing.
  // Because @argument values don't matter (only variable names/types),
  // each reachable fragment only has to be checked once.
  const transformed = new Map<string, ArgumentMap>();
  const nextContext = new GraphQLCompilerContext(
    context.serverSchema,
    context.clientSchema,
  );
  return nextContext.addAll(
    Array.from(fragments, fragment => {
      const argumentDefinitions = transformFragment(
        context,
        transformed,
        fragment,
      );
      return {
        ...fragment,
        argumentDefinitions: Array.from(argumentDefinitions.values()),
      };
    }),
  );
}

function transformFragment(
  context: GraphQLCompilerContext,
  transformed: Map<string, ArgumentMap>,
  fragment: Fragment,
): ArgumentMap {
  const name = fragment.name;
  const transformedArguments = transformed.get(name);
  if (transformedArguments != null) {
    return transformedArguments;
  }
  // Start with only the explicitly defined local arguments, recover the
  // correct set of root variables excluding invalid @arguments values.
  const argumentDefinitions: ArgumentMap = new Map();
  fragment.argumentDefinitions.forEach(argDef => {
    if (argDef.kind === 'LocalArgumentDefinition') {
      argumentDefinitions.set(argDef.name, argDef);
    }
  });
  // Break cycles by initially caching a version that only has local
  // arguments. If the current fragment is reached again, it won't have
  // any root variables to add to its parents. The traversal below will
  // find any root variables and update the cached version of the
  // frragment.
  transformed.set(name, argumentDefinitions);
  GraphQLIRVisitor.visit(fragment, {
    FragmentSpread(node) {
      const referencedFragmentArguments = transformFragment(
        context,
        transformed,
        context.getFragment(node.name),
      );
      node.args.forEach(arg => {
        const argDef = referencedFragmentArguments.get(arg.name);
        // Detect global variables being passed to *defined* arguments on
        // the spread fragment.
        if (
          argDef != null &&
          arg.value.kind === 'Variable' &&
          !argumentDefinitions.has(arg.value.variableName)
        ) {
          argumentDefinitions.set(arg.value.variableName, {
            kind: 'RootArgumentDefinition',
            metadata: null,
            name: arg.value.variableName,
            type: argDef.type,
          });
        }
      });
      // Add any global variables from the spread fragment that we don't
      // already know about
      for (const argDef of referencedFragmentArguments.values()) {
        if (
          argDef.kind === 'RootArgumentDefinition' &&
          !argumentDefinitions.has(argDef.name)
        ) {
          argumentDefinitions.set(argDef.name, argDef);
        }
      }
      return false;
    },
    Argument(node) {
      if (node.value.kind !== 'Variable') {
        return false;
      }
      if (
        node.type == null ||
        node.value.type == null ||
        node.type !== node.value.type
      ) {
        throw createCompilerError(
          `inferFragmentGlobalVariables: Expected argument '${node.name}: \$${
            node.value.variableName
          }' in fragment '${name}' to be typed.`,
        );
      }
      if (!argumentDefinitions.has(node.value.variableName)) {
        // Global variable
        argumentDefinitions.set(node.value.variableName, {
          kind: 'RootArgumentDefinition',
          metadata: null,
          name: node.value.variableName,
          type: node.value.type,
        });
      }
      return false;
    },
  });
  transformed.set(name, argumentDefinitions);
  return argumentDefinitions;
}

module.exports = inferFragmentGlobalVariables;

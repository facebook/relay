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
const SchemaUtils = require('./SchemaUtils');

const {createCompilerError} = require('./RelayCompilerError');

import type {
  Argument,
  ArgumentDefinition,
  Condition,
  Connection,
  Defer,
  Fragment,
  FragmentSpread,
  LinkedField,
  Root,
  SplitOperation,
  Stream,
} from './GraphQLIR';

type ArgumentMap = Map<string, ArgumentDefinition>;

/**
 * Returns a transformed version of the input context where each document's
 * argument definitions are updated to accurately describe the root variables
 * used (or reachable) from that document:
 * - Fragment argument definitions are updated to include local argument
 *   definitions and any root variables that are referenced
 *   by the fragment (or any fragments it transitively spreads).
 * - Root argument definitions are updated to reflect the variables
 *   referenced locally and all root variables referenced by any
 *   fragments it (transitively) spreads.
 */
function inferRootArgumentDefinitions(
  context: GraphQLCompilerContext,
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
  const nextContext = new GraphQLCompilerContext(context.getSchema());
  return nextContext.addAll(
    Array.from(context.documents(), node => {
      switch (node.kind) {
        case 'Fragment': {
          const argumentDefinitions = transformFragmentArguments(
            context,
            transformed,
            node,
          );
          return ({
            ...node,
            argumentDefinitions: Array.from(argumentDefinitions.values()),
          }: Fragment);
        }
        case 'Root': {
          return transformRoot(context, transformed, node);
        }
        case 'SplitOperation': {
          return (node: SplitOperation);
        }
        default: {
          (node: empty);
          throw createCompilerError(
            `inferRootArgumentDefinitions: Unsupported kind '${node.kind}'.`,
          );
        }
      }
    }),
  );
}

function transformRoot(
  context: GraphQLCompilerContext,
  transformed: Map<string, ArgumentMap>,
  root: Root,
): Root {
  // Ignore argument definitions, determine what root variables are
  // transitively referenced
  const argumentDefinitions = new Map();
  const localArgumentDefinitions = new Map();
  for (const [name, argDef] of root.argumentDefinitions.entries()) {
    if (argDef.kind === 'LocalArgumentDefinition') {
      localArgumentDefinitions.set(name, argDef);
    }
  }
  visit(context, transformed, argumentDefinitions, root);
  return {
    ...root,
    argumentDefinitions: Array.from(argumentDefinitions.values(), argDef => {
      if (argDef.kind !== 'RootArgumentDefinition') {
        throw createCompilerError(
          `inferRootArgumentDefinitions: Expected inferred variable '\$${
            argDef.name
          }' to be a root variables.`,
          [argDef.loc],
        );
      }
      const localDefinition = localArgumentDefinitions.get(argDef.name);
      const type = localDefinition?.type ?? argDef.type;
      return {
        defaultValue: localDefinition?.defaultValue ?? null,
        kind: 'LocalArgumentDefinition',
        loc: argDef.loc,
        name: argDef.name,
        type: type,
      };
    }),
  };
}

function transformFragmentArguments(
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
  // fragment.
  transformed.set(name, argumentDefinitions);
  visit(context, transformed, argumentDefinitions, fragment);
  transformed.set(name, argumentDefinitions);
  return argumentDefinitions;
}

function visit(
  context: GraphQLCompilerContext,
  transformed: Map<string, ArgumentMap>,
  argumentDefinitions: ArgumentMap,
  node: Fragment | Root,
): void {
  GraphQLIRVisitor.visit(node, {
    FragmentSpread(fragmentSpread: FragmentSpread) {
      const fragment = context.getFragment(
        fragmentSpread.name,
        fragmentSpread.loc,
      );
      const referencedFragmentArguments = transformFragmentArguments(
        context,
        transformed,
        fragment,
      );
      // Detect root variables being passed as the value of @arguments;
      // recover the expected type from the corresponding argument definitions.
      fragmentSpread.args.forEach(arg => {
        const argDef = referencedFragmentArguments.get(arg.name);
        if (
          argDef != null &&
          arg.value.kind === 'Variable' &&
          !argumentDefinitions.has(arg.value.variableName)
        ) {
          argumentDefinitions.set(arg.value.variableName, {
            kind: 'RootArgumentDefinition',
            loc: {kind: 'Derived', source: arg.loc},
            name: arg.value.variableName,
            type: argDef.type,
          });
        }
      });
      // Merge any root variables referenced by the spread fragment
      // into this (parent) fragment's arguments.
      for (const argDef of referencedFragmentArguments.values()) {
        if (argDef.kind === 'RootArgumentDefinition') {
          argumentDefinitions.set(argDef.name, argDef);
        }
      }
    },
    Argument(argument: Argument) {
      if (argument.value.kind !== 'Variable') {
        return false;
      }
      const variable = argument.value;
      const type = variable.type ?? argument.type;
      if (type == null) {
        return;
      }
      if (!argumentDefinitions.has(variable.variableName)) {
        // root variable
        argumentDefinitions.set(variable.variableName, {
          kind: 'RootArgumentDefinition',
          loc: {kind: 'Derived', source: argument.loc},
          name: variable.variableName,
          type: type,
        });
      }
      return false;
    },
    Condition(condition: Condition) {
      const variable = condition.condition;
      if (variable.kind !== 'Variable') {
        return;
      }
      const type =
        variable.type ??
        SchemaUtils.getNonNullBooleanInput(context.getSchema());
      if (!argumentDefinitions.has(variable.variableName)) {
        // root variable
        argumentDefinitions.set(variable.variableName, {
          kind: 'RootArgumentDefinition',
          loc: {kind: 'Derived', source: variable.loc},
          name: variable.variableName,
          type: type,
        });
      }
    },
    Connection(connection: Connection) {
      const stream = connection.stream;
      if (stream == null) {
        return;
      }
      const defaultType = SchemaUtils.getNonNullBooleanInput(
        context.getSchema(),
      );
      [stream.if, stream.initialCount].forEach(variable => {
        if (variable == null || variable.kind !== 'Variable') {
          return;
        }
        const type = variable.type ?? defaultType;

        if (!argumentDefinitions.has(variable.variableName)) {
          // root variable
          argumentDefinitions.set(variable.variableName, {
            kind: 'RootArgumentDefinition',
            loc: {kind: 'Derived', source: variable.loc},
            name: variable.variableName,
            type,
          });
        }
      });
    },
    Defer(defer: Defer) {
      const variable = defer.if;
      if (variable == null || variable.kind !== 'Variable') {
        return;
      }
      const type =
        variable.type ??
        SchemaUtils.getNonNullBooleanInput(context.getSchema());
      if (!argumentDefinitions.has(variable.variableName)) {
        // root variable
        argumentDefinitions.set(variable.variableName, {
          kind: 'RootArgumentDefinition',
          loc: {kind: 'Derived', source: variable.loc},
          name: variable.variableName,
          type: type,
        });
      }
    },
    Stream(stream: Stream) {
      [stream.if, stream.initialCount].forEach(variable => {
        if (variable == null || variable.kind !== 'Variable') {
          return;
        }

        const type =
          variable.type ??
          SchemaUtils.getNonNullBooleanInput(context.getSchema());
        if (!argumentDefinitions.has(variable.variableName)) {
          // root variable
          argumentDefinitions.set(variable.variableName, {
            kind: 'RootArgumentDefinition',
            loc: {kind: 'Derived', source: variable.loc},
            name: variable.variableName,
            type,
          });
        }
      });
    },
    LinkedField(field: LinkedField) {
      if (!field.handles) {
        return;
      }
      field.handles.forEach(handle => {
        const variable = handle.dynamicKey;
        if (variable == null) {
          return;
        }
        const type =
          variable.type ??
          SchemaUtils.getNullableStringInput(context.getSchema());
        if (!argumentDefinitions.has(variable.variableName)) {
          // root variable
          argumentDefinitions.set(variable.variableName, {
            kind: 'RootArgumentDefinition',
            loc: {kind: 'Derived', source: variable.loc},
            name: variable.variableName,
            type: type,
          });
        }
      });
    },
  });
}

module.exports = inferRootArgumentDefinitions;

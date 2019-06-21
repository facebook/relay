/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * All rights reserved.
 *
 * @flow
 * @format
 */

'use strict';

const {isTypeSubTypeOf} = require('graphql');

import type {ArgumentDefinition, Fragment} from '../core/GraphQLIR';
import type {GraphQLSchema} from 'graphql';

/**
 * @private
 *
 * Attempts to join the argument definitions for a root fragment
 * and any unmasked fragment spreads reachable from that root fragment,
 * returning a combined list of arguments or throwing if the same
 * variable(s) are used in incompatible ways in different fragments.
 */
function joinArgumentDefinitions(
  schema: GraphQLSchema,
  fragment: Fragment,
  reachableArguments: $ReadOnlyArray<{
    argDef: ArgumentDefinition,
    source: string,
  }>,
): Array<ArgumentDefinition> {
  const joinedArgumentDefinitions = new Map();
  fragment.argumentDefinitions.forEach(prevArgDef => {
    joinedArgumentDefinitions.set(prevArgDef.name, prevArgDef);
  });
  const errors = [];
  reachableArguments.forEach(nextArg => {
    const {argDef: nextArgDef, source} = nextArg;
    const prevArgDef = joinedArgumentDefinitions.get(nextArgDef.name);
    if (prevArgDef) {
      const joinedArgDef = joinArgumentDefinition(
        schema,
        prevArgDef,
        nextArgDef,
      );
      if (joinedArgDef === null) {
        errors.push(`Variable \`\$${nextArgDef.name}\` in \`${source}\``);
      } else {
        joinedArgumentDefinitions.set(joinedArgDef.name, joinedArgDef);
      }
    } else {
      joinedArgumentDefinitions.set(nextArgDef.name, nextArgDef);
    }
  });
  if (errors.length) {
    throw new Error(
      'RelayMaskTransform: Cannot unmask one or more fragments in ' +
        `\`${fragment.name}\`, the following variables are referenced more ` +
        'than once with incompatible kinds/types:\n' +
        errors.map(msg => `* ${msg}`).join('\n'),
    );
  }
  return Array.from(joinedArgumentDefinitions.values());
}

/**
 * @private
 *
 * Attempts to join two argument definitions, returning a single argument
 * definition that is compatible with both of the inputs:
 * - If the kind, name, or defaultValue is different then the arguments
 *   cannot be joined, indicated by returning null.
 * - If either of next/prev is a subtype of the other, return the one
 *   that is the subtype: a more narrow type can flow into a more general
 *   type but not the inverse.
 * - Otherwise there is no subtyping relation between prev/next, so return
 *   null to indicate they cannot be joined.
 */
function joinArgumentDefinition(
  schema: GraphQLSchema,
  prevArgDef: ArgumentDefinition,
  nextArgDef: ArgumentDefinition,
): ArgumentDefinition | null {
  if (
    prevArgDef.kind !== nextArgDef.kind ||
    prevArgDef.name !== nextArgDef.name ||
    // Only LocalArgumentDefinition defines defaultValue
    (prevArgDef: any).defaultValue !== (nextArgDef: any).defaultValue
  ) {
    return null;
  } else if (isTypeSubTypeOf(schema, nextArgDef.type, prevArgDef.type)) {
    // prevArgDef is less strict than nextArgDef
    return nextArgDef;
  } else if (isTypeSubTypeOf(schema, prevArgDef.type, nextArgDef.type)) {
    return prevArgDef;
  } else {
    return null;
  }
}

module.exports = joinArgumentDefinitions;

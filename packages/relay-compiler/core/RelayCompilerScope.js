/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompilerScope
 * @flow
 */

'use strict';

const GraphQL = require('graphql');

const invariant = require('invariant');

import type {
  Argument,
  ArgumentDefinition,
  ArgumentValue,
  LocalArgumentDefinition,
} from 'RelayIR';

const {GraphQLNonNull} = GraphQL;

/**
 * A scope is a mapping of the values for each argument defined by the nearest
 * ancestor root or fragment of a given IR selection. A scope maps argument
 * names to the argument's statically determined value, which can be either a
 * variable or a literal.
 *
 * There are two categories of scopes: root scopes and fragment scopes.
 *
 * Root scopes apply to `Root` IR and their subselections, up until any fragment
 * spreads. Root scopes have the property that any argument may be provided at
 * runtime: even where a default value is defined, the compiler must consider
 * the value to be variable. Therefore, root scopes are a mapping of argument
 * name to variables of the same name:
 *
 *   Map {
 *     foo: $foo
 *   }
 *
 * Fragment scopes apply to `Fragment` IR nodes and their subselections, up
 * until any fragment spreads. Fragment scopes differ from root scopes in
 * several ways:
 * - Arguments may be overridden by the including fragment spread.
 * - Arguments may import values from the root scope.
 * - All other arguments must have their default values, or be null.
 *
 * Fragment scopes are also a mapping of argument name to value, but the value
 * may also be a literal:
 *
 *   Map {
 *     foo: $foo
 *     bar: 42
 *   }
 */
export type Scope = {[key: string]: ArgumentValue};

/**
 * Creates a scope for a `Root`, with each argument mapped to a variable of the
 * same name. Example:
 *
 * Query:
 * query Foo($id: ID, $size: Int = 42) { ... }
 *
 * Scope:
 * {
 *   id: $id,
 *   size: $size,
 * }
 *
 * Note that even though a default value is defined for $size, the scope must
 * assume that this could be overridden at runtime. The value cannot be decided
 * statically and therefore is set to a variable.
 */
function getRootScope(
  definitions: Array<LocalArgumentDefinition>
): Scope {
  const scope = {};
  definitions.forEach(definition => {
    scope[definition.name] = {
      kind: 'Variable',
      variableName: definition.name,
    };
  });
  return scope;
}

/**
 * Creates a scope for a `Fragment` by translating fragment spread arguments in
 * the context of a parent scope into a new scope and validating them against
 * the argument definitions.
 *
 *
 * Parent Scope:
 * {
 *   active: $parentActive
 * }
 *
 * Fragment Spread:
 * ...Bar(size: 42, enabled: $active)
 *
 * Fragment:
 * fragment Bar on Foo @argumentDefinitions(
 *   id: {type: "ID"}
 *   size: {type: "Int"}
 *   enabled: {type: "Boolean}
 *   scale: {type: "Int", imports: "pixelRatio"}
 * )
 *
 * Scope:
 * {
 *   // No argument is provided for $id, it gets the default value which in this
 *   // case is `null`:
 *   id: null,
 *
 *   // The parent passes 42 as a literal value for $size:
 *   size: 42,
 *
 *   // The parent passes a variable as the value of $enabled. This variable is
 *   // resolved in the parent scope to the value $parentActive, which becomes
 *   // the value of $enabled:
 *   $enabled: $parentActive,
 *
 *   // $scale imports pixelRatio from the root scope. Since any argument in a
 *   // root scope maps to a variable of the same name, that means the value of
 *   // pixelRatio in the root is $pixelRatio:
 *   $scale: $pixelRatio,
 * }
 */
function getFragmentScope(
  definitions: Array<ArgumentDefinition>,
  args: Array<Argument>,
  parentScope: Scope
): Scope {
  const argMap = {};
  args.forEach(arg => {
    if (arg.value.kind === 'Literal') {
      argMap[arg.name] = arg.value;
    } else if (arg.value.kind === 'Variable') {
      argMap[arg.name] = parentScope[arg.value.variableName];
    }
  });

  const fragmentScope = {};
  definitions.forEach(definition => {
    if (definition.kind === 'RootArgumentDefinition') {
      invariant(
        !argMap.hasOwnProperty(definition.name),
        'RelayCompilerScope: Unexpected argument for global variable `%s`. ' +
        '@arguments may only be provided for variables defined in the ' +
        'fragment\'s @argumentDefinitions list.',
        definition.name
      );
      fragmentScope[definition.name] = {
        kind: 'Variable',
        variableName: definition.name,
      };
    } else {
      const arg = argMap[definition.name];
      if (arg == null || (arg.kind === 'Literal' && arg.value == null)) {
        // No variable or literal null was passed, fall back to default
        // value.
        invariant(
          definition.defaultValue != null ||
          !(definition.type instanceof GraphQLNonNull),
          'RelayCompilerScope: No value found for required argument ' +
          '`$%s: %s`.',
          definition.name,
          definition.type.toString()
        );
        fragmentScope[definition.name] = {
          kind: 'Literal',
          value: definition.defaultValue,
        };
      } else {
        // Variable or non-null literal.
        fragmentScope[definition.name] = arg;
      }
    }
  });
  return fragmentScope;
}

module.exports = {getFragmentScope, getRootScope};

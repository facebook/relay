/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCodeGenerator
 * @flow
 * @format
 */

'use strict';

const GraphQL = require('graphql');
const RelayIRVisitor = require('RelayIRVisitor');
const RelaySchemaUtils = require('RelaySchemaUtils');

const formatStorageKey = require('formatStorageKey');
const invariant = require('invariant');
const prettyStringify = require('prettyStringify');

import type {
  ConcreteArgument,
  ConcreteArgumentDefinition,
  ConcreteFragment,
  ConcreteRoot,
  ConcreteSelection,
} from 'RelayConcreteNode';
import type {Fragment, Root} from 'RelayIR';

const {GraphQLList} = GraphQL;
const {getRawType, isAbstractType, getNullableType} = RelaySchemaUtils;

/* eslint-disable no-redeclare */
declare function generate(node: Root): ConcreteRoot;
declare function generate(node: Fragment): ConcreteFragment;

/**
 * @public
 *
 * Converts a Relay IR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(node: Root | Fragment): ConcreteRoot | ConcreteFragment {
  invariant(
    ['Root', 'Fragment'].indexOf(node.kind) >= 0,
    'RelayCodeGenerator: Unknown AST kind `%s`. Source: %s.',
    node.kind,
    getErrorMessage(node),
  );
  return RelayIRVisitor.visit(node, RelayCodeGenVisitor);
}
/* eslint-enable no-redeclare */

const RelayCodeGenVisitor = {
  leave: {
    Root(node): ConcreteRoot {
      return {
        argumentDefinitions: node.argumentDefinitions,
        kind: 'Root',
        name: node.name,
        operation: node.operation,
        selections: flattenArray(node.selections),
      };
    },

    Fragment(node): ConcreteFragment {
      return {
        argumentDefinitions: node.argumentDefinitions,
        kind: 'Fragment',
        metadata: node.metadata || null,
        name: node.name,
        selections: flattenArray(node.selections),
        type: node.type.toString(),
      };
    },

    LocalArgumentDefinition(node): ConcreteArgumentDefinition {
      return {
        kind: 'LocalArgument',
        name: node.name,
        type: node.type.toString(),
        defaultValue: node.defaultValue,
      };
    },

    RootArgumentDefinition(node): ConcreteArgumentDefinition {
      return {
        kind: 'RootArgument',
        name: node.name,
        type: node.type ? node.type.toString() : null,
      };
    },

    Condition(node, key, parent, ancestors): ConcreteSelection {
      invariant(
        node.condition.kind === 'Variable',
        'RelayCodeGenerator: Expected static `Condition` node to be ' +
          'pruned or inlined. Source: %s.',
        getErrorMessage(ancestors[0]),
      );
      return {
        kind: 'Condition',
        passingValue: node.passingValue,
        condition: node.condition.variableName,
        selections: flattenArray(node.selections),
      };
    },

    FragmentSpread(node): ConcreteSelection {
      return {
        kind: 'FragmentSpread',
        name: node.name,
        args: valuesOrNull(sortByName(node.args)),
      };
    },

    InlineFragment(node): ConcreteSelection {
      return {
        kind: 'InlineFragment',
        type: node.typeCondition.toString(),
        selections: flattenArray(node.selections),
      };
    },

    LinkedField(node): Array<ConcreteSelection> {
      const handles = (node.handles &&
        node.handles.map(handle => {
          return {
            kind: 'LinkedHandle',
            alias: node.alias,
            args: valuesOrNull(sortByName(node.args)),
            handle: handle.name,
            name: node.name,
            key: handle.key,
            filters: handle.filters,
          };
        })) || [];
      const type = getRawType(node.type);
      return [
        {
          kind: 'LinkedField',
          alias: node.alias,
          args: valuesOrNull(sortByName(node.args)),
          concreteType: !isAbstractType(type) ? type.toString() : null,
          name: node.name,
          plural: isPlural(node.type),
          selections: flattenArray(node.selections),
          storageKey: getStorageKey(node.name, node.args),
        },
        ...handles,
      ];
    },

    ScalarField(node): Array<ConcreteSelection> {
      const handles = (node.handles &&
        node.handles.map(handle => {
          return {
            kind: 'ScalarHandle',
            alias: node.alias,
            args: valuesOrNull(sortByName(node.args)),
            handle: handle.name,
            name: node.name,
            key: handle.key,
            filters: handle.filters,
          };
        })) || [];
      return [
        {
          kind: 'ScalarField',
          alias: node.alias,
          args: valuesOrNull(sortByName(node.args)),
          name: node.name,
          selections: valuesOrUndefined(flattenArray(node.selections)),
          storageKey: getStorageKey(node.name, node.args),
        },
        ...handles,
      ];
    },

    Variable(node, key, parent): ConcreteArgument {
      return {
        kind: 'Variable',
        name: parent.name,
        variableName: node.variableName,
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Literal(node, key, parent): ConcreteArgument {
      return {
        kind: 'Literal',
        name: parent.name,
        value: node.value,
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Argument(node, key, parent, ancestors): ?ConcreteArgument {
      invariant(
        ['Variable', 'Literal'].indexOf(node.value.kind) >= 0,
        'RelayCodeGenerator: Complex argument values (Lists or ' +
          'InputObjects with nested variables) are not supported, argument ' +
          '`%s` had value `%s`. Source: %s.',
        node.name,
        prettyStringify(node.value),
        getErrorMessage(ancestors[0]),
      );
      return node.value.value !== null ? node.value : null;
    },
  },
};

function isPlural(type: any): boolean {
  return getNullableType(type) instanceof GraphQLList;
}

function valuesOrUndefined<T>(array: ?Array<T>): ?Array<T> {
  return !array || array.length === 0 ? undefined : array;
}

function valuesOrNull<T>(array: ?Array<T>): ?Array<T> {
  return !array || array.length === 0 ? null : array;
}

function flattenArray<T>(array: Array<Array<T>>): Array<T> {
  return array ? Array.prototype.concat.apply([], array) : [];
}

function sortByName<T: {name: string}>(array: Array<T>): Array<T> {
  return array instanceof Array
    ? array.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    : array;
}

function getErrorMessage(node: any): string {
  return `document ${node.name}`;
}

/**
 * Computes storage key if possible.
 *
 * Storage keys which can be known ahead of runtime are:
 *
 * - Fields that do not take arguments.
 * - Fields whose arguments are all statically known (ie. literals) at build
 *   time.
 */
function getStorageKey(
  fieldName: string,
  args: ?Array<ConcreteArgument>,
): ?string {
  if (!args || !args.length) {
    return null;
  }
  let isLiteral = true;
  const preparedArgs = {};
  args.forEach(arg => {
    if (arg.kind !== 'Literal') {
      isLiteral = false;
    } else {
      preparedArgs[arg.name] = arg.value;
    }
  });
  return isLiteral ? formatStorageKey(fieldName, preparedArgs) : null;
}

module.exports = {generate};

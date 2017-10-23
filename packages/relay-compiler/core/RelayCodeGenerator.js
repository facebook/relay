/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayCodeGenerator
 * @flow
 * @format
 */

'use strict';

// TODO T21875029 ../../relay-runtime/util/formatStorageKey
const formatStorageKey = require('formatStorageKey');
const invariant = require('invariant');
// TODO T21875029 ../../relay-runtime/util/prettyStringify
const prettyStringify = require('prettyStringify');

const {
  IRVisitor,
  SchemaUtils,
} = require('../graphql-compiler/GraphQLCompilerPublic');
const {GraphQLList} = require('graphql');

import type {Batch, Fragment} from '../graphql-compiler/GraphQLCompilerPublic';
// TODO T21875029 ../../relay-runtime/util/RelayConcreteNode
import type {
  ConcreteArgument,
  ConcreteArgumentDefinition,
  ConcreteFragment,
  ConcreteOperation,
  ConcreteSelection,
  RequestNode,
} from 'RelayConcreteNode';
const {getRawType, isAbstractType, getNullableType} = SchemaUtils;

declare function generate(node: Batch): RequestNode;
declare function generate(node: Fragment): ConcreteFragment;

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(node: Batch | Fragment): RequestNode | ConcreteFragment {
  invariant(
    ['Batch', 'Fragment'].indexOf(node.kind) >= 0,
    'RelayCodeGenerator: Unknown AST kind `%s`. Source: %s.',
    node.kind,
    getErrorMessage(node),
  );
  return IRVisitor.visit(node, RelayCodeGenVisitor);
}

const RelayCodeGenVisitor = {
  leave: {
    Batch(node): RequestNode {
      return {
        kind: 'Operation',
        operation: node.operation.operation,
        name: node.operation.name,
        id: node.id,
        metadata: node.metadata,
        argumentDefinitions: node.operation.argumentDefinitions,
        selections: node.operation.selections,
        fragment: node.fragment,
        text: node.text,
      };
    },

    Root(node): $Shape<ConcreteOperation> {
      return {
        kind: 'Operation',
        operation: node.operation,
        name: node.name,
        argumentDefinitions: node.argumentDefinitions,
        selections: flattenArray(node.selections),
      };
    },

    Fragment(node): ConcreteFragment {
      return {
        kind: 'Fragment',
        name: node.name,
        type: node.type.toString(),
        metadata: node.metadata || null,
        argumentDefinitions: node.argumentDefinitions,
        selections: flattenArray(node.selections),
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
      const handles =
        (node.handles &&
          node.handles.map(handle => {
            return {
              kind: 'LinkedHandle',
              alias: node.alias,
              name: node.name,
              args: valuesOrNull(sortByName(node.args)),
              handle: handle.name,
              key: handle.key,
              filters: handle.filters,
            };
          })) ||
        [];
      const type = getRawType(node.type);
      return [
        {
          kind: 'LinkedField',
          alias: node.alias,
          name: node.name,
          storageKey: getStorageKey(node.name, node.args),
          args: valuesOrNull(sortByName(node.args)),
          concreteType: !isAbstractType(type) ? type.toString() : null,
          plural: isPlural(node.type),
          selections: flattenArray(node.selections),
        },
        ...handles,
      ];
    },

    ScalarField(node): Array<ConcreteSelection> {
      const handles =
        (node.handles &&
          node.handles.map(handle => {
            return {
              kind: 'ScalarHandle',
              alias: node.alias,
              name: node.name,
              args: valuesOrNull(sortByName(node.args)),
              handle: handle.name,
              key: handle.key,
              filters: handle.filters,
            };
          })) ||
        [];
      return [
        {
          kind: 'ScalarField',
          alias: node.alias,
          name: node.name,
          args: valuesOrNull(sortByName(node.args)),
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

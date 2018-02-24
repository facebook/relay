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

const invariant = require('invariant');
// TODO T21875029 ../../relay-runtime/util/stableCopy
const stableCopy = require('stableCopy');

const {getStorageKey} = require('RelayRuntime');
const {GraphQLList} = require('graphql');
const {IRVisitor, SchemaUtils} = require('graphql-compiler');

// TODO T21875029 ../../relay-runtime/util/RelayConcreteNode
import type {
  ConcreteArgument,
  ConcreteArgumentDefinition,
  ConcreteFragment,
  ConcreteField,
  ConcreteLinkedField,
  ConcreteSelection,
  ConcreteScalarField,
  RequestNode,
} from 'RelayConcreteNode';
import type {Batch, Fragment} from 'graphql-compiler';
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
      invariant(node.requests.length !== 0, 'Batch must contain Requests.');
      if (isSingleRequest(node)) {
        const request = node.requests[0];
        return {
          kind: 'Request',
          operationKind: request.root.operation,
          name: node.name,
          id: request.id,
          text: request.text,
          metadata: node.metadata,
          fragment: node.fragment,
          operation: {
            kind: 'Operation',
            name: request.root.name,
            argumentDefinitions: request.root.argumentDefinitions,
            selections: flattenArray(request.root.selections),
          },
        };
      } else {
        return {
          kind: 'BatchRequest',
          operationKind: node.requests[0].root.operation,
          name: node.name,
          metadata: node.metadata,
          fragment: node.fragment,
          requests: node.requests.map(request => {
            const isDeferrableFragment =
              request.metadata && request.metadata.deferrable;
            const operation = isDeferrableFragment
              ? {
                  kind: 'DeferrableOperation',
                  name: request.root.name,
                  argumentDefinitions: request.root.argumentDefinitions,
                  selections: flattenArray(request.root.selections),
                  fragmentName: request.metadata.fragmentName,
                  rootFieldVariable: request.metadata.rootFieldVariable,
                }
              : {
                  kind: 'Operation',
                  name: request.root.name,
                  argumentDefinitions: request.root.argumentDefinitions,
                  selections: flattenArray(request.root.selections),
                };

            return {
              name: request.name,
              id: request.id,
              text: request.text,
              argumentDependencies: request.argumentDependencies.map(
                dependency => ({
                  name: dependency.argumentName,
                  fromRequestName: dependency.fromName,
                  fromRequestPath: dependency.fromPath,
                  ifList: dependency.ifList,
                  ifNull: dependency.ifNull,
                  maxRecurse: dependency.maxRecurse,
                }),
              ),
              operation,
            };
          }),
        };
      }
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

    DeferrableFragmentSpread(node): ConcreteSelection {
      return {
        kind: 'DeferrableFragmentSpread',
        name: node.name,
        args: valuesOrNull(sortByName(node.args)),
        rootFieldVariable: node.rootFieldVariable,
        storageKey: node.storageKey,
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
      // Note: it is important that the arguments of this field be sorted to
      // ensure stable generation of storage keys for equivalent arguments
      // which may have originally appeared in different orders across an app.
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
      const field: ConcreteLinkedField = {
        kind: 'LinkedField',
        alias: node.alias,
        name: node.name,
        storageKey: null,
        args: valuesOrNull(sortByName(node.args)),
        concreteType: !isAbstractType(type) ? type.toString() : null,
        plural: isPlural(node.type),
        selections: flattenArray(node.selections),
      };
      // Precompute storageKey if possible
      field.storageKey = getStaticStorageKey(field);
      return [field].concat(handles);
    },

    ScalarField(node): Array<ConcreteSelection> {
      // Note: it is important that the arguments of this field be sorted to
      // ensure stable generation of storage keys for equivalent arguments
      // which may have originally appeared in different orders across an app.
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
      const field: ConcreteScalarField = {
        kind: 'ScalarField',
        alias: node.alias,
        name: node.name,
        args: valuesOrNull(sortByName(node.args)),
        selections: valuesOrUndefined(flattenArray(node.selections)),
        storageKey: null,
      };
      // Precompute storageKey if possible
      field.storageKey = getStaticStorageKey(field);
      return [field].concat(handles);
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
        value: stableCopy(node.value),
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
        JSON.stringify(node.value, null, 2),
        getErrorMessage(ancestors[0]),
      );
      return node.value.value !== null ? node.value : null;
    },
  },
};

function isSingleRequest(batch: Batch): boolean {
  return (
    batch.requests.length === 1 &&
    batch.requests[0].argumentDependencies.length === 0
  );
}

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
 * Pre-computes storage key if possible and advantageous. Storage keys are
 * generated for fields with supplied arguments that are all statically known
 * (ie. literals, no variables) at build time.
 */
function getStaticStorageKey(field: ConcreteField): ?string {
  if (
    !field.args ||
    field.args.length === 0 ||
    field.args.some(arg => arg.kind !== 'Literal')
  ) {
    return null;
  }
  return getStorageKey(field, {});
}

module.exports = {generate};

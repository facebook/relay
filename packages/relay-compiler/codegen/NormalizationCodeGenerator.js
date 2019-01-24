/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const IRVisitor = require('../core/GraphQLIRVisitor');
const SchemaUtils = require('../core/GraphQLSchemaUtils');

const {
  createCompilerError,
  createUserError,
} = require('../core/RelayCompilerError');
const {GraphQLList} = require('graphql');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {Metadata, Root, SplitOperation} from '../core/GraphQLIR';
import type {
  NormalizationArgument,
  NormalizationArgumentDefinition,
  NormalizationDefer,
  NormalizationField,
  NormalizationLinkedField,
  NormalizationMatchField,
  NormalizationOperation,
  ConcreteRequest,
  NormalizationScalarField,
  NormalizationSelection,
  NormalizationSplitOperation,
  NormalizationStream,
} from 'relay-runtime';
const {getRawType, isAbstractType, getNullableType} = SchemaUtils;

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
declare function generate(node: Root): NormalizationOperation;
declare function generate(node: SplitOperation): NormalizationSplitOperation;
function generate(node) {
  if (node.kind !== 'Root' && node.kind !== 'SplitOperation') {
    throw createCompilerError(
      `NormalizationCodeGenerator: Unsupported AST kind '${node.kind}'.`,
      [node.loc],
    );
  }
  return IRVisitor.visit(node, NormalizationCodeGenVisitor);
}

const NormalizationCodeGenVisitor = {
  leave: {
    Root(node): NormalizationOperation {
      return {
        kind: 'Operation',
        name: node.name,
        argumentDefinitions: node.argumentDefinitions,
        selections: flattenArray(node.selections),
      };
    },

    Request(node): empty {
      throw createCompilerError(
        'NormalizationCodeGenerator: unexpected Request node.',
      );
    },

    Fragment(node): empty {
      throw createCompilerError(
        'NormalizationCodeGenerator: unexpected Fragment node.',
      );
    },

    LocalArgumentDefinition(node): NormalizationArgumentDefinition {
      return {
        kind: 'LocalArgument',
        name: node.name,
        type: node.type.toString(),
        defaultValue: node.defaultValue,
      };
    },

    RootArgumentDefinition(node): NormalizationArgumentDefinition {
      return {
        kind: 'RootArgument',
        name: node.name,
        type: node.type ? node.type.toString() : null,
      };
    },

    Condition(node, key, parent, ancestors): NormalizationSelection {
      if (node.condition.kind !== 'Variable') {
        throw createCompilerError(
          "NormalizationCodeGenerator: Expected 'Condition' with static " +
            'value to be pruned or inlined',
          [node.condition.loc],
        );
      }
      return {
        kind: 'Condition',
        passingValue: node.passingValue,
        condition: node.condition.variableName,
        selections: flattenArray(node.selections),
      };
    },

    Defer(node, key, parent, ancestors): NormalizationDefer {
      if (
        !(
          node.if == null ||
          node.if.kind === 'Variable' ||
          (node.if.kind === 'Literal' && node.if.value === true)
        )
      ) {
        throw createCompilerError(
          'NormalizationCodeGenerator: Expected @defer `if` condition to be ' +
            'a variable, unspecified, or the literal `true`.',
          [node.if?.loc ?? node.loc],
        );
      }
      return {
        if: node.if?.kind === 'Variable' ? node.if.variableName : null,
        kind: 'Defer',
        label: node.label,
        metadata: node.metadata,
        selections: flattenArray(node.selections),
      };
    },

    FragmentSpread(node): Array<empty> {
      // TODO(T37646905) enable this invariant after splitting the
      // RelayCodeGenerator-test and running the InlineFragmentsTransform on
      // normalization ASTs.
      //
      //   throw new Error(
      //     'NormalizationCodeGenerator: unexpected FragmentSpread node.',
      //   );
      return [];
    },

    InlineFragment(node): NormalizationSelection {
      return {
        kind: 'InlineFragment',
        type: node.typeCondition.toString(),
        selections: flattenArray(node.selections),
      };
    },

    LinkedField(node): Array<NormalizationSelection> {
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
      let field: NormalizationLinkedField = {
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
      const storageKey = getStaticStorageKey(field, node.metadata);
      if (storageKey) {
        field = {...field, storageKey};
      }
      return [field].concat(handles);
    },

    MatchField(node, key, parent, ancestors): NormalizationMatchField {
      const selections = flattenArray(node.selections);
      const matchesByType = {};
      selections.forEach(selection => {
        if (
          selection.kind === 'ScalarField' &&
          selection.name === '__typename'
        ) {
          // The RelayGenerateTypename transform will add a __typename selection
          // to the selections of the match field.
          return;
        }
        if (selection.kind !== 'MatchBranch') {
          throw createCompilerError(
            `NormalizationCodeGenerator: Expected selection for MatchField '${
              node.name
            }' to be a 'MatchBranch', got '${selection.kind}'.`,
            [selection.loc],
          );
        }
        if (matchesByType.hasOwnProperty(selection.type)) {
          throw createCompilerError(
            'NormalizationCodeGenerator: Each @match type can appear at-most ' +
              `once. Type '${String(selection.type)}' was duplicated.`,
            selection.type,
            [selection.loc],
          );
        }
        const fragmentName = selection.name;
        const regExpMatch = fragmentName.match(
          /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
        );
        if (!regExpMatch) {
          throw createCompilerError(
            'NormalizationCodeGenerator: @match fragments should be named ' +
              `'FragmentName_propName', got '${fragmentName}'.`,
            [selection.loc],
          );
        }
        const fragmentPropName = regExpMatch[2] ?? 'matchData';
        matchesByType[selection.type] = {
          fragmentPropName,
          fragmentName,
        };
      });
      let field: NormalizationMatchField = {
        kind: 'MatchField',
        alias: node.alias,
        name: node.name,
        storageKey: null,
        args: valuesOrNull(sortByName(node.args)),
        matchesByType,
      };
      // Precompute storageKey if possible
      const storageKey = getStaticStorageKey(field, node.metadata);
      if (storageKey) {
        field = {...field, storageKey};
      }
      return field;
    },

    ScalarField(node): Array<NormalizationSelection> {
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
      let field: NormalizationScalarField = {
        kind: 'ScalarField',
        alias: node.alias,
        name: node.name,
        args: valuesOrNull(sortByName(node.args)),
        storageKey: null,
      };
      // Precompute storageKey if possible
      const storageKey = getStaticStorageKey(field, node.metadata);
      if (storageKey) {
        field = {...field, storageKey};
      }
      return [field].concat(handles);
    },

    SplitOperation(node, key, parent): NormalizationSplitOperation {
      return {
        kind: 'SplitOperation',
        name: node.name,
        metadata: node.metadata,
        selections: flattenArray(node.selections),
      };
    },

    Stream(node, key, parent, ancestors): NormalizationStream {
      if (
        !(
          node.if == null ||
          node.if.kind === 'Variable' ||
          (node.if.kind === 'Literal' && node.if.value === true)
        )
      ) {
        throw createCompilerError(
          'NormalizationCodeGenerator: Expected @stream `if` condition to be ' +
            'a variable, unspecified, or the literal `true`.',
          [node.if?.loc ?? node.loc],
        );
      }
      return {
        if: node.if?.kind === 'Variable' ? node.if.variableName : null,
        kind: 'Stream',
        label: node.label,
        metadata: node.metadata,
        selections: flattenArray(node.selections),
      };
    },

    Variable(node, key, parent): NormalizationArgument {
      return {
        kind: 'Variable',
        name: parent.name,
        variableName: node.variableName,
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Literal(node, key, parent): NormalizationArgument {
      return {
        kind: 'Literal',
        name: parent.name,
        value: stableCopy(node.value),
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Argument(node, key, parent, ancestors): ?NormalizationArgument {
      if (!['Variable', 'Literal'].includes(node.value.kind)) {
        throw createUserError(
          'RelayCodeGenerator: Complex argument values (Lists or ' +
            'InputObjects with nested variables) are not supported.',
          [node.value.loc],
        );
      }
      return node.value.value !== null ? node.value : null;
    },
  },
};

function isPlural(type: any): boolean {
  return getNullableType(type) instanceof GraphQLList;
}

function valuesOrNull<T>(array: ?$ReadOnlyArray<T>): ?$ReadOnlyArray<T> {
  return !array || array.length === 0 ? null : array;
}

function flattenArray<T>(
  array: $ReadOnlyArray<$ReadOnlyArray<T>>,
): $ReadOnlyArray<T> {
  return array ? Array.prototype.concat.apply([], array) : [];
}

function sortByName<T: {name: string}>(
  array: $ReadOnlyArray<T>,
): $ReadOnlyArray<T> {
  return array instanceof Array
    ? array
        .slice()
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    : array;
}

/**
 * Pre-computes storage key if possible and advantageous. Storage keys are
 * generated for fields with supplied arguments that are all statically known
 * (ie. literals, no variables) at build time.
 */
function getStaticStorageKey(
  field: NormalizationField,
  metadata: Metadata,
): ?string {
  const metadataStorageKey = metadata?.storageKey;
  if (typeof metadataStorageKey === 'string') {
    return metadataStorageKey;
  }
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

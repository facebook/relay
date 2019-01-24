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

const CodeMarker = require('../util/CodeMarker');
const IRVisitor = require('../core/GraphQLIRVisitor');
const SchemaUtils = require('../core/GraphQLSchemaUtils');

const {
  createCompilerError,
  createUserError,
} = require('../core/RelayCompilerError');
const {GraphQLList} = require('graphql');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {Metadata, Fragment} from '../core/GraphQLIR';
import type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderField,
  ReaderFragment,
  ReaderLinkedField,
  ReaderMatchField,
  ReaderScalarField,
  ReaderSelection,
  ReaderSplitOperation,
} from 'relay-runtime';
const {getRawType, isAbstractType, getNullableType} = SchemaUtils;

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(node: Fragment): ReaderFragment {
  return IRVisitor.visit(node, ReaderCodeGenVisitor);
}

const ReaderCodeGenVisitor = {
  leave: {
    Request(node): empty {
      throw createCompilerError('ReaderCodeGenerator: unexpeted Request node.');
    },

    Fragment(node): ReaderFragment {
      let metadata = null;
      if (node.metadata != null) {
        const {mask, plural, connection, refetch} = node.metadata;
        if (Array.isArray(connection)) {
          metadata = metadata ?? {};
          metadata.connection = (connection: any);
        }
        if (typeof mask === 'boolean') {
          metadata = metadata ?? {};
          metadata.mask = mask;
        }
        if (typeof plural === 'boolean') {
          metadata = metadata ?? {};
          metadata.plural = plural;
        }
        if (typeof refetch === 'object') {
          metadata = metadata ?? {};
          metadata.refetch = {
            connection: (refetch.connection: any),
            operation: CodeMarker.moduleDependency(
              (refetch.operation: any) + '.graphql',
            ),
            fragmentPathInResult: (refetch.fragmentPathInResult: any),
          };
        }
      }
      return {
        kind: 'Fragment',
        name: node.name,
        type: node.type.toString(),
        metadata,
        argumentDefinitions: node.argumentDefinitions,
        selections: node.selections,
      };
    },

    LocalArgumentDefinition(node): ReaderArgumentDefinition {
      return {
        kind: 'LocalArgument',
        name: node.name,
        type: node.type.toString(),
        defaultValue: node.defaultValue,
      };
    },

    RootArgumentDefinition(node): ReaderArgumentDefinition {
      return {
        kind: 'RootArgument',
        name: node.name,
        type: node.type ? node.type.toString() : null,
      };
    },

    Condition(node, key, parent, ancestors): ReaderSelection {
      if (node.condition.kind !== 'Variable') {
        throw createCompilerError(
          "ReaderCodeGenerator: Expected 'Condition' with static value to be " +
            'pruned or inlined',
          [node.condition.loc],
        );
      }
      return {
        kind: 'Condition',
        passingValue: node.passingValue,
        condition: node.condition.variableName,
        selections: node.selections,
      };
    },

    FragmentSpread(node): ReaderSelection {
      return {
        kind: 'FragmentSpread',
        name: node.name,
        args: valuesOrNull(sortByName(node.args)),
      };
    },

    InlineFragment(node): ReaderSelection {
      return {
        kind: 'InlineFragment',
        type: node.typeCondition.toString(),
        selections: node.selections,
      };
    },

    LinkedField(node): ReaderSelection {
      // Note: it is important that the arguments of this field be sorted to
      // ensure stable generation of storage keys for equivalent arguments
      // which may have originally appeared in different orders across an app.

      // TODO(T37646905) enable this invariant after splitting the
      // RelayCodeGenerator-test and running the RelayFieldHandleTransform on
      // Reader ASTs.
      //
      //   invariant(
      //     node.handles == null,
      //     'ReaderCodeGenerator: unexpected handles',
      //   );

      const type = getRawType(node.type);
      let field: ReaderLinkedField = {
        kind: 'LinkedField',
        alias: node.alias,
        name: node.name,
        storageKey: null,
        args: valuesOrNull(sortByName(node.args)),
        concreteType: !isAbstractType(type) ? type.toString() : null,
        plural: isPlural(node.type),
        selections: node.selections,
      };
      // Precompute storageKey if possible
      const storageKey = getStaticStorageKey(field, node.metadata);
      if (storageKey) {
        field = {...field, storageKey};
      }
      return field;
    },

    MatchField(node, key, parent, ancestors): ReaderMatchField {
      const matchesByType = {};
      node.selections.forEach(selection => {
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
            `ReaderCodeGenerator: Expected selection for MatchField '${
              node.name
            }' to be a 'MatchBranch', got '${selection.kind}'.`,
            [selection.loc],
          );
        }
        if (matchesByType.hasOwnProperty(selection.type)) {
          throw createCompilerError(
            'ReaderCodeGenerator: Each @match type can appear at-most once. ' +
              `Type '${String(selection.type)}' was duplicated.`,
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
            'ReaderCodeGenerator: @match fragments should be named ' +
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
      let field: ReaderMatchField = {
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

    ScalarField(node): ReaderSelection {
      // Note: it is important that the arguments of this field be sorted to
      // ensure stable generation of storage keys for equivalent arguments
      // which may have originally appeared in different orders across an app.

      // TODO(T37646905) enable this invariant after splitting the
      // RelayCodeGenerator-test and running the RelayFieldHandleTransform on
      // Reader ASTs.
      //
      //   invariant(
      //     node.handles == null,
      //     'ReaderCodeGenerator: unexpected handles',
      //   );

      let field: ReaderScalarField = {
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
      return field;
    },

    SplitOperation(node, key, parent): ReaderSplitOperation {
      return {
        kind: 'SplitOperation',
        name: node.name,
        metadata: null,
        selections: node.selections,
      };
    },

    Variable(node, key, parent): ReaderArgument {
      return {
        kind: 'Variable',
        name: parent.name,
        variableName: node.variableName,
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Literal(node, key, parent): ReaderArgument {
      return {
        kind: 'Literal',
        name: parent.name,
        value: stableCopy(node.value),
        type: parent.type ? parent.type.toString() : null,
      };
    },

    Argument(node, key, parent, ancestors): ?ReaderArgument {
      if (!['Variable', 'Literal'].includes(node.value.kind)) {
        const valueString = JSON.stringify(node.value, null, 2);
        throw createUserError(
          'ReaderCodeGenerator: Complex argument values (Lists or ' +
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
function getStaticStorageKey(field: ReaderField, metadata: Metadata): ?string {
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

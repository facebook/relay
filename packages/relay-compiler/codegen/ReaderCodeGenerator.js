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

const invariant = require('invariant');

const {GraphQLList} = require('graphql');
const {IRVisitor, SchemaUtils} = require('graphql-compiler');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {Metadata, Fragment} from 'graphql-compiler';
import type {
  ConcreteArgument,
  ConcreteArgumentDefinition,
  ConcreteField,
  ConcreteFragment,
  ConcreteLinkedField,
  ConcreteMatchField,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteSplitOperation,
} from 'relay-runtime';
const {getRawType, isAbstractType, getNullableType} = SchemaUtils;

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(node: Fragment): ConcreteFragment {
  return IRVisitor.visit(node, ReaderCodeGenVisitor);
}

const ReaderCodeGenVisitor = {
  leave: {
    Request(node): empty {
      throw new Error('ReaderCodeGenerator: unexpeted Request node.');
    },

    Fragment(node): ConcreteFragment {
      return {
        kind: 'Fragment',
        name: node.name,
        type: node.type.toString(),
        metadata: node.metadata || null,
        argumentDefinitions: node.argumentDefinitions,
        selections: node.selections,
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
        selections: node.selections,
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
        selections: node.selections,
      };
    },

    LinkedField(node): ConcreteSelection {
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
      let field: ConcreteLinkedField = {
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

    MatchField(node, key, parent, ancestors): ConcreteMatchField {
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
        invariant(
          selection.kind === 'MatchBranch',
          'RelayCodeGenerator: Expected selection for MatchField %s to be ' +
            'a `MatchBranch`, but instead got `%s`. Source: `%s`.',
          node.alias ?? node.name,
          selection.kind,
          getErrorMessage(ancestors[0]),
        );
        invariant(
          !matchesByType.hasOwnProperty(selection.type),
          'RelayCodeGenerator: Each "match" type has to appear at-most once. ' +
            'Type `%s` was duplicated. Source: %s.',
          selection.type,
          getErrorMessage(ancestors[0]),
        );
        const fragmentName = selection.name;
        const regExpMatch = fragmentName.match(
          /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
        );
        if (!regExpMatch) {
          throw new Error(
            'RelayMatchTransform: Fragments should be named ' +
              '`FragmentName_fragmentPropName`, got `' +
              fragmentName +
              '`.',
          );
        }
        const fragmentPropName = regExpMatch[2] ?? 'matchData';
        matchesByType[selection.type] = {
          fragmentPropName,
          fragmentName,
        };
      });
      let field: ConcreteMatchField = {
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

    ScalarField(node): ConcreteSelection {
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

      let field: ConcreteScalarField = {
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

    SplitOperation(node, key, parent): ConcreteSplitOperation {
      return {
        kind: 'SplitOperation',
        name: node.name,
        metadata: null,
        selections: node.selections,
      };
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
      if (!['Variable', 'Literal'].includes(node.value.kind)) {
        const valueString = JSON.stringify(node.value, null, 2);
        throw new Error(
          'RelayCodeGenerator: Complex argument values (Lists or ' +
            'InputObjects with nested variables) are not supported, argument ' +
            `\`${node.name}\` had value \`${valueString}\`. ` +
            `Source: ${getErrorMessage(ancestors[0])}.`,
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

function getErrorMessage(node: any): string {
  return `document ${node.name}`;
}

/**
 * Pre-computes storage key if possible and advantageous. Storage keys are
 * generated for fields with supplied arguments that are all statically known
 * (ie. literals, no variables) at build time.
 */
function getStaticStorageKey(
  field: ConcreteField,
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

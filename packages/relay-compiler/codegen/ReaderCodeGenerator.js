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
const SchemaUtils = require('../core/GraphQLSchemaUtils');

const {
  createCompilerError,
  createUserError,
} = require('../core/RelayCompilerError');
const {GraphQLList} = require('graphql');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {
  Argument,
  ClientExtension,
  Metadata,
  Fragment,
  Selection,
} from '../core/GraphQLIR';
import type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderConnectionField,
  ReaderField,
  ReaderFragment,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderScalarField,
  ReaderSelection,
} from 'relay-runtime';
const {getRawType, isAbstractType, getNullableType} = SchemaUtils;

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(node: Fragment): ReaderFragment {
  if (node == null) {
    return node;
  }

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
        // $FlowFixMe
        connection: refetch.connection,
        // $FlowFixMe
        operation: CodeMarker.moduleDependency(refetch.operation + '.graphql'),
        // $FlowFixMe
        fragmentPathInResult: refetch.fragmentPathInResult,
      };
    }
  }
  return {
    kind: 'Fragment',
    name: node.name,
    type: node.type.toString(),
    // $FlowFixMe
    metadata,
    argumentDefinitions: generateArgumentDefinitions(node.argumentDefinitions),
    selections: generateSelections(node.selections),
  };
}

function generateSelections(
  selections: $ReadOnlyArray<Selection>,
): $ReadOnlyArray<ReaderSelection> {
  return selections
    .map(selection => {
      switch (selection.kind) {
        case 'ClientExtension':
          return generateClientExtension(selection);
        case 'FragmentSpread':
          return generateFragmentSpread(selection);
        case 'Condition':
          return generateCondition(selection);
        case 'ScalarField':
          return generateScalarField(selection);
        case 'ModuleImport':
          return generateModuleImport(selection);
        case 'InlineDataFragmentSpread':
          return generateInlineDataFragmentSpread(selection);
        case 'InlineFragment':
          return generateInlineFragment(selection);
        case 'LinkedField':
          return generateLinkedField(selection);
        case 'ConnectionField':
          return generateConnectionField(selection);
        case 'Defer':
        case 'Stream':
          throw createCompilerError(
            `Unexpected ${selection.kind} IR node in ReaderCodeGenerator.`,
            [selection.loc],
          );
        default:
          (selection: empty);
          throw new Error();
      }
    })
    .filter(Boolean);
}

function generateArgumentDefinitions(
  nodes,
): $ReadOnlyArray<ReaderArgumentDefinition> {
  return nodes.map(node => {
    switch (node.kind) {
      case 'LocalArgumentDefinition':
        return {
          kind: 'LocalArgument',
          name: node.name,
          type: node.type.toString(),
          defaultValue: node.defaultValue,
        };
      case 'RootArgumentDefinition':
        return {
          kind: 'RootArgument',
          name: node.name,
          type: node.type ? node.type.toString() : null,
        };
      default:
        (node: empty);
        throw new Error();
    }
  });
}

function generateClientExtension(node: ClientExtension): ReaderSelection {
  return {
    kind: 'ClientExtension',
    selections: generateSelections(node.selections),
  };
}

function generateCondition(node): ReaderSelection {
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
    selections: generateSelections(node.selections),
  };
}

function generateFragmentSpread(node): ReaderSelection {
  return {
    kind: 'FragmentSpread',
    name: node.name,
    args: generateArgs(node.args),
  };
}

function generateInlineFragment(node): ReaderSelection {
  return {
    kind: 'InlineFragment',
    type: node.typeCondition.toString(),
    selections: generateSelections(node.selections),
  };
}

function generateInlineDataFragmentSpread(
  node,
): ReaderInlineDataFragmentSpread {
  return {
    kind: 'InlineDataFragmentSpread',
    name: node.name,
    selections: generateSelections(node.selections),
  };
}

function generateLinkedField(node): ReaderLinkedField {
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
    args: generateArgs(node.args),
    concreteType: !isAbstractType(type) ? type.toString() : null,
    plural: isPlural(node.type),
    selections: generateSelections(node.selections),
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateConnectionField(node): ReaderConnectionField {
  const type = getRawType(node.type);
  if (isPlural(node.type)) {
    throw createUserError(
      'Connection fields cannot return a plural (list) value.',
      [node.loc],
    );
  }
  let field: ReaderConnectionField = {
    kind: 'ConnectionField',
    alias: node.alias,
    label: node.label,
    name: node.name,
    resolver: (CodeMarker.moduleDependency(node.resolver): $FlowFixMe),
    storageKey: null,
    args: generateArgs(node.args),
    concreteType: !isAbstractType(type) ? type.toString() : null,
    selections: generateSelections(node.selections),
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateModuleImport(node): ReaderModuleImport {
  const fragmentName = node.name;
  const regExpMatch = fragmentName.match(
    /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
  );
  if (!regExpMatch) {
    throw createCompilerError(
      'ReaderCodeGenerator: @match fragments should be named ' +
        `'FragmentName_propName', got '${fragmentName}'.`,
      [node.loc],
    );
  }
  const fragmentPropName = regExpMatch[2];
  if (typeof fragmentPropName !== 'string') {
    throw createCompilerError(
      'ReaderCodeGenerator: @module fragments should be named ' +
        `'FragmentName_propName', got '${fragmentName}'.`,
      [node.loc],
    );
  }
  return {
    kind: 'ModuleImport',
    documentName: node.documentName,
    fragmentName,
    fragmentPropName,
  };
}

function generateScalarField(node): ReaderScalarField {
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
    args: generateArgs(node.args),
    storageKey: null,
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateArgument(node: Argument): ReaderArgument | null {
  const value = node.value;
  switch (value.kind) {
    case 'Variable':
      return {
        kind: 'Variable',
        name: node.name,
        variableName: value.variableName,
      };
    case 'Literal':
      return value.value === null
        ? null
        : {
            kind: 'Literal',
            name: node.name,
            value: stableCopy(value.value),
          };
    default:
      throw createUserError(
        'ReaderCodeGenerator: Complex argument values (Lists or ' +
          'InputObjects with nested variables) are not supported.',
        [node.value.loc],
      );
  }
}

function isPlural(type: any): boolean {
  return getNullableType(type) instanceof GraphQLList;
}

function generateArgs(
  args: $ReadOnlyArray<Argument>,
): ?$ReadOnlyArray<ReaderArgument> {
  const concreteArguments = [];
  args.forEach(arg => {
    const concreteArgument = generateArgument(arg);
    if (concreteArgument !== null) {
      concreteArguments.push(concreteArgument);
    }
  });
  return concreteArguments.length === 0
    ? null
    : concreteArguments.sort(nameComparator);
}

function nameComparator(a: {+name: string}, b: {+name: string}): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
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

module.exports = {
  generate,
};

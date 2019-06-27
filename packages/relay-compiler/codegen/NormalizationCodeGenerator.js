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
  Root,
  Selection,
  SplitOperation,
} from '../core/GraphQLIR';
import type {
  NormalizationArgument,
  NormalizationDefer,
  NormalizationConnectionField,
  NormalizationField,
  NormalizationLinkedField,
  NormalizationLinkedHandle,
  NormalizationLocalArgumentDefinition,
  NormalizationModuleImport,
  NormalizationOperation,
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
function generate(
  node: any,
): NormalizationOperation | NormalizationSplitOperation {
  switch (node.kind) {
    case 'Root':
      return generateRoot(node);
    case 'SplitOperation':
      return generateSplitOperation(node);
    default:
      throw createCompilerError(
        `NormalizationCodeGenerator: Unsupported AST kind '${node.kind}'.`,
        [node.loc],
      );
  }
}

function generateRoot(node: Root): NormalizationOperation {
  return {
    kind: 'Operation',
    name: node.name,
    argumentDefinitions: generateArgumentDefinitions(node.argumentDefinitions),
    selections: generateSelections(node.selections),
  };
}

function generateSplitOperation(node, key): NormalizationSplitOperation {
  return {
    kind: 'SplitOperation',
    name: node.name,
    metadata: node.metadata,
    selections: generateSelections(node.selections),
  };
}

function generateSelections(
  selections: $ReadOnlyArray<Selection>,
): $ReadOnlyArray<NormalizationSelection> {
  const normalizationSelections: Array<NormalizationSelection> = [];
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'InlineDataFragmentSpread':
      case 'FragmentSpread':
        // TODO(T37646905) enable this invariant after splitting the
        // RelayCodeGenerator-test and running the InlineFragmentsTransform on
        // normalization ASTs.
        break;
      case 'Condition':
        normalizationSelections.push(generateCondition(selection));
        break;
      case 'ClientExtension':
        normalizationSelections.push(generateClientExtension(selection));
        break;
      case 'ScalarField':
        normalizationSelections.push(...generateScalarField(selection));
        break;
      case 'ModuleImport':
        normalizationSelections.push(generateModuleImport(selection));
        break;
      case 'InlineFragment':
        normalizationSelections.push(generateInlineFragment(selection));
        break;
      case 'LinkedField':
        normalizationSelections.push(...generateLinkedField(selection));
        break;
      case 'ConnectionField':
        normalizationSelections.push(generateConnectionField(selection));
        break;
      case 'Defer':
        normalizationSelections.push(generateDefer(selection));
        break;
      case 'Stream':
        normalizationSelections.push(generateStream(selection));
        break;
      default:
        (selection: empty);
        throw new Error();
    }
  });
  return normalizationSelections;
}

function generateArgumentDefinitions(
  nodes,
): $ReadOnlyArray<NormalizationLocalArgumentDefinition> {
  return nodes.map(node => {
    return {
      kind: 'LocalArgument',
      name: node.name,
      type: node.type.toString(),
      defaultValue: node.defaultValue,
    };
  });
}

function generateClientExtension(
  node: ClientExtension,
): NormalizationSelection {
  return {
    kind: 'ClientExtension',
    selections: generateSelections(node.selections),
  };
}

function generateCondition(node, key): NormalizationSelection {
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
    selections: generateSelections(node.selections),
  };
}

function generateDefer(node, key): NormalizationDefer {
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
    if:
      node.if != null && node.if.kind === 'Variable'
        ? node.if.variableName
        : null,
    kind: 'Defer',
    label: node.label,
    metadata: node.metadata,
    selections: generateSelections(node.selections),
  };
}

function generateInlineFragment(node): NormalizationSelection {
  return {
    kind: 'InlineFragment',
    type: node.typeCondition.toString(),
    selections: generateSelections(node.selections),
  };
}

function generateLinkedField(node): $ReadOnlyArray<NormalizationSelection> {
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.
  const handles =
    (node.handles &&
      node.handles.map(handle => {
        let handleNode: NormalizationLinkedHandle = {
          kind: 'LinkedHandle',
          alias: node.alias,
          name: node.name,
          args: generateArgs(node.args),
          handle: handle.name,
          key: handle.key,
          filters: handle.filters,
        };
        // T45504512: new connection model
        // NOTE: this intentionally adds a dynamic key in order to avoid
        // triggering updates to existing queries that do not use dynamic
        // keys.
        if (handle.dynamicKey != null) {
          const dynamicKeyArgName = '__dynamicKey';
          handleNode = {
            ...handleNode,
            dynamicKey: {
              kind: 'Variable',
              name: dynamicKeyArgName,
              variableName: handle.dynamicKey.variableName,
            },
          };
        }
        return handleNode;
      })) ||
    [];
  const type = getRawType(node.type);
  let field: NormalizationLinkedField = {
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
  return [field].concat(handles);
}

function generateConnectionField(node): NormalizationSelection {
  // TODO
  const type = getRawType(node.type);
  if (isPlural(node.type)) {
    throw createUserError(
      'Connection fields cannot return a plural (list) value.',
      [node.loc],
    );
  }
  let field: NormalizationConnectionField = {
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

function generateModuleImport(node, key): NormalizationModuleImport {
  const fragmentName = node.name;
  const regExpMatch = fragmentName.match(
    /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
  );
  if (!regExpMatch) {
    throw createCompilerError(
      'NormalizationCodeGenerator: @module fragments should be named ' +
        `'FragmentName_propName', got '${fragmentName}'.`,
      [node.loc],
    );
  }
  const fragmentPropName = regExpMatch[2];
  if (typeof fragmentPropName !== 'string') {
    throw createCompilerError(
      'NormalizationCodeGenerator: @module fragments should be named ' +
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

function generateScalarField(node): Array<NormalizationSelection> {
  if (node.metadata?.skipNormalizationNode) {
    return [];
  }
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.
  const handles =
    (node.handles &&
      node.handles.map(handle => {
        if (handle.dynamicKey != null) {
          throw createUserError(
            'Dynamic key values are not supported on scalar fields.',
            [handle.dynamicKey.loc],
          );
        }
        return {
          kind: 'ScalarHandle',
          alias: node.alias,
          name: node.name,
          args: generateArgs(node.args),
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
    args: generateArgs(node.args),
    storageKey: null,
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return [field].concat(handles);
}

function generateStream(node, key): NormalizationStream {
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
    if:
      node.if != null && node.if.kind === 'Variable'
        ? node.if.variableName
        : null,
    kind: 'Stream',
    label: node.label,
    metadata: node.metadata,
    selections: generateSelections(node.selections),
  };
}

function generateArgument(node: Argument): NormalizationArgument | null {
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
        'NormalizationCodeGenerator: Complex argument values (Lists or ' +
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
): ?$ReadOnlyArray<NormalizationArgument> {
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

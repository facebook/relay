/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {createCompilerError, createUserError} = require('../core/CompilerError');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {
  Argument,
  ArgumentValue,
  ClientExtension,
  Metadata,
  Root,
  Selection,
  SplitOperation,
  LinkedField,
  Defer,
  Stream,
  Condition,
  InlineFragment,
  ModuleImport,
  LocalArgumentDefinition,
} from '../core/IR';
import type {Schema, TypeID} from '../core/Schema';
import type {
  NormalizationArgument,
  NormalizationDefer,
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

/**
 * @public
 *
 * Converts an IR node into a plain JS object representation that can be
 * used at runtime.
 */
declare function generate(
  schema: Schema,
  node: Root,
  sortObjectKeys: boolean,
): NormalizationOperation;
declare function generate(
  schema: Schema,
  node: SplitOperation,
  sortObjectKeys: boolean,
): NormalizationSplitOperation;
function generate(
  schema: Schema,
  node: Root | SplitOperation,
  sortObjectKeys: boolean,
): NormalizationOperation | NormalizationSplitOperation {
  switch (node.kind) {
    case 'Root':
      return generateRoot(schema, node, sortObjectKeys);
    case 'SplitOperation':
      return generateSplitOperation(schema, node, sortObjectKeys);
    default:
      throw createCompilerError(
        `NormalizationCodeGenerator: Unsupported AST kind '${node.kind}'.`,
        [node.loc],
      );
  }
}

function generateRoot(
  schema: Schema,
  node: Root,
  sortObjectKeys: boolean,
): NormalizationOperation {
  return sortObjectKeys
    ? {
        argumentDefinitions: generateArgumentDefinitions(
          schema,
          node.argumentDefinitions,
          sortObjectKeys,
        ),
        kind: 'Operation',
        name: node.name,
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      }
    : {
        kind: 'Operation',
        name: node.name,
        argumentDefinitions: generateArgumentDefinitions(
          schema,
          node.argumentDefinitions,
          sortObjectKeys,
        ),
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      };
}

function generateSplitOperation(
  schema: Schema,
  node: SplitOperation,
  sortObjectKeys: boolean,
): NormalizationSplitOperation {
  return {
    kind: 'SplitOperation',
    metadata: node.metadata,
    name: node.name,
    selections: generateSelections(schema, node.selections, sortObjectKeys),
  };
}

function generateSelections(
  schema: Schema,
  selections: $ReadOnlyArray<Selection>,
  sortObjectKeys: boolean,
): $ReadOnlyArray<NormalizationSelection> {
  const normalizationSelections: Array<NormalizationSelection> = [];
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'Condition':
        normalizationSelections.push(
          generateCondition(schema, selection, sortObjectKeys),
        );
        break;
      case 'ClientExtension':
        normalizationSelections.push(
          generateClientExtension(schema, selection, sortObjectKeys),
        );
        break;
      case 'ScalarField':
        normalizationSelections.push(
          ...generateScalarField(selection, sortObjectKeys),
        );
        break;
      case 'ModuleImport':
        normalizationSelections.push(
          generateModuleImport(selection, sortObjectKeys),
        );
        break;
      case 'InlineFragment':
        normalizationSelections.push(
          generateInlineFragment(schema, selection, sortObjectKeys),
        );
        break;
      case 'LinkedField':
        normalizationSelections.push(
          ...generateLinkedField(schema, selection, sortObjectKeys),
        );
        break;
      case 'Defer':
        normalizationSelections.push(
          generateDefer(schema, selection, sortObjectKeys),
        );
        break;
      case 'Stream':
        normalizationSelections.push(
          generateStream(schema, selection, sortObjectKeys),
        );
        break;
      case 'InlineDataFragmentSpread':
      case 'FragmentSpread':
        throw new createCompilerError(
          `NormalizationCodeGenerator: Unexpected IR node ${selection.kind}.`,
          [selection.loc],
        );
      default:
        (selection: empty);
        throw new Error();
    }
  });
  return normalizationSelections;
}

function generateArgumentDefinitions(
  schema: Schema,
  nodes: $ReadOnlyArray<LocalArgumentDefinition>,
  sortObjectKeys: boolean,
): $ReadOnlyArray<NormalizationLocalArgumentDefinition> {
  return nodes.map(node => {
    return sortObjectKeys
      ? {
          defaultValue: node.defaultValue,
          kind: 'LocalArgument',
          name: node.name,
          type: schema.getTypeString(node.type),
        }
      : {
          kind: 'LocalArgument',
          name: node.name,
          type: schema.getTypeString(node.type),
          defaultValue: node.defaultValue,
        };
  });
}

function generateClientExtension(
  schema: Schema,
  node: ClientExtension,
  sortObjectKeys: boolean,
): NormalizationSelection {
  return {
    kind: 'ClientExtension',
    selections: generateSelections(schema, node.selections, sortObjectKeys),
  };
}

function generateCondition(
  schema: Schema,
  node: Condition,
  sortObjectKeys: boolean,
): NormalizationSelection {
  if (node.condition.kind !== 'Variable') {
    throw createCompilerError(
      "NormalizationCodeGenerator: Expected 'Condition' with static " +
        'value to be pruned or inlined',
      [node.condition.loc],
    );
  }
  return sortObjectKeys
    ? {
        condition: node.condition.variableName,
        kind: 'Condition',
        passingValue: node.passingValue,
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      }
    : {
        kind: 'Condition',
        passingValue: node.passingValue,
        condition: node.condition.variableName,
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      };
}

function generateDefer(
  schema: Schema,
  node: Defer,
  sortObjectKeys: boolean,
): NormalizationDefer {
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
    selections: generateSelections(schema, node.selections, sortObjectKeys),
  };
}

function generateInlineFragment(
  schema: Schema,
  node: InlineFragment,
  sortObjectKeys: boolean,
): NormalizationSelection {
  return sortObjectKeys
    ? {
        kind: 'InlineFragment',
        selections: generateSelections(schema, node.selections, sortObjectKeys),
        type: schema.getTypeString(node.typeCondition),
      }
    : {
        kind: 'InlineFragment',
        type: schema.getTypeString(node.typeCondition),
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      };
}

function generateLinkedField(
  schema: Schema,
  node: LinkedField,
  sortObjectKeys: boolean,
): $ReadOnlyArray<NormalizationSelection> {
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.
  const handles =
    (node.handles &&
      node.handles.map(handle => {
        let handleNode: NormalizationLinkedHandle = sortObjectKeys
          ? {
              alias: node.alias === node.name ? null : node.alias,
              args: generateArgs(node.args, sortObjectKeys),
              filters: handle.filters,
              handle: handle.name,
              key: handle.key,
              kind: 'LinkedHandle',
              name: node.name,
            }
          : {
              kind: 'LinkedHandle',
              alias: node.alias === node.name ? null : node.alias,
              name: node.name,
              args: generateArgs(node.args, sortObjectKeys),
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
  const type = schema.getRawType(node.type);
  let field: NormalizationLinkedField = sortObjectKeys
    ? {
        alias: node.alias === node.name ? null : node.alias,
        args: generateArgs(node.args, sortObjectKeys),
        concreteType: !schema.isAbstractType(type)
          ? schema.getTypeString(type)
          : null,
        kind: 'LinkedField',
        name: node.name,
        plural: isPlural(schema, node.type),
        selections: generateSelections(schema, node.selections, sortObjectKeys),
        storageKey: null,
      }
    : {
        kind: 'LinkedField',
        alias: node.alias === node.name ? null : node.alias,
        name: node.name,
        storageKey: null,
        args: generateArgs(node.args, sortObjectKeys),
        concreteType: !schema.isAbstractType(type)
          ? schema.getTypeString(type)
          : null,
        plural: isPlural(schema, node.type),
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey != null) {
    field = {...field, storageKey};
  }
  return [field].concat(handles);
}

function generateModuleImport(
  node: ModuleImport,
  sortObjectKeys: boolean,
): NormalizationModuleImport {
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
  return sortObjectKeys
    ? {
        documentName: node.key,
        fragmentName,
        fragmentPropName,
        kind: 'ModuleImport',
      }
    : {
        kind: 'ModuleImport',
        documentName: node.key,
        fragmentName,
        fragmentPropName,
      };
}

function generateScalarField(
  node,
  sortObjectKeys: boolean,
): Array<NormalizationSelection> {
  // flowlint-next-line sketchy-null-mixed:off
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
        return sortObjectKeys
          ? {
              alias: node.alias === node.name ? null : node.alias,
              args: generateArgs(node.args, sortObjectKeys),
              filters: handle.filters,
              handle: handle.name,
              key: handle.key,
              kind: 'ScalarHandle',
              name: node.name,
            }
          : {
              kind: 'ScalarHandle',
              alias: node.alias === node.name ? null : node.alias,
              name: node.name,
              args: generateArgs(node.args, sortObjectKeys),
              handle: handle.name,
              key: handle.key,
              filters: handle.filters,
            };
      })) ||
    [];
  let field: NormalizationScalarField = sortObjectKeys
    ? {
        alias: node.alias === node.name ? null : node.alias,
        args: generateArgs(node.args, sortObjectKeys),
        kind: 'ScalarField',
        name: node.name,
        storageKey: null,
      }
    : {
        kind: 'ScalarField',
        alias: node.alias === node.name ? null : node.alias,
        name: node.name,
        args: generateArgs(node.args, sortObjectKeys),
        storageKey: null,
      };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey != null) {
    field = {...field, storageKey};
  }
  return [field].concat(handles);
}

function generateStream(
  schema: Schema,
  node: Stream,
  sortObjectKeys: boolean,
): NormalizationStream {
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
  return sortObjectKeys
    ? {
        if:
          node.if != null && node.if.kind === 'Variable'
            ? node.if.variableName
            : null,
        kind: 'Stream',
        label: node.label,
        metadata: node.metadata,
        selections: generateSelections(schema, node.selections, sortObjectKeys),
        useCustomizedBatch:
          node.useCustomizedBatch != null &&
          node.useCustomizedBatch.kind === 'Variable'
            ? node.useCustomizedBatch.variableName
            : null,
      }
    : {
        if:
          node.if != null && node.if.kind === 'Variable'
            ? node.if.variableName
            : null,
        kind: 'Stream',
        useCustomizedBatch:
          node.useCustomizedBatch != null &&
          node.useCustomizedBatch.kind === 'Variable'
            ? node.useCustomizedBatch.variableName
            : null,
        label: node.label,
        metadata: node.metadata,
        selections: generateSelections(schema, node.selections, sortObjectKeys),
      };
}

function generateArgumentValue(
  name: string,
  value: ArgumentValue,
  sortObjectKeys: boolean,
): NormalizationArgument | null {
  switch (value.kind) {
    case 'Variable':
      return {
        kind: 'Variable',
        name: name,
        variableName: value.variableName,
      };
    case 'Literal':
      return value.value === null
        ? null
        : {
            kind: 'Literal',
            name: name,
            value: stableCopy(value.value),
          };
    case 'ObjectValue': {
      const objectKeys = value.fields.map(field => field.name).sort();
      const objectValues = new Map(
        value.fields.map(field => {
          return [field.name, field.value];
        }),
      );
      return sortObjectKeys
        ? {
            fields: objectKeys.map(fieldName => {
              const fieldValue = objectValues.get(fieldName);
              if (fieldValue == null) {
                throw createCompilerError(
                  'Expected to have object field value',
                );
              }
              return (
                generateArgumentValue(
                  fieldName,
                  fieldValue,
                  sortObjectKeys,
                ) ?? {kind: 'Literal', name: fieldName, value: null}
              );
            }),
            kind: 'ObjectValue',
            name: name,
          }
        : {
            kind: 'ObjectValue',
            name: name,
            fields: objectKeys.map(fieldName => {
              const fieldValue = objectValues.get(fieldName);
              if (fieldValue == null) {
                throw createCompilerError(
                  'Expected to have object field value',
                );
              }
              return (
                generateArgumentValue(
                  fieldName,
                  fieldValue,
                  sortObjectKeys,
                ) ?? {kind: 'Literal', name: fieldName, value: null}
              );
            }),
          };
    }
    case 'ListValue': {
      return sortObjectKeys
        ? {
            items: value.items.map((item, index) => {
              return generateArgumentValue(
                `${name}.${index}`,
                item,
                sortObjectKeys,
              );
            }),
            kind: 'ListValue',
            name: name,
          }
        : {
            kind: 'ListValue',
            name: name,
            items: value.items.map((item, index) => {
              return generateArgumentValue(
                `${name}.${index}`,
                item,
                sortObjectKeys,
              );
            }),
          };
    }
    default:
      throw createUserError(
        'NormalizationCodeGenerator: Complex argument values (Lists or ' +
          'InputObjects with nested variables) are not supported.',
        [value.loc],
      );
  }
}

function generateArgs(
  args: $ReadOnlyArray<Argument>,
  sortObjectKeys: boolean,
): ?$ReadOnlyArray<NormalizationArgument> {
  const concreteArguments = [];
  args.forEach(arg => {
    const concreteArgument = generateArgumentValue(
      arg.name,
      arg.value,
      sortObjectKeys,
    );
    if (concreteArgument !== null) {
      concreteArguments.push(concreteArgument);
    }
  });
  return concreteArguments.length === 0
    ? null
    : concreteArguments.sort(nameComparator);
}

function nameComparator(
  a: {+name: string, ...},
  b: {+name: string, ...},
): number {
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

function isPlural(schema: Schema, type: TypeID): boolean {
  return schema.isList(schema.getNullableType(type));
}

module.exports = {generate};

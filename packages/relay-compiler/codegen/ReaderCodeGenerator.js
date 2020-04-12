/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const CodeMarker = require('../util/CodeMarker');

const {createCompilerError, createUserError} = require('../core/CompilerError');
const {getStorageKey, stableCopy} = require('relay-runtime');

import type {
  Argument,
  ArgumentValue,
  ArgumentDefinition,
  ClientExtension,
  Defer,
  Stream,
  Metadata,
  Fragment,
  Selection,
  Condition,
  LinkedField,
  ScalarField,
  FragmentSpread,
  InlineFragment,
  ModuleImport,
  InlineDataFragmentSpread,
} from '../core/IR';
import type {Schema, TypeID} from '../core/Schema';
import type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderField,
  ReaderFragment,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderRefetchMetadata,
  ReaderScalarField,
  ReaderSelection,
} from 'relay-runtime';

/**
 * @public
 *
 * Converts an IR node into a plain JS object representation that can be
 * used at runtime.
 */
function generate(schema: Schema, node: Fragment): ReaderFragment {
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
    if (refetch != null && typeof refetch === 'object') {
      metadata = metadata ?? {};
      metadata.refetch = {
        // $FlowFixMe
        connection: refetch.connection,
        // $FlowFixMe
        fragmentPathInResult: refetch.fragmentPathInResult,
        operation: CodeMarker.moduleDependency(
          // $FlowFixMe
          refetch.operation + '.graphql',
        ),
      };
      if (typeof refetch.identifierField === 'string') {
        metadata.refetch = {
          ...metadata.refetch,
          identifierField: refetch.identifierField,
        };
      }
    }
  }
  return {
    argumentDefinitions: generateArgumentDefinitions(
      schema,
      node.argumentDefinitions,
    ),
    kind: 'Fragment',
    // $FlowFixMe
    metadata,
    name: node.name,
    selections: generateSelections(schema, node.selections),
    type: schema.getTypeString(node.type),
  };
}

function generateSelections(
  schema: Schema,
  selections: $ReadOnlyArray<Selection>,
): $ReadOnlyArray<ReaderSelection> {
  return selections
    .map(selection => {
      switch (selection.kind) {
        case 'ClientExtension':
          return generateClientExtension(schema, selection);
        case 'FragmentSpread':
          return generateFragmentSpread(schema, selection);
        case 'Condition':
          return generateCondition(schema, selection);
        case 'ScalarField':
          return generateScalarField(schema, selection);
        case 'ModuleImport':
          return generateModuleImport(schema, selection);
        case 'InlineDataFragmentSpread':
          return generateInlineDataFragmentSpread(schema, selection);
        case 'InlineFragment':
          return generateInlineFragment(schema, selection);
        case 'LinkedField':
          return generateLinkedField(schema, selection);
        case 'Defer':
          return generateDefer(schema, selection);
        case 'Stream':
          return generateStream(schema, selection);
        default:
          (selection: empty);
          throw new Error();
      }
    })
    .filter(Boolean);
}

function generateArgumentDefinitions(
  schema: Schema,
  nodes: $ReadOnlyArray<ArgumentDefinition>,
): $ReadOnlyArray<ReaderArgumentDefinition> {
  return nodes.map(node => {
    switch (node.kind) {
      case 'LocalArgumentDefinition':
        return {
          defaultValue: node.defaultValue,
          kind: 'LocalArgument',
          name: node.name,
          type: schema.getTypeString(node.type),
        };
      case 'RootArgumentDefinition':
        return {
          kind: 'RootArgument',
          name: node.name,
          type: node.type ? schema.getTypeString(node.type) : null,
        };
      default:
        throw new Error();
    }
  });
}

function generateClientExtension(
  schema: Schema,
  node: ClientExtension,
): ReaderSelection {
  return {
    kind: 'ClientExtension',
    selections: generateSelections(schema, node.selections),
  };
}

function generateDefer(schema: Schema, node: Defer): ReaderSelection {
  return {
    kind: 'Defer',
    selections: generateSelections(schema, node.selections),
  };
}

function generateStream(schema: Schema, node: Stream): ReaderSelection {
  return {
    kind: 'Stream',
    selections: generateSelections(schema, node.selections),
  };
}

function generateCondition(schema: Schema, node: Condition): ReaderSelection {
  if (node.condition.kind !== 'Variable') {
    throw createCompilerError(
      "ReaderCodeGenerator: Expected 'Condition' with static value to be " +
        'pruned or inlined',
      [node.condition.loc],
    );
  }
  return {
    condition: node.condition.variableName,
    kind: 'Condition',
    passingValue: node.passingValue,
    selections: generateSelections(schema, node.selections),
  };
}

function generateFragmentSpread(
  schema: Schema,
  node: FragmentSpread,
): ReaderSelection {
  return {
    args: generateArgs(node.args),
    kind: 'FragmentSpread',
    name: node.name,
  };
}

function generateInlineFragment(
  schema: Schema,
  node: InlineFragment,
): ReaderSelection {
  return {
    kind: 'InlineFragment',
    selections: generateSelections(schema, node.selections),
    type: schema.getTypeString(node.typeCondition),
  };
}

function generateInlineDataFragmentSpread(
  schema: Schema,
  node: InlineDataFragmentSpread,
): ReaderInlineDataFragmentSpread {
  return {
    kind: 'InlineDataFragmentSpread',
    name: node.name,
    selections: generateSelections(schema, node.selections),
  };
}

function generateLinkedField(
  schema: Schema,
  node: LinkedField,
): ReaderLinkedField {
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.

  // TODO(T37646905) enable this invariant after splitting the
  // RelayCodeGenerator-test and running the FieldHandleTransform on
  // Reader ASTs.
  //
  //   invariant(
  //     node.handles == null,
  //     'ReaderCodeGenerator: unexpected handles',
  //   );
  const rawType = schema.getRawType(node.type);
  let field: ReaderLinkedField = {
    alias: node.alias === node.name ? null : node.alias,
    args: generateArgs(node.args),
    concreteType: !schema.isAbstractType(rawType)
      ? schema.getTypeString(rawType)
      : null,
    kind: 'LinkedField',
    name: node.name,
    plural: isPlural(schema, node.type),
    selections: generateSelections(schema, node.selections),
    storageKey: null,
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateModuleImport(
  schema: Schema,
  node: ModuleImport,
): ReaderModuleImport {
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
    documentName: node.key,
    fragmentName,
    fragmentPropName,
    kind: 'ModuleImport',
  };
}

function generateScalarField(
  schema: Schema,
  node: ScalarField,
): ReaderScalarField {
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.

  // TODO(T37646905) enable this invariant after splitting the
  // RelayCodeGenerator-test and running the FieldHandleTransform on
  // Reader ASTs.
  //
  //   invariant(
  //     node.handles == null,
  //     'ReaderCodeGenerator: unexpected handles',
  //   );

  let field: ReaderScalarField = {
    alias: node.alias === node.name ? null : node.alias,
    args: generateArgs(node.args),
    kind: 'ScalarField',
    name: node.name,
    storageKey: null,
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateArgument(
  name: string,
  value: ArgumentValue,
): ReaderArgument | null {
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
      return {
        fields: objectKeys.map(fieldName => {
          const fieldValue = objectValues.get(fieldName);
          if (fieldValue == null) {
            throw createCompilerError('Expected to have object field value');
          }
          return (
            generateArgument(fieldName, fieldValue) ?? {
              kind: 'Literal',
              name: fieldName,
              value: null,
            }
          );
        }),
        kind: 'ObjectValue',
        name: name,
      };
    }
    case 'ListValue': {
      return {
        items: value.items.map((item, index) => {
          return generateArgument(`${name}.${index}`, item);
        }),
        kind: 'ListValue',
        name: name,
      };
    }
    default:
      throw createUserError(
        'ReaderCodeGenerator: Complex argument values (Lists or ' +
          'InputObjects with nested variables) are not supported.',
        [value.loc],
      );
  }
}

function generateArgs(
  args: $ReadOnlyArray<Argument>,
): ?$ReadOnlyArray<ReaderArgument> {
  const concreteArguments = [];
  args.forEach(arg => {
    const concreteArgument = generateArgument(arg.name, arg.value);
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

function isPlural(schema: Schema, type: TypeID): boolean {
  return schema.isList(schema.getNullableType(type));
}

module.exports = {
  generate,
};

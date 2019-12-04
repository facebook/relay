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
const {
  ConnectionInterface,
  getStorageKey,
  stableCopy,
} = require('relay-runtime');

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
  Connection,
  ConnectionField,
  InlineFragment,
  LocalArgumentDefinition,
} from '../core/IR';
import type {Schema, TypeID} from '../core/Schema';
import type {
  NormalizationArgument,
  NormalizationDefer,
  NormalizationConnection,
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
declare function generate(schema: Schema, node: Root): NormalizationOperation;
declare function generate(
  schema: Schema,
  node: SplitOperation,
): NormalizationSplitOperation;
function generate(
  schema: Schema,
  node: Root | SplitOperation,
): NormalizationOperation | NormalizationSplitOperation {
  switch (node.kind) {
    case 'Root':
      return generateRoot(schema, node);
    case 'SplitOperation':
      return generateSplitOperation(schema, node);
    default:
      throw createCompilerError(
        `NormalizationCodeGenerator: Unsupported AST kind '${node.kind}'.`,
        [node.loc],
      );
  }
}

function generateRoot(schema: Schema, node: Root): NormalizationOperation {
  return {
    kind: 'Operation',
    name: node.name,
    argumentDefinitions: generateArgumentDefinitions(
      schema,
      node.argumentDefinitions,
    ),
    selections: generateSelections(schema, node.selections),
  };
}

function generateSplitOperation(
  schema: Schema,
  node: SplitOperation,
): NormalizationSplitOperation {
  return {
    kind: 'SplitOperation',
    name: node.name,
    metadata: node.metadata,
    selections: generateSelections(schema, node.selections),
  };
}

function generateSelections(
  schema: Schema,
  selections: $ReadOnlyArray<Selection>,
): $ReadOnlyArray<NormalizationSelection> {
  const normalizationSelections: Array<NormalizationSelection> = [];
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'Condition':
        normalizationSelections.push(generateCondition(schema, selection));
        break;
      case 'ClientExtension':
        normalizationSelections.push(
          generateClientExtension(schema, selection),
        );
        break;
      case 'ScalarField':
        normalizationSelections.push(...generateScalarField(selection));
        break;
      case 'ModuleImport':
        normalizationSelections.push(generateModuleImport(selection));
        break;
      case 'InlineFragment':
        normalizationSelections.push(generateInlineFragment(schema, selection));
        break;
      case 'LinkedField':
        normalizationSelections.push(...generateLinkedField(schema, selection));
        break;
      case 'ConnectionField':
        normalizationSelections.push(
          ...generateConnectionField(schema, selection),
        );
        break;
      case 'Connection':
        normalizationSelections.push(generateConnection(schema, selection));
        break;
      case 'Defer':
        normalizationSelections.push(generateDefer(schema, selection));
        break;
      case 'Stream':
        normalizationSelections.push(generateStream(schema, selection));
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
): $ReadOnlyArray<NormalizationLocalArgumentDefinition> {
  return nodes.map(node => {
    return {
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
): NormalizationSelection {
  return {
    kind: 'ClientExtension',
    selections: generateSelections(schema, node.selections),
  };
}

function generateCondition(
  schema: Schema,
  node: Condition,
): NormalizationSelection {
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
    selections: generateSelections(schema, node.selections),
  };
}

function generateDefer(schema: Schema, node: Defer): NormalizationDefer {
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
    selections: generateSelections(schema, node.selections),
  };
}

function generateInlineFragment(
  schema: Schema,
  node: InlineFragment,
): NormalizationSelection {
  return {
    kind: 'InlineFragment',
    type: schema.getTypeString(node.typeCondition),
    selections: generateSelections(schema, node.selections),
  };
}

function generateLinkedField(
  schema: Schema,
  node: LinkedField,
): $ReadOnlyArray<NormalizationSelection> {
  // Note: it is important that the arguments of this field be sorted to
  // ensure stable generation of storage keys for equivalent arguments
  // which may have originally appeared in different orders across an app.
  const handles =
    (node.handles &&
      node.handles.map(handle => {
        let handleNode: NormalizationLinkedHandle = {
          kind: 'LinkedHandle',
          alias: node.alias === node.name ? null : node.alias,
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
  const type = schema.getRawType(node.type);
  let field: NormalizationLinkedField = {
    kind: 'LinkedField',
    alias: node.alias === node.name ? null : node.alias,
    name: node.name,
    storageKey: null,
    args: generateArgs(node.args),
    concreteType: !schema.isAbstractType(type)
      ? schema.getTypeString(type)
      : null,
    plural: isPlural(schema, node.type),
    selections: generateSelections(schema, node.selections),
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey != null) {
    field = {...field, storageKey};
  }
  return [field].concat(handles);
}

function generateConnectionField(
  schema: Schema,
  node: ConnectionField,
): $ReadOnlyArray<NormalizationSelection> {
  return generateLinkedField(schema, {
    name: node.name,
    alias: node.alias,
    loc: node.loc,
    directives: node.directives,
    metadata: node.metadata,
    selections: node.selections,
    type: node.type,
    handles: null,
    connection: false, // this is only on the linked fields with @conneciton
    args: node.args.filter(
      arg =>
        !ConnectionInterface.isConnectionCall({name: arg.name, value: null}),
    ),
    kind: 'LinkedField',
  });
}

function generateConnection(
  schema: Schema,
  node: Connection,
): NormalizationConnection {
  const {EDGES, PAGE_INFO} = ConnectionInterface.get();
  const selections = generateSelections(schema, node.selections);
  let edges: ?NormalizationLinkedField;
  let pageInfo: ?NormalizationLinkedField;
  selections.forEach(selection => {
    if (selection.kind === 'LinkedField') {
      if (selection.name === EDGES) {
        edges = selection;
      } else if (selection.name === PAGE_INFO) {
        pageInfo = selection;
      }
    } else if (selection.kind === 'Stream') {
      selection.selections.forEach(subselection => {
        if (
          subselection.kind === 'LinkedField' &&
          subselection.name === EDGES
        ) {
          edges = subselection;
        }
      });
    } else if (selection.kind === 'Defer') {
      selection.selections.forEach(subselection => {
        if (
          subselection.kind === 'LinkedField' &&
          subselection.name === PAGE_INFO
        ) {
          pageInfo = subselection;
        }
      });
    }
  });
  if (edges == null || pageInfo == null) {
    throw createUserError(
      `Invalid connection, expected the '${EDGES}' and '${PAGE_INFO}' fields ` +
        'to exist.',
      [node.loc],
    );
  }
  let stream = null;
  if (node.stream != null) {
    const trueLiteral: NormalizationArgument = {
      kind: 'Literal',
      name: 'if',
      value: true,
    };
    stream = {
      if:
        node.stream.if != null
          ? generateArgumentValue('if', node.stream.if) ?? trueLiteral
          : trueLiteral,
      deferLabel: node.stream.deferLabel,
      streamLabel: node.stream.streamLabel,
    };
  }
  return {
    kind: 'Connection',
    label: node.label,
    name: node.name,
    args: generateArgs(node.args),
    edges,
    pageInfo,
    stream,
  };
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
          alias: node.alias === node.name ? null : node.alias,
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
    alias: node.alias === node.name ? null : node.alias,
    name: node.name,
    args: generateArgs(node.args),
    storageKey: null,
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey != null) {
    field = {...field, storageKey};
  }
  return [field].concat(handles);
}

function generateStream(schema: Schema, node: Stream): NormalizationStream {
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
    selections: generateSelections(schema, node.selections),
  };
}

function generateArgumentValue(
  name: string,
  value: ArgumentValue,
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
      return {
        kind: 'ObjectValue',
        name: name,
        fields: objectKeys.map(fieldName => {
          const fieldValue = objectValues.get(fieldName);
          if (fieldValue == null) {
            throw createCompilerError('Expected to have object field value');
          }
          return (
            generateArgumentValue(fieldName, fieldValue) ?? {
              kind: 'Literal',
              name: fieldName,
              value: null,
            }
          );
        }),
      };
    }
    case 'ListValue': {
      return {
        kind: 'ListValue',
        name: name,
        items: value.items.map((item, index) => {
          return generateArgumentValue(`${name}.${index}`, item);
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
): ?$ReadOnlyArray<NormalizationArgument> {
  const concreteArguments = [];
  args.forEach(arg => {
    const concreteArgument = generateArgumentValue(arg.name, arg.value);
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

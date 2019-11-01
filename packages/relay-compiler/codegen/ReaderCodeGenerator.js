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

const {createCompilerError, createUserError} = require('../core/CompilerError');
const {
  ConnectionInterface,
  getStorageKey,
  stableCopy,
} = require('relay-runtime');

import type {
  Argument,
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
  Connection,
  ConnectionField,
  InlineDataFragmentSpread,
} from '../core/IR';
import type {Schema, TypeID} from '../core/Schema';
import type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderConnection,
  ReaderField,
  ReaderFragment,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
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
    type: schema.getTypeString(node.type),
    // $FlowFixMe
    metadata,
    argumentDefinitions: generateArgumentDefinitions(
      schema,
      node.argumentDefinitions,
    ),
    selections: generateSelections(schema, node.selections),
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
        case 'ConnectionField':
          return generateConnectionField(schema, selection);
        case 'Connection':
          return generateConnection(schema, selection);
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
          kind: 'LocalArgument',
          name: node.name,
          type: schema.getTypeString(node.type),
          defaultValue: node.defaultValue,
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
    kind: 'Condition',
    passingValue: node.passingValue,
    condition: node.condition.variableName,
    selections: generateSelections(schema, node.selections),
  };
}

function generateFragmentSpread(
  schema: Schema,
  node: FragmentSpread,
): ReaderSelection {
  return {
    kind: 'FragmentSpread',
    name: node.name,
    args: generateArgs(node.args),
  };
}

function generateInlineFragment(
  schema: Schema,
  node: InlineFragment,
): ReaderSelection {
  return {
    kind: 'InlineFragment',
    type: schema.getTypeString(node.typeCondition),
    selections: generateSelections(schema, node.selections),
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
    kind: 'LinkedField',
    alias: node.alias === node.name ? null : node.alias,
    name: node.name,
    storageKey: null,
    args: generateArgs(node.args),
    concreteType: !schema.isAbstractType(rawType)
      ? schema.getTypeString(rawType)
      : null,
    plural: isPlural(schema, node.type),
    selections: generateSelections(schema, node.selections),
  };
  // Precompute storageKey if possible
  const storageKey = getStaticStorageKey(field, node.metadata);
  if (storageKey) {
    field = {...field, storageKey};
  }
  return field;
}

function generateConnectionField(
  schema: Schema,
  node: ConnectionField,
): ReaderLinkedField {
  return generateLinkedField(schema, {
    name: node.name,
    alias: node.alias,
    loc: node.loc,
    directives: node.directives,
    metadata: node.metadata,
    selections: node.selections,
    type: node.type,
    connection: false, // this is only on the linked fields with @conneciton
    handles: null,
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
): ReaderConnection {
  const {EDGES, PAGE_INFO} = ConnectionInterface.get();
  const selections = generateSelections(schema, node.selections);
  let edges: ?ReaderLinkedField;
  let pageInfo: ?ReaderLinkedField;
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
  return {
    kind: 'Connection',
    label: node.label,
    name: node.name,
    args: generateArgs(node.args),
    edges,
    pageInfo,
  };
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
    kind: 'ModuleImport',
    documentName: node.documentName,
    fragmentName,
    fragmentPropName,
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
    kind: 'ScalarField',
    alias: node.alias === node.name ? null : node.alias,
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

function isPlural(schema: Schema, type: TypeID): boolean {
  return schema.isList(schema.getNullableType(type));
}

module.exports = {
  generate,
};

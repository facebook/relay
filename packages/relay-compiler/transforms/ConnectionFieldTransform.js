/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const IRTransformer = require('../core/GraphQLIRTransformer');

const {getNullableType, getRawType} = require('../core/GraphQLSchemaUtils');
const {createUserError} = require('../core/RelayCompilerError');
const {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} = require('graphql');
const {ConnectionInterface} = require('relay-runtime');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {
  Connection,
  ConnectionField,
  Directive,
  LinkedField,
  ScalarField,
} from '../core/GraphQLIR';

const SCHEMA_EXTENSION = `
  directive @connection_resolver(label: String!) on FIELD
  directive @stream_connection_resolver(
    label: String!
    initial_count: Int!
    if: Boolean = true
  ) on FIELD
`;

type State = {|
  +documentName: string,
  +labels: Map<string, Directive>,
|};

/**
 * This transform rewrites LinkedField nodes with @connection_resolver and
 * rewrites their edges/pageInfo selections to be wrapped in a Connection node.
 */
function connectionFieldTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      LinkedField: (visitLinkedField: $FlowFixMe),
      ScalarField: visitScalarField,
    },
    node => ({documentName: node.name, labels: new Map()}),
  );
}

function visitLinkedField(
  field: LinkedField,
  state: State,
): LinkedField | ConnectionField {
  const transformed: LinkedField = this.traverse(field, state);
  const connectionDirective = transformed.directives.find(
    directive =>
      directive.name === 'connection_resolver' ||
      directive.name === 'stream_connection_resolver',
  );
  if (connectionDirective == null) {
    return transformed;
  }
  if (getNullableType(transformed.type) instanceof GraphQLList) {
    throw createUserError(
      "@connection_resolver fields must return a single value, not a list, found '" +
        `${String(transformed.type)}'`,
      [transformed.loc],
    );
  }
  const labelArg = connectionDirective.args.find(({name}) => name === 'label');
  const label = getLiteralStringArgument(connectionDirective, 'label');
  if (
    typeof label !== 'string' ||
    (label !== state.documentName &&
      label.indexOf(state.documentName + '$') !== 0)
  ) {
    throw createUserError(
      'Invalid usage of @connection_resolver, expected a static string ' +
        `'label'. Labels may be the document name ('${state.documentName}') ` +
        `or be prefixed with the document name ('${
          state.documentName
        }$<name>')`,
      [labelArg?.loc ?? connectionDirective.loc],
    );
  }
  const previousDirective = state.labels.get(label);
  if (previousDirective != null) {
    const prevLabelArg = previousDirective.args.find(
      ({name}) => name === 'label',
    );
    const previousLocation = prevLabelArg?.loc ?? previousDirective.loc;
    if (labelArg) {
      throw createUserError(
        'Invalid use of @connection_resolver, the provided label is ' +
          "not unique. Specify a unique 'label' as a literal string.",
        [labelArg?.loc, previousLocation],
      );
    } else {
      throw createUserError(
        'Invalid use of @connection_resolver, could not generate a ' +
          "default label that is unique. Specify a unique 'label' " +
          'as a literal string.',
        [connectionDirective.loc, previousLocation],
      );
    }
  }
  state.labels.set(label, connectionDirective);

  let stream = null;
  if (connectionDirective.name === 'stream_connection_resolver') {
    const initialCountArg = connectionDirective.args.find(
      arg => arg.name === 'initial_count',
    );
    const ifArg = connectionDirective.args.find(arg => arg.name === 'if');
    if (
      initialCountArg == null ||
      (initialCountArg.value.kind === 'Literal' &&
        !Number.isInteger(initialCountArg.value.value))
    ) {
      throw createUserError(
        "Invalid use of @connection_resolver, 'initial_count' is required " +
          "and must be an integer or variable of type 'Int!''.",
        [initialCountArg?.loc ?? connectionDirective.loc],
      );
    }
    stream = {
      deferLabel: label,
      initialCount: initialCountArg.value,
      if: ifArg != null ? ifArg.value : null,
      streamLabel: label,
    };
  }

  const {EDGES, PAGE_INFO} = ConnectionInterface.get();
  let edgeField;
  let pageInfoField;
  const selections = [];
  transformed.selections.forEach(selection => {
    if (
      !(selection.kind === 'LinkedField' || selection.kind === 'ScalarField')
    ) {
      throw createUserError(
        'Invalid use of @connection_resolver, selections on the connection ' +
          'must be linked or scalar fields.',
        [selection.loc],
      );
    }
    if (selection.kind === 'LinkedField') {
      if (selection.name === EDGES) {
        edgeField = selection;
      } else if (selection.name === PAGE_INFO) {
        pageInfoField = selection;
      } else {
        selections.push(selection);
      }
    } else {
      selections.push(selection);
    }
  });
  if (edgeField == null || pageInfoField == null) {
    throw createUserError(
      `Invalid use of @connection_resolver, fields '${EDGES}' and ` +
        `'${PAGE_INFO}' must be  fetched.`,
      [connectionDirective.loc],
    );
  }
  const connectionType = getRawType(transformed.type);
  const edgesFieldDef =
    connectionType instanceof GraphQLObjectType
      ? connectionType.getFields().edges
      : null;
  const edgesType =
    edgesFieldDef != null ? getRawType(edgesFieldDef.type) : null;
  const nodeFieldDef =
    edgesType != null && edgesType instanceof GraphQLObjectType
      ? edgesType.getFields().node
      : null;
  const nodeType = nodeFieldDef != null ? getRawType(nodeFieldDef.type) : null;
  if (
    edgesType == null ||
    nodeType == null ||
    !(
      nodeType instanceof GraphQLObjectType ||
      nodeType instanceof GraphQLInterfaceType
    )
  ) {
    throw createUserError(
      'Invalid usage of @connection_resolver, expected field to have shape ' +
        "'field { edges { node { ...} } }'.",
      [transformed.loc],
    );
  }
  edgeField = {
    ...edgeField,
    selections: [
      ...edgeField.selections,
      {
        alias: '__id',
        args: [],
        directives: [],
        handles: null,
        kind: 'ScalarField',
        loc: edgeField.loc,
        metadata: null,
        name: '__id',
        type: new GraphQLNonNull(GraphQLID),
      },
      {
        alias: 'node',
        args: [],
        directives: [],
        handles: null,
        kind: 'LinkedField',
        loc: edgeField.loc,
        metadata: null,
        name: 'node',
        selections: [
          {
            alias: '__id',
            args: [],
            directives: [],
            handles: null,
            kind: 'ScalarField',
            loc: edgeField.loc,
            metadata: null,
            name: '__id',
            type: new GraphQLNonNull(GraphQLID),
          },
        ],
        type: nodeType,
      },
    ],
  };
  selections.push(
    ({
      args: transformed.args,
      kind: 'Connection',
      label,
      loc: transformed.loc,
      name: transformed.name,
      selections: [edgeField, pageInfoField],
      stream,
      type: transformed.type,
    }: Connection),
  );

  return {
    alias: transformed.alias,
    args: transformed.args,
    directives: transformed.directives.filter(
      directive => directive !== connectionDirective,
    ),
    kind: 'ConnectionField',
    loc: transformed.loc,
    metadata: null,
    name: transformed.name,
    selections,
    type: transformed.type,
  };
}

function visitScalarField(field: ScalarField): ScalarField {
  const connectionDirective = field.directives.find(
    directive => directive.name === 'connection_resolver',
  );
  if (connectionDirective != null) {
    throw createUserError(
      'The @connection_resolver direction is not supported on scalar fields, ' +
        'only fields returning an object/interface/union',
      [connectionDirective.loc],
    );
  }
  return field;
}

function getLiteralStringArgument(
  directive: Directive,
  argName: string,
): ?string {
  const arg = directive.args.find(({name}) => name === argName);
  if (arg == null) {
    return null;
  }
  const value = arg.value.kind === 'Literal' ? arg.value.value : null;
  if (value == null || typeof value !== 'string') {
    throw createUserError(
      `Expected the '${argName}' value to @${
        directive.name
      } to be a string literal if provided.`,
      [arg.value.loc],
    );
  }
  return value;
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: connectionFieldTransform,
};

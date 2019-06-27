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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');

const {getNullableType} = require('../core/GraphQLSchemaUtils');
const {createUserError} = require('../core/RelayCompilerError');
const {GraphQLList} = require('graphql');

import type {
  Directive,
  ConnectionField,
  LinkedField,
  ScalarField,
} from '../core/GraphQLIR';

const SCHEMA_EXTENSION = `
  directive @connection_resolver(resolver: String!, label: String) on FIELD
`;

type State = {|
  +documentName: string,
  +labels: Map<string, Directive>,
|};

/**
 * This transform rewrites LinkedField nodes with @connection_resolver and rewrites them
 * into `ConnectionField` nodes.
 */
function connectionFieldTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      // TODO: type IRTransformer to allow changing result type
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
    directive => directive.name === 'connection_resolver',
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
  const {resolver} = getLiteralArgumentValues(connectionDirective.args);
  if (typeof resolver !== 'string') {
    const resolverArg = transformed.args.find(arg => arg.name === 'resolver');
    throw createUserError(
      "Expected @connection_resolver field to specify a 'resolver' as a literal string. " +
        'The resolver should be the name of a JS module to use at runtime ' +
        "to derive the field's value.",
      [resolverArg?.loc ?? connectionDirective.loc],
    );
  }
  const rawLabel =
    getLiteralStringArgument(connectionDirective, 'label') ??
    transformed.alias ??
    transformed.name;
  const label = transformLabel(state.documentName, 'connection', rawLabel);
  const previousDirective = state.labels.get(label);
  if (previousDirective != null) {
    const labelArg = connectionDirective.args.find(
      ({name}) => name === 'label',
    );
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
  return ({
    alias: transformed.alias,
    args: transformed.args,
    directives: transformed.directives.filter(
      directive => directive !== connectionDirective,
    ),
    kind: 'ConnectionField',
    label,
    loc: transformed.loc,
    metadata: transformed.metadata,
    name: transformed.name,
    resolver,
    selections: transformed.selections,
    type: transformed.type,
  }: ConnectionField);
}

function visitScalarField(field: ScalarField): ScalarField {
  const connectionDirective = field.directives.find(
    directive => directive.name === 'connection_resolver',
  );
  if (connectionDirective != null) {
    throw createUserError(
      'The @connection_resolver direction is not supported on scalar fields, only fields returning an object/interface/union',
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

function transformLabel(
  parentName: string,
  directive: string,
  label: string,
): string {
  return `${parentName}$${directive}$${label}`;
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: connectionFieldTransform,
};

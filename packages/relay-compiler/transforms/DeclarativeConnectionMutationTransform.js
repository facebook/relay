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

const IRTransformer = require('../core/IRTransformer');

const {createUserError} = require('../core/CompilerError');
const {ConnectionInterface} = require('relay-runtime');

const DELETE_RECORD = 'deleteRecord';
const APPEND_EDGE = 'appendEdge';
const PREPEND_EDGE = 'prependEdge';
const LINKED_FIELD_DIRECTIVES = [APPEND_EDGE, PREPEND_EDGE];

const SCHEMA_EXTENSION = `
  directive @${DELETE_RECORD} on FIELD
  directive @${APPEND_EDGE}(
    connections: [String!]!
  ) on FIELD
  directive @${PREPEND_EDGE}(
    connections: [String!]!
  ) on FIELD
`;

import type CompilerContext from '../core/CompilerContext';
import type {ScalarField, LinkedField, Root, Handle} from '../core/IR';

function transform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    ScalarField: visitScalarField,
    LinkedField: visitLinkedField,
    SplitOperation: skip,
    Fragment: skip,
  });
}

function skip<T>(node: T): T {
  return node;
}

function visitScalarField(field: ScalarField): ScalarField {
  const linkedFieldDirective = field.directives.find(
    directive => LINKED_FIELD_DIRECTIVES.indexOf(directive.name) > -1,
  );
  if (linkedFieldDirective != null) {
    throw createUserError(
      `Invalid use of @${linkedFieldDirective.name} on scalar field '${field.name}'`,
      [linkedFieldDirective.loc],
    );
  }
  const deleteDirective = field.directives.find(
    directive => directive.name === DELETE_RECORD,
  );
  if (deleteDirective == null) {
    return field;
  }
  const schema = this.getContext().getSchema();
  if (!schema.isId(field.type)) {
    throw createUserError(
      `Invalid use of @${DELETE_RECORD} on field '${
        field.name
      }'. Expected field type ID, got ${schema.getTypeString(field.type)}.`,
      [deleteDirective.loc],
    );
  }
  const handle: Handle = {
    name: DELETE_RECORD,
    key: '',
    dynamicKey: null,
    filters: null,
  };
  return {
    ...field,
    directives: field.directives.filter(
      directive => directive !== deleteDirective,
    ),
    handles: field.handles ? [...field.handles, handle] : [handle],
  };
}

function visitLinkedField(field: LinkedField): LinkedField {
  const transformedField = this.traverse(field);
  const deleteDirective = transformedField.directives.find(
    directive => directive.name === DELETE_RECORD,
  );
  if (deleteDirective != null) {
    throw createUserError(
      `Invalid use of @${deleteDirective.name} on scalar field '${transformedField.name}'.`,
      [deleteDirective.loc],
    );
  }
  const edgeDirective = transformedField.directives.find(
    directive => LINKED_FIELD_DIRECTIVES.indexOf(directive.name) > -1,
  );
  if (edgeDirective == null) {
    return transformedField;
  }
  const connectionsArg = edgeDirective.args.find(
    arg => arg.name === 'connections',
  );
  if (connectionsArg == null) {
    throw createUserError(
      `Expected the 'connections' argument to be defined on @${edgeDirective.name}.`,
      [edgeDirective.loc],
    );
  }
  const schema = this.getContext().getSchema();
  const fields = schema.getFields(transformedField.type);
  let cursorFieldID;
  let nodeFieldID;
  for (const fieldID of fields) {
    const fieldName = schema.getFieldName(fieldID);
    if (fieldName === ConnectionInterface.get().CURSOR) {
      cursorFieldID = fieldID;
    } else if (fieldName === ConnectionInterface.get().NODE) {
      nodeFieldID = fieldID;
    }
  }
  // Edge
  if (cursorFieldID != null && nodeFieldID != null) {
    const handle: Handle = {
      name: edgeDirective.name,
      key: '',
      dynamicKey: null,
      filters: null,
      handleArgs: [connectionsArg],
    };
    return {
      ...transformedField,
      directives: transformedField.directives.filter(
        directive => directive !== edgeDirective,
      ),
      handles: transformedField.handles
        ? [...transformedField.handles, handle]
        : [handle],
    };
  }
  throw createUserError(
    `Unsupported use of @${edgeDirective.name} on field '${transformedField.name}', expected an edge field (a field with 'cursor' and 'node' selection).`,
    [edgeDirective.loc],
  );
}

module.exports = {
  SCHEMA_EXTENSION,
  transform,
};

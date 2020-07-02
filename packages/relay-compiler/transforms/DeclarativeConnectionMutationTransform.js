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

const DELETE_RECORD = 'deleteRecord';
const SCHEMA_EXTENSION = `
  directive @${DELETE_RECORD} on FIELD
`;

import type CompilerContext from '../core/CompilerContext';
import type {ScalarField, Root, Handle, LinkedField} from '../core/IR';

function transform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    Root: visitRoot,
    ScalarField: visitScalarField,
    LinkedField: visitLinkedField,
    SplitOperation: skip,
    Fragment: skip,
  });
}

function skip<T>(node: T): T {
  return node;
}

function visitRoot(root: Root): Root {
  if (root.operation !== 'mutation') {
    return root;
  }
  return this.traverse(root);
}

function visitScalarField(field: ScalarField): ScalarField {
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
      `Invalid use of @${deleteDirective.name} on scalar field '${transformedField.name}'`,
      [deleteDirective.loc],
    );
  }
  return transformedField;
}

module.exports = {
  SCHEMA_EXTENSION,
  transform,
};

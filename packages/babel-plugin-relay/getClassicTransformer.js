/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule getClassicTransformer
 * @flow
 * @format
 */

'use strict';

const RelayQLTransformer = require('./RelayQLTransformer');

const getSchemaIntrospection = require('./getSchemaIntrospection');

const {buildASTSchema, buildClientSchema} = require('graphql');

import type {Validator} from './RelayQLTransformer';
import type {GraphQLSchema} from 'graphql';

export type GraphQLSchemaProvider = (() => Object | string) | Object | string;

type ClassicTransformerOpts = {
  inputArgumentName?: string,
  snakeCase?: boolean,
  substituteVariables?: boolean,
  validator?: Validator<any>,
};

type BabelFileOpts = {
  sourceRoot?: string,
};

/**
 * Caches based on the provided schema. Typically this means only one instance
 * of the RelayQLTransformer will be created, however in some circumstances
 * (such as in tests) multiple instances can be created given multiple schema.
 */
const classicTransformerCache = new Map();
function getClassicTransformer(
  schemaProvider: GraphQLSchemaProvider,
  options: ClassicTransformerOpts,
  fileOptions: BabelFileOpts,
): RelayQLTransformer {
  let classicTransformer = classicTransformerCache.get(schemaProvider);
  if (!classicTransformer) {
    const schema = getSchema(schemaProvider, fileOptions);
    classicTransformer = new RelayQLTransformer(schema, {
      inputArgumentName: options.inputArgumentName,
      snakeCase: Boolean(options.snakeCase),
      substituteVariables: Boolean(options.substituteVariables),
      validator: options.validator,
    });
    classicTransformerCache.set(schemaProvider, classicTransformer);
  }
  return classicTransformer;
}

function getSchema(
  schemaProvider: GraphQLSchemaProvider,
  fileOptions: BabelFileOpts,
): GraphQLSchema {
  const schemaReference =
    typeof schemaProvider === 'function' ? schemaProvider() : schemaProvider;
  const introspection =
    typeof schemaReference === 'string'
      ? getSchemaIntrospection(schemaReference, fileOptions.sourceRoot)
      : schemaReference;
  if (introspection.__schema) {
    return buildClientSchema((introspection: any));
  } else if (introspection.data && introspection.data.__schema) {
    return buildClientSchema((introspection.data: any));
  } else if (introspection.kind && introspection.kind === 'Document') {
    return buildASTSchema(introspection, {assumeValid: true});
  }

  throw new Error(
    'Invalid introspection data supplied to babel-plugin-relay. The ' +
      'resulting schema is not an object with a `__schema` property or ' +
      'a schema IDL language.',
  );
}

module.exports = getClassicTransformer;

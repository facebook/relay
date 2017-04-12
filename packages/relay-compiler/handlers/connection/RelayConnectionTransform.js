/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayConnectionTransform
 */

'use strict';

const GraphQL = require('graphql');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');
const RelayParser = require('RelayParser');
const RelaySchemaUtils = require('RelaySchemaUtils');

const getRelayLiteralArgumentValues = require('getRelayLiteralArgumentValues');
const invariant = require('invariant');

const {
  AFTER,
  BEFORE,
  FIRST,
  KEY,
  LAST,
} = require('RelayConnectionConstants');
const {
  CURSOR,
  EDGES,
  END_CURSOR,
  HAS_NEXT_PAGE,
  HAS_PREV_PAGE,
  NODE,
  PAGE_INFO,
  START_CURSOR,
  isConnectionCall,
} = require('RelayConnectionInterface');

import type {ConnectionMetadata} from 'RelayConnectionHandler';
import type {
  Argument,
  Fragment,
  InlineFragment,
  LinkedField,
  Root,
} from 'RelayIR';
import type {GraphQLSchema, GraphQLType} from 'graphql';

const {
  assertCompositeType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
} = GraphQL;

type Options = {
  // The current path
  path: Array<?string>,
  // Metadata recorded for @connection fields
  connectionMetadata: Array<ConnectionMetadata>,
  definitionName: ?string,
  generateRequisiteFields: boolean,
};

const CONNECTION = 'connection';

/**
 * @public
 *
 * Transforms fields with the `@connection` directive:
 * - Verifies that the field type is connection-like.
 * - Adds a `handle` property to the field, either the user-provided `handle`
 *   argument or the default value "connection".
 * - When the `generateRequisiteFields` option is set to true, inserts a
 *   sub-fragment on the field to ensure that standard connection fields are
 *   fetched (e.g. cursors, node ids, page info).
 */
function transform(
  context: RelayCompilerContext,
  options?: ?{generateRequisiteFields: boolean}
): RelayCompilerContext {
  const generateRequisiteFields = !!(options && options.generateRequisiteFields);
  return RelayIRTransformer.transform(
    context,
    {
      Fragment: visitFragmentOrRoot,
      LinkedField: visitLinkedField,
      Root: visitFragmentOrRoot,
    },
    () => ({
      path: [],
      connectionMetadata: [],
      definitionName: null,
      generateRequisiteFields,
    })
  );
}

/**
 * @public
 *
 * Extend the original schema with support for the `@connection` directive.
 */
function transformSchema(schema: GraphQLSchema): GraphQLSchema {
  return GraphQL.extendSchema(schema, GraphQL.parse(
    'directive @connection(key: String!, filters: [String]) on FIELD'
  ));
}

/**
 * @internal
 */
function visitFragmentOrRoot<N: Fragment | Root>(node: N, options: Options): ?N {
  const passedOptions = {
    ...options,
    definitionName: node.name,
  };
  const transformedNode = this.traverse(node, passedOptions);
  const connectionMetadata = passedOptions.connectionMetadata;
  if (connectionMetadata.length) {
    return {
      ...transformedNode,
      metadata: {
        ...transformedNode.metadata,
        connection: connectionMetadata,
      },
    };
  }
  return transformedNode;
}

/**
 * @internal
 */
function visitLinkedField(
  field: LinkedField,
  options: Options
): LinkedField {
  const isPlural =
    RelaySchemaUtils.getNullableType(field.type) instanceof GraphQLList;
  options.path.push(isPlural ? null : (field.alias || field.name));
  let transformedField = this.traverse(field, options);
  const connectionDirective = field.directives.find(directive => directive.name === CONNECTION);
  if (!connectionDirective) {
    options.path.pop();
    return transformedField;
  }
  const {definitionName} = options;
  invariant(
    definitionName,
    'RelayConnectionTransform: Transform error, expected a name to have ' +
    'been set by the parent operation or fragment definition.'
  );
  validateConnectionSelection(definitionName, transformedField);
  validateConnectionType(definitionName, transformedField.type);

  const pathHasPlural = options.path.includes(null);
  const firstArg = findArg(transformedField, FIRST);
  const lastArg = findArg(transformedField, LAST);
  let direction = null;
  let countArg = null;
  let cursorArg = null;
  if (firstArg && !lastArg) {
    direction = 'forward';
    countArg = firstArg;
    cursorArg = findArg(transformedField, AFTER);
  } else if (lastArg && !firstArg) {
    direction = 'backward';
    countArg = lastArg;
    cursorArg = findArg(transformedField, BEFORE);
  }
  const countVariable = (countArg && countArg.value.kind === 'Variable')
    ? countArg.value.variableName
    : null;
  const cursorVariable = (cursorArg && cursorArg.value.kind === 'Variable')
    ? cursorArg.value.variableName
    : null;
  options.connectionMetadata.push({
    count: countVariable,
    cursor: cursorVariable,
    direction,
    path: pathHasPlural ? null : ([...options.path]: any),
  });
  options.path.pop();

  const {key, filters} = getRelayLiteralArgumentValues(connectionDirective.args);
  invariant(
    typeof key === 'string',
    'RelayConnectionTransform: Expected the %s argument to @%s to ' +
    'be a string literal for field %s',
    KEY,
    CONNECTION,
    field.name,
  );
  const postfix = `${field.alias || field.name}`;
  // TODO: t16785208 Change error message to point to OSS doc once ready.
  invariant(
    key.endsWith('_' + postfix),
    'RelayConnectionTransform: Expected the %s argument to @%s to ' +
    'be of form <SomeName>_%s, but get %s. For detailed explanation, check out the dex page ' +
    'https://fburl.com/oillie0v',
    KEY,
    CONNECTION,
    postfix,
    key,
  );

  const generateFilters = () => {
    const filteredVariableArgs = field.args
      .filter(arg => !isConnectionCall({name: arg.name, value: null}))
      .map(arg => arg.name);
    return filteredVariableArgs.length === 0 ? null : filteredVariableArgs;
  };

  const handle = {
    name: CONNECTION,
    key,
    filters: filters || generateFilters(),
  };

  if (options.generateRequisiteFields) {
    const fragment = generateConnectionFragment(
      this.getContext(),
      transformedField.type
    );
    transformedField = {
      ...transformedField,
      selections: transformedField.selections.concat(fragment),
    };
  }
  return {
    ...transformedField,
    directives: transformedField.directives.filter(directive => directive.name !== CONNECTION),
    handles: transformedField.handles ?
      [...transformedField.handles, handle] :
      [handle],
  };
}

/**
 * @internal
 *
 * Generates a fragment on the given type that fetches the minimal connection
 * fields in order to merge different pagination results together at runtime.
 */
function generateConnectionFragment(
  context: RelayCompilerContext,
  type: GraphQLType
): InlineFragment {
  const compositeType = assertCompositeType(type);
  const ast = GraphQL.parse(`
    fragment ConnectionFragment on ${String(compositeType)} {
      ${EDGES} {
        ${CURSOR}
        ${NODE} {
          __typename # rely on GenerateRequisiteFieldTransform to add "id"
        }
      }
      ${PAGE_INFO} {
        ${END_CURSOR}
        ${HAS_NEXT_PAGE}
        ${HAS_PREV_PAGE}
        ${START_CURSOR}
      }
    }
  `);
  const fragmentAST = ast.definitions[0];
  invariant(
    fragmentAST && fragmentAST.kind === 'FragmentDefinition',
    'RelayConnectionTransform: Expected a fragment definition AST.'
  );
  const fragment = RelayParser.transform(context.schema, fragmentAST);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'RelayConnectionTransform: Expected a connection fragment.'
  );
  return {
    directives: [],
    kind: 'InlineFragment',
    metadata: null,
    selections: fragment.selections,
    typeCondition: compositeType,
  };
}

function findArg(field: LinkedField, argName: string): ?Argument {
  return field.args && field.args.find(arg => arg.name === argName);
}

/**
 * @internal
 *
 * Validates that the selection is a valid connection:
 * - Specifies a first or last argument to prevent accidental, unconstrained
 *   data access.
 * - Has an `edges` selection, otherwise there is nothing to paginate.
 *
 * TODO: This implementation requires the edges field to be a direct selection
 * and not contained within an inline fragment or fragment spread. It's
 * technically possible to remove this restriction if this pattern becomes
 * common/necessary.
 */
function validateConnectionSelection(
  definitionName: string,
  field: LinkedField,
): void {
  invariant(
    findArg(field, FIRST) || findArg(field, LAST),
    'RelayConnectionTransform: Expected field `%s: %s` to have a %s or %s ' +
    'argument in document `%s`.',
    field.name,
    field.type,
    FIRST,
    LAST,
    definitionName,
  );
  invariant(
    field.selections.some(selection => (
      selection.kind === 'LinkedField' &&
      selection.name === EDGES
    )),
    'RelayConnectionTransform: Expected field `%s: %s` to have a %s ' +
    'selection in document `%s`.',
    field.name,
    field.type,
    EDGES,
    definitionName,
  );
}

/**
 * @internal
 *
 * Validates that the type satisfies the Connection specification:
 * - The type has an edges field, and edges have scalar `cursor` and object
 *   `node` fields.
 * - The type has a page info field which is an object with the correct
 *   subfields.
 */
function validateConnectionType(
  definitionName: string,
  type: GraphQLType,
): void {
  const typeWithFields = RelaySchemaUtils.assertTypeWithFields(type);
  const typeFields = typeWithFields.getFields();
  const edges = typeFields[EDGES];

  invariant(
    edges,
    'RelayConnectionTransform: Expected type `%s` to have an %s field in ' +
    'document `%s`.',
    type,
    EDGES,
    definitionName,
  );

  const edgesType = RelaySchemaUtils.getNullableType(edges.type);
  invariant(
    edgesType instanceof GraphQLList,
    'RelayConnectionTransform: Expected `%s` field on type `%s` to be a ' +
    'list type in document `%s`.',
    EDGES,
    type,
    definitionName,
  );
  const edgeType = RelaySchemaUtils.getNullableType(edgesType.ofType);
  invariant(
    edgeType instanceof GraphQLObjectType,
    'RelayConnectionTransform: Expected %s field on type `%s` to be a list ' +
    'of objects in document `%s`.',
    EDGES,
    type,
    definitionName,
  );
  const node = edgeType.getFields()[NODE];
  if (
    !node ||
    !(node.type instanceof GraphQLInterfaceType ||
      node.type instanceof GraphQLUnionType ||
      node.type instanceof GraphQLObjectType)
  ) {
    invariant(
      false,
      'RelayConnectionTransform: Expected type `%s` to have an %s.%s field' +
      'for which the type is an interface, object, or union in document `%s`.',
      type,
      EDGES,
      NODE,
      definitionName,
    );
  }
  const cursor = edgeType.getFields()[CURSOR];
  if (!cursor || !(cursor.type instanceof GraphQLScalarType)) {
    invariant(
      false,
      'RelayConnectionTransform: Expected type `%s` to have an ' +
      '%s.%s field for which the type is an scalar in document `%s`.',
      type,
      EDGES,
      CURSOR,
      definitionName,
    );
  }
  const pageInfo = typeFields[PAGE_INFO];
  if (!pageInfo || !(pageInfo.type instanceof GraphQLObjectType)) {
    invariant(
      false,
      'RelayConnectionTransform: Expected type `%s` to have a %s field for ' +
      'which the type is an object in document `%s`.',
      type,
      PAGE_INFO,
      definitionName,
    );
  }
  const pageInfoType = RelaySchemaUtils.assertTypeWithFields(pageInfo.type);
  [END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, START_CURSOR].forEach(fieldName => {
    const pageInfoField = pageInfoType.getFields()[fieldName];
    if (!pageInfoField || !(pageInfoField.type instanceof GraphQLScalarType)) {
      invariant(
        false,
        'RelayConnectionTransform: Expected type `%s` to have an ' +
        '%s field for which the type is an scalar in document `%s`.',
        pageInfo.type,
        fieldName,
        definitionName,
      );
    }
  });
}

module.exports = {
  CONNECTION,
  transform,
  transformSchema,
};

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

const IRTransformer = require('../../core/GraphQLIRTransformer');
const RelayParser = require('../../core/RelayParser');
const SchemaUtils = require('../../core/GraphQLSchemaUtils');

const getLiteralArgumentValues = require('../../core/getLiteralArgumentValues');

const {
  createCompilerError,
  createUserError,
} = require('../../core/RelayCompilerError');
const {AFTER, BEFORE, FIRST, KEY, LAST} = require('./RelayConnectionConstants');
const {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  parse,
} = require('graphql');
const {ConnectionInterface} = require('relay-runtime');

import type CompilerContext from '../../core/GraphQLCompilerContext';
import type {
  Argument,
  Directive,
  Fragment,
  InlineFragment,
  LinkedField,
  Location,
  Root,
} from '../../core/GraphQLIR';
import type {GraphQLType} from 'graphql';
import type {ConnectionMetadata} from 'relay-runtime';

type Options = {
  // The current path
  path: Array<?string>,
  // Metadata recorded for @connection fields
  connectionMetadata: Array<ConnectionMetadata>,
};

const CONNECTION = 'connection';
const HANDLER = 'handler';

/**
 * @public
 *
 * Transforms fields with the `@connection` directive:
 * - Verifies that the field type is connection-like.
 * - Adds a `handle` property to the field, either the user-provided `handle`
 *   argument or the default value "connection".
 * - Inserts a sub-fragment on the field to ensure that standard connection
 *   fields are fetched (e.g. cursors, node ids, page info).
 */
function relayConnectionTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      Fragment: visitFragmentOrRoot,
      LinkedField: visitLinkedField,
      Root: visitFragmentOrRoot,
    },
    node => ({
      path: [],
      connectionMetadata: [],
    }),
  );
}

const SCHEMA_EXTENSION = `
  directive @connection(
    key: String!
    filters: [String]
    handler: String
  ) on FIELD
`;

/**
 * @internal
 */
function visitFragmentOrRoot<N: Fragment | Root>(
  node: N,
  options: Options,
): ?N {
  const transformedNode = this.traverse(node, options);
  const connectionMetadata = options.connectionMetadata;
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
function visitLinkedField(field: LinkedField, options: Options): LinkedField {
  const nullableType = SchemaUtils.getNullableType(field.type);
  const isPlural = nullableType instanceof GraphQLList;
  const path = options.path.concat(isPlural ? null : field.alias || field.name);
  let transformedField = this.traverse(field, {
    ...options,
    path,
  });
  const connectionDirective = field.directives.find(
    directive => directive.name === CONNECTION,
  );
  if (!connectionDirective) {
    return transformedField;
  }
  if (
    !(nullableType instanceof GraphQLObjectType) &&
    !(nullableType instanceof GraphQLInterfaceType)
  ) {
    throw new createUserError(
      `@${connectionDirective.name} used on invalid field '${field.name}'. ` +
        'Expected the return type to be a non-plural interface or object, ' +
        `got '${String(field.type)}'.`,
      [transformedField.loc],
    );
  }

  validateConnectionSelection(transformedField);
  validateConnectionType(transformedField, nullableType, connectionDirective);

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
  } else if (lastArg && firstArg) {
    direction = 'bidirectional';
    // TODO(T26511885) Maybe add connection metadata to this case
  }
  const countVariable =
    countArg && countArg.value.kind === 'Variable'
      ? countArg.value.variableName
      : null;
  const cursorVariable =
    cursorArg && cursorArg.value.kind === 'Variable'
      ? cursorArg.value.variableName
      : null;
  options.connectionMetadata.push({
    count: countVariable,
    cursor: cursorVariable,
    direction,
    path: pathHasPlural ? null : (path: any),
  });

  const {handler, key, filters: literalFilters} = getLiteralArgumentValues(
    connectionDirective.args,
  );
  if (handler != null && typeof handler !== 'string') {
    const handleArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${HANDLER} argument to ` +
        `@${CONNECTION} to be a string literal for field ${field.name}.`,
      [handleArg?.value?.loc ?? connectionDirective.loc],
    );
  }
  if (typeof key !== 'string') {
    const keyArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${KEY} argument to ` +
        `@${CONNECTION} to be a string literal for field ${field.name}.`,
      [keyArg?.value?.loc ?? connectionDirective.loc],
    );
  }
  const postfix = field.alias || field.name;
  if (!key.endsWith('_' + postfix)) {
    const keyArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${KEY} argument to ` +
        `@${CONNECTION} to be of form <SomeName>_${postfix}, got '${key}'. ` +
        'For detailed explanation, check out ' +
        'https://facebook.github.io/relay/docs/en/pagination-container.html#connection',
      [keyArg?.value?.loc ?? connectionDirective.loc],
    );
  }
  if (
    literalFilters != null &&
    (!Array.isArray(literalFilters) ||
      literalFilters.some(filter => typeof filter !== 'string'))
  ) {
    const filtersArg = connectionDirective.args.find(
      arg => arg.name === 'filters',
    );
    throw createUserError(
      `Expected the 'filters' argument to @${CONNECTION} to be a string literal.`,
      [filtersArg?.value?.loc ?? connectionDirective.loc],
    );
  }

  let filters = literalFilters;
  if (filters == null) {
    const generatedFilters = field.args
      .filter(
        arg =>
          !ConnectionInterface.isConnectionCall({
            name: arg.name,
            value: null,
          }),
      )
      .map(arg => arg.name);
    filters = generatedFilters.length !== 0 ? generatedFilters : null;
  }

  const handle = {
    name: handler ?? CONNECTION,
    key,
    filters,
  };

  if (direction !== null) {
    const fragment = generateConnectionFragment(
      this.getContext(),
      transformedField.loc,
      nullableType,
      direction,
    );
    transformedField = {
      ...transformedField,
      selections: transformedField.selections.concat(fragment),
    };
  }
  return {
    ...transformedField,
    directives: transformedField.directives.filter(
      directive => directive.name !== CONNECTION,
    ),
    handles: transformedField.handles
      ? [...transformedField.handles, handle]
      : [handle],
  };
}

/**
 * @internal
 *
 * Generates a fragment on the given type that fetches the minimal connection
 * fields in order to merge different pagination results together at runtime.
 */
function generateConnectionFragment(
  context: CompilerContext,
  loc: Location,
  nullableType: GraphQLInterfaceType | GraphQLObjectType,
  direction: 'forward' | 'backward' | 'bidirectional',
): InlineFragment {
  const {
    CURSOR,
    EDGES,
    END_CURSOR,
    HAS_NEXT_PAGE,
    HAS_PREV_PAGE,
    NODE,
    PAGE_INFO,
    START_CURSOR,
  } = ConnectionInterface.get();

  let pageInfo = PAGE_INFO;
  if (direction === 'forward') {
    pageInfo += `{
      ${END_CURSOR}
      ${HAS_NEXT_PAGE}
    }`;
  } else if (direction === 'backward') {
    pageInfo += `{
      ${HAS_PREV_PAGE}
      ${START_CURSOR}
    }`;
  } else {
    pageInfo += `{
      ${END_CURSOR}
      ${HAS_NEXT_PAGE}
      ${HAS_PREV_PAGE}
      ${START_CURSOR}
    }`;
  }

  const typeName = String(nullableType);
  const fragmentString = `fragment ConnectionFragment on ${typeName} {
    ${EDGES} {
      ${CURSOR}
      ${NODE} {
        __typename # rely on GenerateRequisiteFieldTransform to add "id"
      }
    }
    ${pageInfo}
  }`;

  const ast = parse(fragmentString);
  const fragmentAST = ast.definitions[0];
  if (fragmentAST == null || fragmentAST.kind !== 'FragmentDefinition') {
    throw createCompilerError(
      'RelayConnectionTransform: Expected a fragment definition AST.',
      null,
      [fragmentAST].filter(Boolean),
    );
  }
  const fragment = RelayParser.transform(context.clientSchema, [
    fragmentAST,
  ])[0];
  if (fragment == null || fragment.kind !== 'Fragment') {
    throw createCompilerError(
      'RelayConnectionTransform: Expected a connection fragment.',
      [fragment?.loc].filter(Boolean),
    );
  }
  return {
    directives: [],
    kind: 'InlineFragment',
    loc: {kind: 'Derived', source: loc},
    metadata: null,
    selections: fragment.selections,
    typeCondition: nullableType,
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
function validateConnectionSelection(field: LinkedField): void {
  const {EDGES} = ConnectionInterface.get();

  if (!findArg(field, FIRST) && !findArg(field, LAST)) {
    throw createUserError(
      `Expected field '${field.name}' to have a '${FIRST}' or '${LAST}' ` +
        'argument.',
      [field.loc],
    );
  }
  if (
    !field.selections.some(
      selection => selection.kind === 'LinkedField' && selection.name === EDGES,
    )
  ) {
    throw createUserError(
      `Expected field '${field.name}' to have an '${EDGES}' selection.`,
      [field.loc],
    );
  }
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
  field: LinkedField,
  nullableType: GraphQLInterfaceType | GraphQLObjectType,
  connectionDirective: Directive,
): void {
  const directiveName = connectionDirective.name;
  const {
    CURSOR,
    EDGES,
    END_CURSOR,
    HAS_NEXT_PAGE,
    HAS_PREV_PAGE,
    NODE,
    PAGE_INFO,
    START_CURSOR,
  } = ConnectionInterface.get();

  const typeName = String(nullableType);
  const typeFields = nullableType.getFields();
  const edges = typeFields[EDGES];

  if (edges == null) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES}' field`,
      [field.loc],
    );
  }

  const edgesType = SchemaUtils.getNullableType(edges.type);
  if (!(edgesType instanceof GraphQLList)) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES}' field that returns ` +
        'a list of objects.',
      [field.loc],
    );
  }
  const edgeType = SchemaUtils.getNullableType(edgesType.ofType);
  if (!(edgeType instanceof GraphQLObjectType)) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES}' field that returns ` +
        'a list of objects.',
      [field.loc],
    );
  }

  const node = edgeType.getFields()[NODE];
  if (node == null) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES} { ${NODE} }' field ` +
        'that returns an object, interface, or union.',
      [field.loc],
    );
  }
  const nodeType = SchemaUtils.getNullableType(node.type);
  if (
    !(
      nodeType instanceof GraphQLInterfaceType ||
      nodeType instanceof GraphQLUnionType ||
      nodeType instanceof GraphQLObjectType
    )
  ) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES} { ${NODE} }' field ` +
        'that returns an object, interface, or union.',
      [field.loc],
    );
  }

  const cursor = edgeType.getFields()[CURSOR];
  if (
    cursor == null ||
    !(SchemaUtils.getNullableType(cursor.type) instanceof GraphQLScalarType)
  ) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have an '${EDGES} { ${CURSOR} }' field ` +
        'that returns a scalar value.',
      [field.loc],
    );
  }

  const pageInfo = typeFields[PAGE_INFO];
  if (pageInfo == null) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have a '${PAGE_INFO}' field that returns ` +
        'an object.',
      [field.loc],
    );
  }
  const pageInfoType = SchemaUtils.getNullableType(pageInfo.type);
  if (!(pageInfoType instanceof GraphQLObjectType)) {
    throw createUserError(
      `@${directiveName} used on invalid field '${field.name}'. Expected the ` +
        `field type '${typeName}' to have a '${PAGE_INFO}' field that ` +
        'returns an object.',
      [field.loc],
    );
  }

  [END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, START_CURSOR].forEach(
    fieldName => {
      const pageInfoField = pageInfoType.getFields()[fieldName];
      if (
        pageInfoField == null ||
        !(
          SchemaUtils.getNullableType(pageInfoField.type) instanceof
          GraphQLScalarType
        )
      ) {
        throw createUserError(
          `@${directiveName} used on invalid field '${field.name}'. Expected ` +
            `the field type '${typeName}' to have a '${PAGE_INFO} { ${fieldName} }' ` +
            'field returns a scalar.',
          [field.loc],
        );
      }
    },
  );
}

module.exports = {
  CONNECTION,
  SCHEMA_EXTENSION,
  transform: relayConnectionTransform,
};

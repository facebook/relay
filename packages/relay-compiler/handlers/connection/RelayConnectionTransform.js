/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayConnectionTransform
 * @format
 */

'use strict';

const RelayParser = require('../../core/RelayParser');

const invariant = require('invariant');

const {AFTER, BEFORE, FIRST, KEY, LAST} = require('./RelayConnectionConstants');
// TODO T21875029 ../../../relay-runtime/RelayRuntime
const {ConnectionInterface} = require('RelayRuntime');
const {
  assertCompositeType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  parse,
} = require('graphql');
const {
  getLiteralArgumentValues,
  IRTransformer,
  SchemaUtils,
} = require('graphql-compiler');

// TODO T21875029 ../../../relay-runtime/handlers/connection/RelayConnectionHandler
import type {ConnectionMetadata} from 'RelayConnectionHandler';
import type {
  Argument,
  Fragment,
  InlineFragment,
  LinkedField,
  Root,
  CompilerContext,
} from 'graphql-compiler';
import type {GraphQLType} from 'graphql';

type Options = {
  // The current path
  path: Array<?string>,
  // Metadata recorded for @connection fields
  connectionMetadata: Array<ConnectionMetadata>,
  definitionName: string,
};

const CONNECTION = 'connection';

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
      definitionName: node.name,
    }),
  );
}

const SCHEMA_EXTENSION =
  'directive @connection(key: String!, filters: [String]) on FIELD';

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
  const isPlural =
    SchemaUtils.getNullableType(field.type) instanceof GraphQLList;
  options.path.push(isPlural ? null : field.alias || field.name);
  let transformedField = this.traverse(field, options);
  const connectionDirective = field.directives.find(
    directive => directive.name === CONNECTION,
  );
  if (!connectionDirective) {
    options.path.pop();
    return transformedField;
  }
  const {definitionName} = options;
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
    path: pathHasPlural ? null : ([...options.path]: any),
  });
  options.path.pop();

  const {key, filters} = getLiteralArgumentValues(connectionDirective.args);
  invariant(
    typeof key === 'string',
    'RelayConnectionTransform: Expected the %s argument to @%s to ' +
      'be a string literal for field %s',
    KEY,
    CONNECTION,
    field.name,
  );
  const postfix = `${field.alias || field.name}`;
  invariant(
    key.endsWith('_' + postfix),
    'RelayConnectionTransform: Expected the %s argument to @%s to ' +
      'be of form <SomeName>_%s, but get %s. For detailed explanation, check out the dex page ' +
      'https://facebook.github.io/relay/docs/pagination-container.html#connection-directive',
    KEY,
    CONNECTION,
    postfix,
    key,
  );

  const generateFilters = () => {
    const filteredVariableArgs = field.args
      .filter(
        arg =>
          !ConnectionInterface.isConnectionCall({
            name: arg.name,
            value: null,
          }),
      )
      .map(arg => arg.name);
    return filteredVariableArgs.length === 0 ? null : filteredVariableArgs;
  };

  const handle = {
    name: CONNECTION,
    key,
    filters: filters || generateFilters(),
  };

  if (direction !== null) {
    const fragment = generateConnectionFragment(
      this.getContext(),
      transformedField.type,
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
  type: GraphQLType,
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

  const compositeType = assertCompositeType(
    SchemaUtils.getNullableType((type: $FlowFixMe)),
  );

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

  const fragmentString = `fragment ConnectionFragment on ${String(
    compositeType,
  )} {
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
  invariant(
    fragmentAST && fragmentAST.kind === 'FragmentDefinition',
    'RelayConnectionTransform: Expected a fragment definition AST.',
  );
  const fragment = RelayParser.transform(context.clientSchema, fragmentAST);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'RelayConnectionTransform: Expected a connection fragment.',
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
  const {EDGES} = ConnectionInterface.get();

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
    field.selections.some(
      selection => selection.kind === 'LinkedField' && selection.name === EDGES,
    ),
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

  const typeWithFields = SchemaUtils.assertTypeWithFields(
    SchemaUtils.getNullableType((type: $FlowFixMe)),
  );
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

  const edgesType = SchemaUtils.getNullableType(edges.type);
  invariant(
    edgesType instanceof GraphQLList,
    'RelayConnectionTransform: Expected `%s` field on type `%s` to be a ' +
      'list type in document `%s`.',
    EDGES,
    type,
    definitionName,
  );
  const edgeType = SchemaUtils.getNullableType(edgesType.ofType);
  invariant(
    edgeType instanceof GraphQLObjectType,
    'RelayConnectionTransform: Expected %s field on type `%s` to be a list ' +
      'of objects in document `%s`.',
    EDGES,
    type,
    definitionName,
  );

  const node = edgeType.getFields()[NODE];
  invariant(
    node,
    'RelayConnectionTransform: Expected type `%s` to have an %s.%s field in ' +
      'document `%s`.',
    type,
    EDGES,
    NODE,
    definitionName,
  );
  const nodeType = SchemaUtils.getNullableType(node.type);
  invariant(
    nodeType instanceof GraphQLInterfaceType ||
      nodeType instanceof GraphQLUnionType ||
      nodeType instanceof GraphQLObjectType,
    'RelayConnectionTransform: Expected type `%s` to have an %s.%s field' +
      'for which the type is an interface, object, or union in document `%s`.',
    type,
    EDGES,
    NODE,
    definitionName,
  );

  const cursor = edgeType.getFields()[CURSOR];
  invariant(
    cursor &&
      SchemaUtils.getNullableType(cursor.type) instanceof GraphQLScalarType,
    'RelayConnectionTransform: Expected type `%s` to have an ' +
      '%s.%s field for which the type is a scalar in document `%s`.',
    type,
    EDGES,
    CURSOR,
    definitionName,
  );

  const pageInfo = typeFields[PAGE_INFO];
  invariant(
    pageInfo,
    'RelayConnectionTransform: Expected type `%s` to have a %s field ' +
      'in document `%s`.',
    type,
    PAGE_INFO,
    definitionName,
  );
  const pageInfoType = SchemaUtils.getNullableType(pageInfo.type);
  invariant(
    pageInfoType instanceof GraphQLObjectType,
    'RelayConnectionTransform: Expected type `%s` to have a %s field for ' +
      'which the type is an object in document `%s`.',
    type,
    PAGE_INFO,
    definitionName,
  );

  [END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, START_CURSOR].forEach(
    fieldName => {
      const pageInfoField = pageInfoType.getFields()[fieldName];
      invariant(
        pageInfoField &&
          SchemaUtils.getNullableType(pageInfoField.type) instanceof
            GraphQLScalarType,
        'RelayConnectionTransform: Expected type `%s` to have an ' +
          '%s field for which the type is an scalar in document `%s`.',
        pageInfo.type,
        fieldName,
        definitionName,
      );
    },
  );
}

module.exports = {
  CONNECTION,
  SCHEMA_EXTENSION,
  transform: relayConnectionTransform,
};

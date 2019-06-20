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
  GraphQLString,
  GraphQLUnionType,
  parse,
} = require('graphql');
const {ConnectionInterface, RelayFeatureFlags} = require('relay-runtime');

import type CompilerContext from '../../core/GraphQLCompilerContext';
import type {
  Argument,
  Directive,
  Fragment,
  Handle,
  InlineFragment,
  LinkedField,
  Root,
  Selection,
  Variable,
  Location,
} from '../../core/GraphQLIR';
import type {ConnectionMetadata} from 'relay-runtime';

type Options = {
  // The current path
  path: Array<?string>,
  // Metadata recorded for @connection fields
  connectionMetadata: Array<ConnectionMetadata>,
};

type ConnectionArguments = {|
  handler: ?string,
  key: string,
  dynamicKey: Variable | null,
  filters: ?$ReadOnlyArray<string>,
  stream: ?{|
    if: ?Argument,
    initialCount: ?Argument,
    label: string,
  |},
|};

const CONNECTION = 'connection';
const STREAM_CONNECTION = 'stream_connection';
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
    dynamicKey_UNSTABLE: String
  ) on FIELD

  directive @stream_connection(
    key: String!
    filters: [String]
    handler: String
    label: String!
    initial_count: Int!
    if: Boolean = true
    dynamicKey_UNSTABLE: String
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
  let transformedField: LinkedField = this.traverse(field, {
    ...options,
    path,
  });
  const connectionDirective = field.directives.find(
    directive =>
      directive.name === CONNECTION || directive.name === STREAM_CONNECTION,
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

  const connectionArguments = buildConnectionArguments(
    transformedField,
    connectionDirective,
  );

  const connectionMetadata = buildConnectionMetadata(
    transformedField,
    path,
    connectionArguments,
  );
  options.connectionMetadata.push(connectionMetadata);

  const handle: Handle = {
    name: connectionArguments.handler ?? CONNECTION,
    key: connectionArguments.key,
    dynamicKey: connectionArguments.dynamicKey,
    filters: connectionArguments.filters,
  };

  const {direction} = connectionMetadata;
  if (direction != null) {
    const selections = transformConnectionSelections(
      this.getContext(),
      transformedField,
      nullableType,
      direction,
      connectionArguments,
      connectionDirective.loc,
    );
    transformedField = {
      ...transformedField,
      selections,
    };
  }
  return {
    ...transformedField,
    directives: transformedField.directives.filter(
      directive => directive !== connectionDirective,
    ),
    handles: transformedField.handles
      ? [...transformedField.handles, handle]
      : [handle],
  };
}

function buildConnectionArguments(
  field: LinkedField,
  connectionDirective: Directive,
): ConnectionArguments {
  const {
    handler,
    key,
    label,
    filters: literalFilters,
  } = getLiteralArgumentValues(connectionDirective.args);
  if (handler != null && typeof handler !== 'string') {
    const handleArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${HANDLER} argument to @${connectionDirective.name} to ` +
        `be a string literal for field ${field.name}.`,
      [handleArg?.value?.loc ?? connectionDirective.loc],
    );
  }
  if (typeof key !== 'string') {
    const keyArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${KEY} argument to @${connectionDirective.name} to be a ` +
        `string literal for field ${field.name}.`,
      [keyArg?.value?.loc ?? connectionDirective.loc],
    );
  }
  const postfix = field.alias || field.name;
  if (!key.endsWith('_' + postfix)) {
    const keyArg = connectionDirective.args.find(arg => arg.name === 'key');
    throw createUserError(
      `Expected the ${KEY} argument to @${connectionDirective.name} to be of ` +
        `form <SomeName>_${postfix}, got '${key}'. ` +
        'For a detailed explanation, check out ' +
        'https://relay.dev/docs/en/pagination-container#connection',
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
      `Expected the 'filters' argument to @${connectionDirective.name} to be ` +
        'a string literal.',
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

  let stream = null;
  if (connectionDirective.name === STREAM_CONNECTION) {
    const initialCountArg = connectionDirective.args.find(
      arg => arg.name === 'initial_count',
    );
    const ifArg = connectionDirective.args.find(arg => arg.name === 'if');
    if (label != null && typeof label !== 'string') {
      const labelArg = connectionDirective.args.find(
        arg => arg.name === 'label',
      );
      throw createUserError(
        `Expected the 'label' argument to @${
          connectionDirective.name
        } to be a string literal for field ${field.name}.`,
        [labelArg?.value?.loc ?? connectionDirective.loc],
      );
    }
    stream = {if: ifArg, initialCount: initialCountArg, label: label ?? key};
  }

  // T45504512: new connection model
  const dynamicKeyArg = connectionDirective.args.find(
    arg => arg.name === 'dynamicKey_UNSTABLE',
  );
  let dynamicKey: Variable | null = null;
  if (dynamicKeyArg != null) {
    if (
      RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY &&
      dynamicKeyArg.value.kind === 'Variable'
    ) {
      dynamicKey = dynamicKeyArg.value;
    } else {
      throw createUserError(
        `Unsupported 'dynamicKey_UNSTABLE' argument to @${
          connectionDirective.name
        }. This argument is only valid when the feature flag is enabled and ` +
          'the variable must be a variable',
        [connectionDirective.loc],
      );
    }
  }

  return {
    handler,
    key,
    dynamicKey,
    filters: (filters: $FlowFixMe),
    stream,
  };
}

function buildConnectionMetadata(
  field: LinkedField,
  path: Array<?string>,
  connectionArguments: ConnectionArguments,
): ConnectionMetadata {
  const pathHasPlural = path.includes(null);
  const firstArg = findArg(field, FIRST);
  const lastArg = findArg(field, LAST);
  let direction = null;
  let countArg = null;
  let cursorArg = null;
  if (firstArg && !lastArg) {
    direction = 'forward';
    countArg = firstArg;
    cursorArg = findArg(field, AFTER);
  } else if (lastArg && !firstArg) {
    direction = 'backward';
    countArg = lastArg;
    cursorArg = findArg(field, BEFORE);
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
  if (connectionArguments.stream != null) {
    return {
      count: countVariable,
      cursor: cursorVariable,
      direction,
      path: pathHasPlural ? null : (path: any),
      stream: true,
    };
  }
  return {
    count: countVariable,
    cursor: cursorVariable,
    direction,
    path: pathHasPlural ? null : (path: any),
  };
}

/**
 * @internal
 *
 * Transforms the selections on a connection field, generating fields necessary
 * for pagination (edges.cursor, pageInfo, etc) and adding/merging them with
 * existing selections.
 */
function transformConnectionSelections(
  context: CompilerContext,
  field: LinkedField,
  nullableType: GraphQLInterfaceType | GraphQLObjectType,
  direction: 'forward' | 'backward' | 'bidirectional',
  connectionArguments: ConnectionArguments,
  directiveLocation: Location,
): Array<Selection> {
  const derivedFieldLocation = {kind: 'Derived', source: field.loc};
  const derivedDirectiveLocation = {
    kind: 'Derived',
    source: directiveLocation,
  };
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

  // Find existing edges/pageInfo selections
  let edgesSelection: ?LinkedField;
  let pageInfoSelection: ?LinkedField;
  field.selections.forEach(selection => {
    if (selection.kind === 'LinkedField') {
      if (selection.name === EDGES) {
        if (edgesSelection != null) {
          throw createCompilerError(
            `RelayConnectionTransform: Unexpected duplicate field '${EDGES}'.`,
            [edgesSelection.loc, selection.loc],
          );
        }
        edgesSelection = selection;
        return;
      } else if (selection.name === PAGE_INFO) {
        if (pageInfoSelection != null) {
          throw createCompilerError(
            `RelayConnectionTransform: Unexpected duplicate field '${PAGE_INFO}'.`,
            [pageInfoSelection.loc, selection.loc],
          );
        }
        pageInfoSelection = selection;
        return;
      }
    }
  });
  // If streaming is enabled, construct directives to apply to the edges/
  // pageInfo fields
  let streamDirective;
  let deferDirective;
  const stream = connectionArguments.stream;
  if (stream != null) {
    streamDirective = {
      args: [
        stream.if,
        stream.initialCount,
        {
          kind: 'Argument',
          loc: derivedDirectiveLocation,
          metadata: null,
          name: 'label',
          type: GraphQLString,
          value: {
            kind: 'Literal',
            loc: derivedDirectiveLocation,
            metadata: null,
            value: stream.label,
          },
        },
      ].filter(Boolean),
      kind: 'Directive',
      loc: derivedDirectiveLocation,
      metadata: null,
      name: 'stream',
    };
    deferDirective = {
      args: [
        stream.if,
        {
          kind: 'Argument',
          loc: derivedDirectiveLocation,
          metadata: null,
          name: 'label',
          type: GraphQLString,
          value: {
            kind: 'Literal',
            loc: derivedDirectiveLocation,
            metadata: null,
            value: stream.label + '$' + PAGE_INFO,
          },
        },
      ].filter(Boolean),
      kind: 'Directive',
      loc: derivedDirectiveLocation,
      metadata: null,
      name: 'defer',
    };
  }
  // For backwards compatibility with earlier versions of this transform,
  // edges/pageInfo have to be generated as non-aliased fields (since product
  // code may be accessing the non-aliased response keys). But for streaming
  // mode we need to generate @stream/@defer directives on these fields *and*
  // we prefer to avoid generating extra selections (we want one payload per
  // item, not two as could happen with separate @stream directives on the
  // aliased and non-aliased edges fields). So we keep things simple by
  // disallowing aliases on edges/pageInfo in streaming mode.
  if (edgesSelection && edgesSelection.alias != null) {
    if (stream) {
      throw createUserError(
        `@stream_connection does not support aliasing the '${EDGES}' field.`,
        [edgesSelection.loc],
      );
    }
    edgesSelection = null;
  }
  if (pageInfoSelection && pageInfoSelection.alias != null) {
    if (stream) {
      throw createUserError(
        `@stream_connection does not support aliasing the '${PAGE_INFO}' field.`,
        [pageInfoSelection.loc],
      );
    }
    pageInfoSelection = null;
  }

  // Separately create transformed versions of edges/pageInfo so that we can
  // later replace the originals at the same point within the selection array
  let transformedEdgesSelection: ?LinkedField = edgesSelection;
  let transformedPageInfoSelection: ?(
    | LinkedField
    | InlineFragment
  ) = pageInfoSelection;
  const edgesType = nullableType.getFields()[EDGES].type;
  const pageInfoType = nullableType.getFields()[PAGE_INFO].type;
  if (transformedEdgesSelection == null) {
    transformedEdgesSelection = {
      alias: null,
      args: [],
      directives: [],
      handles: null,
      kind: 'LinkedField',
      loc: derivedFieldLocation,
      metadata: null,
      name: EDGES,
      selections: [],
      type: edgesType,
    };
  }
  if (transformedPageInfoSelection == null) {
    transformedPageInfoSelection = {
      alias: null,
      args: [],
      directives: [],
      handles: null,
      kind: 'LinkedField',
      loc: derivedFieldLocation,
      metadata: null,
      name: PAGE_INFO,
      selections: [],
      type: pageInfoType,
    };
  }

  // Generate (additional) fields on pageInfo and add to the transformed
  // pageInfo field
  const pageInfoRawType = SchemaUtils.getRawType(pageInfoType);
  let pageInfoText;
  if (direction === 'forward') {
    pageInfoText = `fragment PageInfo on ${String(pageInfoRawType)} {
      ${END_CURSOR}
      ${HAS_NEXT_PAGE}
    }`;
  } else if (direction === 'backward') {
    pageInfoText = `fragment PageInfo on ${String(pageInfoRawType)}  {
      ${HAS_PREV_PAGE}
      ${START_CURSOR}
    }`;
  } else {
    pageInfoText = `fragment PageInfo on ${String(pageInfoRawType)}  {
      ${END_CURSOR}
      ${HAS_NEXT_PAGE}
      ${HAS_PREV_PAGE}
      ${START_CURSOR}
    }`;
  }
  const pageInfoAst = parse(pageInfoText);
  const pageInfoFragment = RelayParser.transform(context.clientSchema, [
    pageInfoAst.definitions[0],
  ])[0];
  if (transformedPageInfoSelection.kind !== 'LinkedField') {
    throw createCompilerError(
      'RelayConnectionTransform: Expected generated pageInfo selection to be ' +
        'a LinkedField',
      [field.loc],
    );
  }
  transformedPageInfoSelection = {
    ...transformedPageInfoSelection,
    selections: [
      ...transformedPageInfoSelection.selections,
      {
        directives: [],
        kind: 'InlineFragment',
        loc: derivedFieldLocation,
        metadata: null,
        typeCondition: pageInfoFragment.type,
        selections: pageInfoFragment.selections,
      },
    ],
  };
  // When streaming the pageInfo field has to be deferred
  if (deferDirective != null) {
    transformedPageInfoSelection = {
      directives: [deferDirective],
      kind: 'InlineFragment',
      loc: derivedFieldLocation,
      metadata: null,
      typeCondition: nullableType,
      selections: [transformedPageInfoSelection],
    };
  }

  // Generate additional fields on edges and append to the transformed edges
  // selection
  const edgeText = `
    fragment Edges on ${String(SchemaUtils.getRawType(edgesType))} {
      ${CURSOR}
      ${NODE} {
        __typename # rely on GenerateRequisiteFieldTransform to add "id"
      }
    }
  `;
  const edgeAst = parse(edgeText);
  const edgeFragment = RelayParser.transform(context.clientSchema, [
    edgeAst.definitions[0],
  ])[0];
  // When streaming the edges field needs @stream
  transformedEdgesSelection = {
    ...transformedEdgesSelection,
    directives:
      streamDirective != null
        ? [...transformedEdgesSelection.directives, streamDirective]
        : transformedEdgesSelection.directives,
    selections: [
      ...transformedEdgesSelection.selections,
      {
        directives: [],
        kind: 'InlineFragment',
        loc: derivedFieldLocation,
        metadata: null,
        typeCondition: edgeFragment.type,
        selections: edgeFragment.selections,
      },
    ],
  };
  // Copy the original selections, replacing edges/pageInfo (if present)
  // with the generated locations. This is to maintain the original field
  // ordering.
  const selections = field.selections.map(selection => {
    if (
      transformedEdgesSelection != null &&
      edgesSelection != null &&
      selection === edgesSelection
    ) {
      return transformedEdgesSelection;
    } else if (
      transformedPageInfoSelection != null &&
      pageInfoSelection != null &&
      selection === pageInfoSelection
    ) {
      return transformedPageInfoSelection;
    } else {
      return selection;
    }
  });
  // If edges/pageInfo were missing, append the generated versions instead.
  if (edgesSelection == null && transformedEdgesSelection != null) {
    selections.push(transformedEdgesSelection);
  }
  if (pageInfoSelection == null && transformedPageInfoSelection != null) {
    selections.push(transformedPageInfoSelection);
  }
  return selections;
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
  if (
    !(edgeType instanceof GraphQLObjectType) &&
    !(edgeType instanceof GraphQLInterfaceType)
  ) {
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

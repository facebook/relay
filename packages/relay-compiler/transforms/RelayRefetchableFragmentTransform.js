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

const GraphQLIRVisitor = require('../core/GraphQLIRVisitor');
const SchemaUtils = require('../core/SchemaUtils');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const inferRootArgumentDefinitions = require('../core/inferRootArgumentDefinitions');

const {
  createUserError,
  eachWithCombinedError,
} = require('../core/RelayCompilerError');
const {generateIDField} = require('../core/SchemaUtils');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {
  Argument,
  ArgumentDefinition,
  Field,
  Fragment,
  FragmentSpread,
  LocalArgumentDefinition,
  Root,
} from '../core/GraphQLIR';
import type {Schema} from '../core/Schema';
import type {ReaderPaginationMetadata} from 'relay-runtime';

type RefetchRoot = {|
  path: $ReadOnlyArray<string>,
  node: Root,
  transformedFragment: Fragment,
|};

const VIEWER_TYPE_NAME = 'Viewer';
const VIEWER_FIELD_NAME = 'viewer';
const NODE_TYPE_NAME = 'Node';
const NODE_FIELD_NAME = 'node';

const SCHEMA_EXTENSION = `
  directive @refetchable(
    queryName: String!
  ) on FRAGMENT_DEFINITION
`;

/**
 * This transform synthesizes "refetch" queries for fragments that
 * are trivially refetchable. This is comprised of three main stages:
 *
 * 1. Validating that fragments marked with @refetchable qualify for
 *    refetch query generation; mainly this means that the fragment
 *    type is able to be refetched in some canonical way.
 * 2. Determining the variable definitions to use for each generated
 *    query. GraphQL does not have a notion of fragment-local variables
 *    at all, and although Relay adds this concept developers are still
 *    allowed to reference global variables. This necessitates a
 *    visiting all reachable fragments for each @refetchable fragment,
 *    and finding the union of all global variables expceted to be defined.
 * 3. Building the refetch queries, a straightforward copying transform from
 *    Fragment to Root IR nodes.
 */
function relayRefetchableFragmentTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  const schema = context.getSchema();
  // This will throw (if Query is not available in the schema)
  const queryType = schema.expectQueryType();

  const refetchOperations = buildRefetchMap(context);
  let nextContext = context;
  eachWithCombinedError(refetchOperations, ([refetchName, fragment]) => {
    // Build a refetch operation according to the fragment's type:
    // the logic here is purely name-based, the actual transform
    // functions provide detailed validation as well as case-specific
    // error messages.
    let refetchDescriptor;
    if (schema.areEqualTypes(fragment.type, queryType)) {
      refetchDescriptor = buildRefetchOperationOnQueryType(
        context,
        schema,
        fragment,
        refetchName,
      );
    } else if (schema.getTypeString(fragment.type) === VIEWER_TYPE_NAME) {
      // Validate that the schema conforms to the informal Viewer spec
      // and build the refetch query accordingly.
      refetchDescriptor = buildRefetchOperationOnViewerType(
        context,
        schema,
        fragment,
        refetchName,
      );
    } else if (
      schema.getTypeString(fragment.type) === NODE_TYPE_NAME ||
      (schema.isObject(fragment.type) &&
        schema
          .getInterfaces(schema.assertCompositeType(fragment.type))
          .some(interfaceType =>
            schema.areEqualTypes(
              interfaceType,
              schema.expectTypeFromString(NODE_TYPE_NAME),
            ),
          )) ||
      (schema.isAbstractType(fragment.type) &&
        Array.from(
          schema.getPossibleTypes(schema.assertAbstractType(fragment.type)),
        ).every(possibleType =>
          schema.implementsInterface(
            schema.assertCompositeType(possibleType),
            schema.assertInterfaceType(
              schema.expectTypeFromString(NODE_TYPE_NAME),
            ),
          ),
        ))
    ) {
      // Validate that the schema conforms to the Object Identity (Node) spec
      // and build the refetch query accordingly.
      refetchDescriptor = buildRefetchOperationOnNodeType(
        context,
        schema,
        fragment,
        refetchName,
      );
    } else {
      throw createUserError(
        `Invalid use of @refetchable on fragment '${
          fragment.name
        }', only fragments on the Query type, Viewer type, Node type, or types implementing Node are supported.`,
        [fragment.loc],
      );
    }
    if (refetchDescriptor != null) {
      const {path, node, transformedFragment} = refetchDescriptor;
      const connectionMetadata = extractConnectionMetadata(
        context.getSchema(),
        transformedFragment,
      );
      nextContext = nextContext.replace({
        ...transformedFragment,
        metadata: {
          ...(transformedFragment.metadata || {}),
          refetch: {
            connection: connectionMetadata ?? null,
            operation: refetchName,
            fragmentPathInResult: path,
          },
        },
      });
      nextContext = nextContext.add({
        ...node,
        metadata: {
          ...(node.metadata || {}),
          derivedFrom: transformedFragment.name,
          isRefetchableQuery: true,
        },
      });
    }
  });
  return nextContext;
}

/**
 * Walk the documents of a compiler context and create a mapping of
 * refetch operation names to the source fragment from which the refetch
 * operation should be derived.
 */
function buildRefetchMap(
  context: GraphQLCompilerContext,
): Map<string, Fragment> {
  const refetchOperations = new Map();
  eachWithCombinedError(context.documents(), node => {
    if (node.kind !== 'Fragment') {
      return;
    }
    const refetchName = getRefetchQueryName(node);
    if (refetchName === null) {
      return;
    }
    const previousOperation = refetchOperations.get(refetchName);
    if (previousOperation != null) {
      throw createUserError(
        `Duplicate definition for @refetchable operation '${refetchName}' from fragments '${
          node.name
        }' and '${previousOperation.name}'`,
        [node.loc, previousOperation.loc],
      );
    }
    refetchOperations.set(refetchName, node);
  });
  const transformed = inferRootArgumentDefinitions(context);
  return new Map(
    Array.from(refetchOperations.entries(), ([name, fragment]) => {
      return [name, transformed.getFragment(fragment.name)];
    }),
  );
}

/**
 * Validate that any @connection usage is valid for refetching:
 * - Variables are used for both the "count" and "cursor" arguments
 *   (after/first or before/last)
 * - Exactly one connection
 * - Has a stable path to the connection data
 *
 * Returns connection metadata to add to the transformed fragment or undefined
 * if there is no connection.
 */
function extractConnectionMetadata(
  schema: Schema,
  fragment: Fragment,
): ReaderPaginationMetadata | void {
  const fields = [];
  let connectionField = null;
  let path = null;
  GraphQLIRVisitor.visit(fragment, {
    ConnectionField: {
      enter(field) {
        fields.push(field);
        // Disallow connections within plurals
        const pluralOnPath = fields.find(pathField =>
          schema.isList(schema.getNullableType(pathField.type)),
        );
        if (pluralOnPath) {
          throw createUserError(
            `Invalid use of @refetchable with @connection in fragment '${
              fragment.name
            }', refetchable connections cannot appear inside plural fields.`,
            [field.loc, pluralOnPath.loc],
          );
        }
        connectionField = field;
        path = fields.map(pathField => pathField.alias);
      },
      leave() {
        fields.pop();
      },
    },
    LinkedField: {
      enter(field) {
        fields.push(field);
        if (
          field.connection === true ||
          (field.handles &&
            field.handles.some(handle => handle.name === 'connection'))
        ) {
          // Disallow multiple @connections
          if (connectionField != null) {
            throw createUserError(
              `Invalid use of @refetchable with @connection in fragment '${
                fragment.name
              }', at most once @connection can appear in a refetchable fragment.`,
              [field.loc],
            );
          }
          // Disallow connections within plurals
          const pluralOnPath = fields.find(pathField =>
            schema.isList(schema.getNullableType(pathField.type)),
          );
          if (pluralOnPath) {
            throw createUserError(
              `Invalid use of @refetchable with @connection in fragment '${
                fragment.name
              }', refetchable connections cannot appear inside plural fields.`,
              [field.loc, pluralOnPath.loc],
            );
          }
          connectionField = field;
          path = fields.map(pathField => pathField.alias);
        }
      },
      leave() {
        fields.pop();
      },
    },
  });
  if (connectionField == null || path == null) {
    return;
  }
  // Validate arguments: if either of before/last appear they must both appear
  // and use variables (not scalar values)
  let backward = null;
  const before = findArgument(connectionField, 'before');
  const last = findArgument(connectionField, 'last');
  if (before || last) {
    if (
      !before ||
      !last ||
      before.value.kind !== 'Variable' ||
      last.value.kind !== 'Variable'
    ) {
      throw createUserError(
        `Invalid use of @refetchable with @connection in fragment '${
          fragment.name
        }', refetchable connections must use variables for the before and last arguments.`,
        [
          connectionField.loc,
          before && before.value.kind !== 'Variable' ? before.value.loc : null,
          last && last.value.kind !== 'Variable' ? last.value.loc : null,
        ].filter(Boolean),
      );
    }
    backward = {
      count: last.value.variableName,
      cursor: before.value.variableName,
    };
  }
  // Validate arguments: if either of after/first appear they must both appear
  // and use variables (not scalar values)
  let forward = null;
  const after = findArgument(connectionField, 'after');
  const first = findArgument(connectionField, 'first');
  if (after || first) {
    if (
      !after ||
      !first ||
      after.value.kind !== 'Variable' ||
      first.value.kind !== 'Variable'
    ) {
      throw createUserError(
        `Invalid use of @refetchable with @connection in fragment '${
          fragment.name
        }', refetchable connections must use variables for the after and first arguments.`,
        [
          connectionField.loc,
          after && after.value.kind !== 'Variable' ? after.value.loc : null,
          first && first.value.kind !== 'Variable' ? first.value.loc : null,
        ].filter(Boolean),
      );
    }
    forward = {
      count: first.value.variableName,
      cursor: after.value.variableName,
    };
  }
  return {forward, backward, path};
}

function buildOperationArgumentDefinitions(
  argumentDefinitions: $ReadOnlyArray<ArgumentDefinition>,
): $ReadOnlyArray<LocalArgumentDefinition> {
  return argumentDefinitions.map(argDef => {
    if (argDef.kind === 'LocalArgumentDefinition') {
      return argDef;
    } else {
      return {
        kind: 'LocalArgumentDefinition',
        name: argDef.name,
        type: argDef.type,
        defaultValue: null,
        loc: argDef.loc,
      };
    }
  });
}

function buildFragmentSpread(fragment: Fragment): FragmentSpread {
  const args = [];
  for (const argDef of fragment.argumentDefinitions) {
    if (argDef.kind !== 'LocalArgumentDefinition') {
      continue;
    }
    args.push({
      kind: 'Argument',
      loc: {kind: 'Derived', source: argDef.loc},
      name: argDef.name,
      type: argDef.type,
      value: {
        kind: 'Variable',
        loc: {kind: 'Derived', source: argDef.loc},
        variableName: argDef.name,
        type: argDef.type,
      },
    });
  }
  return {
    args,
    directives: [],
    kind: 'FragmentSpread',
    loc: {kind: 'Derived', source: fragment.loc},
    metadata: null,
    name: fragment.name,
  };
}

function buildRefetchOperationOnQueryType(
  context: GraphQLCompilerContext,
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  const queryType = schema.expectQueryType();
  return {
    path: [],
    node: {
      argumentDefinitions: buildOperationArgumentDefinitions(
        fragment.argumentDefinitions,
      ),
      directives: [],
      kind: 'Root',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: queryName,
      operation: 'query',
      selections: [buildFragmentSpread(fragment)],
      type: queryType,
    },
    transformedFragment: fragment,
  };
}

function buildRefetchOperationOnViewerType(
  context: GraphQLCompilerContext,
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  // Handle fragments on viewer
  const queryType = schema.expectQueryType();
  const viewerType = schema.getTypeFromString(VIEWER_TYPE_NAME);
  const viewerField = schema.getFieldConfig(
    schema.expectField(queryType, VIEWER_FIELD_NAME),
  );
  if (
    !(
      viewerType &&
      schema.isObject(viewerType) &&
      schema.isObject(viewerField.type) &&
      schema.areEqualTypes(viewerField.type, viewerType) &&
      viewerField.args.length === 0 &&
      schema.areEqualTypes(fragment.type, viewerType)
    )
  ) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${
        fragment.name
      }', check that your schema defines a 'Viewer' object type and has a 'viewer: Viewer' field on the query type.`,
      [fragment.loc],
    );
  }
  return {
    path: [VIEWER_FIELD_NAME],
    node: {
      argumentDefinitions: buildOperationArgumentDefinitions(
        fragment.argumentDefinitions,
      ),
      directives: [],
      kind: 'Root',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: queryName,
      operation: 'query',
      selections: [
        {
          alias: VIEWER_FIELD_NAME,
          args: [],
          connection: false,
          directives: [],
          handles: null,
          kind: 'LinkedField',
          loc: {kind: 'Derived', source: fragment.loc},
          metadata: null,
          name: VIEWER_FIELD_NAME,
          selections: [buildFragmentSpread(fragment)],
          type: schema.assertLinkedFieldType(viewerType),
        },
      ],
      type: queryType,
    },
    transformedFragment: fragment,
  };
}

function buildRefetchOperationOnNodeType(
  context: GraphQLCompilerContext,
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  const queryType = schema.expectQueryType();
  const nodeType = schema.getTypeFromString(NODE_TYPE_NAME);
  const nodeField = schema.getFieldConfig(
    schema.expectField(queryType, NODE_FIELD_NAME),
  );
  if (
    !(
      nodeType &&
      schema.isInterface(nodeType) &&
      schema.isInterface(nodeField.type) &&
      schema.areEqualTypes(nodeField.type, nodeType) &&
      nodeField.args.length === 1 &&
      schema.areEqualTypes(
        schema.getNullableType(nodeField.args[0].type),
        schema.expectIdType(),
      ) &&
      // the fragment must be on Node or on a type that implements Node
      ((schema.isObject(fragment.type) &&
        schema
          .getInterfaces(schema.assertCompositeType(fragment.type))
          .some(interfaceType =>
            schema.areEqualTypes(interfaceType, nodeType),
          )) ||
        (schema.isAbstractType(fragment.type) &&
          Array.from(
            schema.getPossibleTypes(schema.assertAbstractType(fragment.type)),
          ).every(possibleType =>
            schema
              .getInterfaces(schema.assertCompositeType(possibleType))
              .some(interfaceType =>
                schema.areEqualTypes(interfaceType, nodeType),
              ),
          )))
    )
  ) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${fragment.name}', check ` +
        'that your schema defines a `Node { id: ID }` interface and has a ' +
        '`node(id: ID): Node` field on the query type (the id argument may ' +
        'also be non-null).',
      [fragment.loc],
    );
  }

  // name and type of the node(_: ID) field parameter
  const idArgName = nodeField.args[0].name;
  const idArgType = nodeField.args[0].type;
  // name and type of the query variable
  const idVariableType = SchemaUtils.getNonNullIdInput(schema);
  const idVariableName = 'id';

  const argumentDefinitions = buildOperationArgumentDefinitions(
    fragment.argumentDefinitions,
  );
  const idArgument = argumentDefinitions.find(
    argDef => argDef.name === idVariableName,
  );
  if (idArgument != null) {
    throw createUserError(
      `Invalid use of @refetchable on fragment \`${fragment.name}\`, this ` +
        'fragment already has an `$id` variable in scope.',
      [idArgument.loc],
    );
  }
  const argumentDefinitionsWithId = [
    ...argumentDefinitions,
    {
      defaultValue: null,
      kind: 'LocalArgumentDefinition',
      loc: {kind: 'Derived', source: fragment.loc},
      name: idVariableName,
      type: idVariableType,
    },
  ];
  return {
    path: [NODE_FIELD_NAME],
    node: {
      argumentDefinitions: argumentDefinitionsWithId,
      directives: [],
      kind: 'Root',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: queryName,
      operation: 'query',
      selections: [
        {
          alias: NODE_FIELD_NAME,
          args: [
            {
              kind: 'Argument',
              loc: {kind: 'Derived', source: fragment.loc},
              name: idArgName,
              type: schema.assertInputType(idArgType),
              value: {
                kind: 'Variable',
                loc: {kind: 'Derived', source: fragment.loc},
                variableName: idVariableName,
                type: idVariableType,
              },
            },
          ],
          connection: false,
          directives: [],
          handles: null,
          kind: 'LinkedField',
          loc: {kind: 'Derived', source: fragment.loc},
          metadata: null,
          name: NODE_FIELD_NAME,
          selections: [buildFragmentSpread(fragment)],
          type: schema.assertLinkedFieldType(nodeType),
        },
      ],
      type: queryType,
    },
    transformedFragment: enforceIDField(context.getSchema(), fragment),
  };
}

function enforceIDField(schema: Schema, fragment: Fragment): Fragment {
  const idSelection = fragment.selections.find(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.name === 'id' &&
      selection.alias === 'id' &&
      schema.areEqualTypes(
        schema.getNullableType(selection.type),
        schema.expectIdType(),
      ),
  );
  if (idSelection) {
    return fragment;
  }
  return {
    ...fragment,
    selections: [
      ...fragment.selections,
      generateIDField(schema.expectIdType()),
    ],
  };
}

function getRefetchQueryName(fragment: Fragment): string | null {
  const refetchableDirective = fragment.directives.find(
    directive => directive.name === 'refetchable',
  );
  if (refetchableDirective == null) {
    return null;
  }
  const refetchArguments = getLiteralArgumentValues(refetchableDirective.args);
  const queryName = refetchArguments.queryName;
  if (queryName == null) {
    throw createUserError(
      "Expected the 'queryName' argument of @refetchable to be provided",
      [refetchableDirective.loc],
    );
  } else if (typeof queryName !== 'string') {
    const queryNameArg = refetchableDirective.args.find(
      arg => arg.name === 'queryName',
    );
    throw createUserError(
      `Expected the 'queryName' argument of @refetchable to be a string, got '${String(
        queryName,
      )}'.`,
      [queryNameArg?.loc ?? refetchableDirective.loc],
    );
  }
  return queryName;
}

function findArgument(field: Field, argumentName: string): Argument | null {
  return field.args.find(arg => arg.name === argumentName) ?? null;
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayRefetchableFragmentTransform,
};

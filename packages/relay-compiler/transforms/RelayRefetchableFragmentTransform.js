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

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRVisitor = require('../core/GraphQLIRVisitor');
const GraphQLSchemaUtils = require('../core/GraphQLSchemaUtils');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const inferRootArgumentDefinitions = require('../core/inferRootArgumentDefinitions');
const isEquivalentType = require('../core/isEquivalentType');
const nullthrows = require('nullthrows');

const {
  createCombinedError,
  createCompilerError,
  createUserError,
  eachWithErrors,
} = require('../core/RelayCompilerError');
const {
  assertAbstractType,
  assertCompositeType,
  getNullableType,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} = require('graphql');

import type {GraphQLCompositeType} from 'graphql';
const {
  isAbstractType,
  implementsInterface,
  generateIDField,
} = GraphQLSchemaUtils;

import type {
  Argument,
  ArgumentDefinition,
  Field,
  Fragment,
  FragmentSpread,
  LocalArgumentDefinition,
  Root,
} from '../core/GraphQLIR';
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
  const schema = context.serverSchema;
  const queryType = schema.getQueryType();
  if (queryType == null) {
    throw createUserError('Expected the schema to define a query type.');
  }
  const refetchOperations = buildRefetchMap(context);
  let nextContext = context;
  const errors = eachWithErrors(
    refetchOperations,
    ([refetchName, fragment]) => {
      // Build a refetch operation according to the fragment's type:
      // the logic here is purely name-based, the actual transform
      // functions provide detailed validation as well as case-specific
      // error messages.
      let refetchDescriptor;
      if (isEquivalentType(fragment.type, queryType)) {
        refetchDescriptor = buildRefetchOperationOnQueryType(
          schema,
          fragment,
          refetchName,
        );
      } else if (String(fragment.type) === VIEWER_TYPE_NAME) {
        // Validate that the schema conforms to the informal Viewer spec
        // and build the refetch query accordingly.
        refetchDescriptor = buildRefetchOperationOnViewerType(
          schema,
          fragment,
          refetchName,
        );
      } else if (
        String(fragment.type) === NODE_TYPE_NAME ||
        (fragment.type instanceof GraphQLObjectType &&
          fragment.type
            .getInterfaces()
            .some(interfaceType => String(interfaceType) === NODE_TYPE_NAME)) ||
        (isAbstractType(fragment.type) &&
          getImplementations(fragment.type, schema).every(possibleType =>
            implementsInterface(possibleType, NODE_TYPE_NAME),
          ))
      ) {
        // Validate that the schema conforms to the Object Identity (Node) spec
        // and build the refetch query accordingly.
        refetchDescriptor = buildRefetchOperationOnNodeType(
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
          },
        });
      }
    },
  );
  if (errors != null && errors.length) {
    throw createCombinedError(errors, 'RelayRefetchableFragmentTransform');
  }
  return nextContext;
}

function getImplementations(
  type: GraphQLCompositeType,
  schema: GraphQLSchema,
): $ReadOnlyArray<GraphQLObjectType> {
  const abstractType = assertAbstractType(assertCompositeType(type));
  return schema.getPossibleTypes(abstractType);
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
  const errors = eachWithErrors(context.documents(), node => {
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
  if (errors != null && errors.length !== 0) {
    throw createCombinedError(errors, 'RelayRefetchableFragmentTransform');
  }
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
  fragment: Fragment,
): ReaderPaginationMetadata | void {
  const fields = [];
  let connectionField = null;
  let path = null;
  GraphQLIRVisitor.visit(fragment, {
    LinkedField: {
      enter(field) {
        fields.push(field);
        if (
          (field.handles &&
            field.handles.some(handle => handle.name === 'connection')) ||
          field.directives.some(
            directive =>
              directive.name === 'connection' ||
              directive.name === 'stream_connection',
          )
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
          const pluralOnPath = fields.find(
            pathField => getNullableType(pathField.type) instanceof GraphQLList,
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
          path = fields.map(pathField => pathField.alias ?? pathField.name);
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
): Array<LocalArgumentDefinition> {
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
        metadata: null,
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
      metadata: null,
      name: argDef.name,
      type: argDef.type,
      value: {
        kind: 'Variable',
        loc: {kind: 'Derived', source: argDef.loc},
        metadata: null,
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
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  const queryType = nullthrows(schema.getQueryType());
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
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  // Handle fragments on viewer
  const queryType = nullthrows(schema.getQueryType());
  const viewerType = schema.getType(VIEWER_TYPE_NAME);
  const viewerField = queryType.getFields()[VIEWER_FIELD_NAME];
  if (
    !(
      viewerType instanceof GraphQLObjectType &&
      viewerField != null &&
      viewerField.type instanceof GraphQLObjectType &&
      isEquivalentType(viewerField.type, viewerType) &&
      viewerField.args.length === 0 &&
      isEquivalentType(fragment.type, viewerType)
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
          alias: null,
          args: [],
          directives: [],
          handles: null,
          kind: 'LinkedField',
          loc: {kind: 'Derived', source: fragment.loc},
          metadata: null,
          name: VIEWER_FIELD_NAME,
          selections: [buildFragmentSpread(fragment)],
          type: viewerType,
        },
      ],
      type: queryType,
    },
    transformedFragment: fragment,
  };
}

function buildRefetchOperationOnNodeType(
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  const queryType = nullthrows(schema.getQueryType());
  const nodeType = schema.getType(NODE_TYPE_NAME);
  const nodeField = queryType.getFields()[NODE_FIELD_NAME];
  if (
    !(
      nodeType instanceof GraphQLInterfaceType &&
      nodeField != null &&
      nodeField.type instanceof GraphQLInterfaceType &&
      isEquivalentType(nodeField.type, nodeType) &&
      nodeField.args.length === 1 &&
      nodeField.args[0].name === 'id' &&
      isEquivalentType(getNullableType(nodeField.args[0].type), GraphQLID) &&
      // the fragment must be on Node or on a type that implements Node
      ((fragment.type instanceof GraphQLObjectType &&
        fragment.type
          .getInterfaces()
          .some(interfaceType => isEquivalentType(interfaceType, nodeType))) ||
        (isAbstractType(fragment.type) &&
          getImplementations(fragment.type, schema).every(possibleType =>
            possibleType
              .getInterfaces()
              .some(interfaceType => isEquivalentType(interfaceType, nodeType)),
          )))
    )
  ) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${
        fragment.name
      }', check that your schema defines a 'Node { id: ID }' interface and has a 'node(id: ID): Node' field on the query type (the id argument may also be non-null).`,
      [fragment.loc],
    );
  }
  const argumentDefinitions = buildOperationArgumentDefinitions(
    fragment.argumentDefinitions,
  );
  const idArgument = argumentDefinitions.find(argDef => argDef.name === 'id');
  if (idArgument != null) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${
        fragment.name
      }', this fragment already has an '\$id' variable in scope.`,
      [idArgument.loc],
    );
  }
  const idArgType = new GraphQLNonNull(GraphQLID);
  const argumentDefinitionsWithId = [
    ...argumentDefinitions,
    {
      defaultValue: null,
      kind: 'LocalArgumentDefinition',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: 'id',
      type: idArgType,
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
          alias: null,
          args: [
            {
              kind: 'Argument',
              loc: {kind: 'Derived', source: fragment.loc},
              metadata: null,
              name: 'id',
              type: idArgType,
              value: {
                kind: 'Variable',
                loc: {kind: 'Derived', source: fragment.loc},
                metadata: null,
                variableName: 'id',
                type: idArgType,
              },
            },
          ],
          directives: [],
          handles: null,
          kind: 'LinkedField',
          loc: {kind: 'Derived', source: fragment.loc},
          metadata: null,
          name: NODE_FIELD_NAME,
          selections: [buildFragmentSpread(fragment)],
          type: nodeType,
        },
      ],
      type: queryType,
    },
    transformedFragment: enforceIDField(fragment),
  };
}

function enforceIDField(fragment: Fragment): Fragment {
  const idSelection = fragment.selections.find(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.name === 'id' &&
      selection.alias == null &&
      isEquivalentType(getNullableType(selection.type), GraphQLID),
  );
  if (idSelection) {
    return fragment;
  }
  return {
    ...fragment,
    selections: [...fragment.selections, generateIDField(GraphQLID)],
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
  if (typeof queryName !== 'string') {
    const queryNameArg = refetchableDirective.args.find(
      arg => arg.name === 'queryName',
    );
    throw createCompilerError(
      `Expected the 'name' argument of @refetchable to be a string, got '${String(
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

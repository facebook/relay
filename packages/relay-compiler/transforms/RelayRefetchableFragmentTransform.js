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
  getNullableType,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} = require('graphql');
const {CompilerContext, getLiteralArgumentValues} = require('relay-compiler');

import type {
  ArgumentDefinition,
  Fragment,
  GraphQLCompilerContext,
  LocalArgumentDefinition,
  Root,
} from 'relay-compiler';

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
  context: CompilerContext,
): CompilerContext {
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
      let operation;
      if (isEquivalentType(fragment.type, queryType)) {
        operation = buildRefetchOperationOnQueryType(
          schema,
          fragment,
          refetchName,
        );
      } else if (String(fragment.type) === VIEWER_TYPE_NAME) {
        // Validate that the schema conforms to the informal Viewer spec
        // and build the refetch query accordingly.
        operation = buildRefetchOperationOnViewerType(
          schema,
          fragment,
          refetchName,
        );
      } else if (
        String(fragment.type) === NODE_TYPE_NAME ||
        (fragment.type instanceof GraphQLObjectType &&
          fragment.type
            .getInterfaces()
            .some(interfaceType => String(interfaceType) === NODE_TYPE_NAME))
      ) {
        // Validate that the schema conforms to the Object Identity (Node) spec
        // and build the refetch query accordingly.
        operation = buildRefetchOperationOnNodeType(
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
      if (operation != null) {
        nextContext = nextContext.replace({
          ...fragment,
          metadata: {
            ...(fragment.metadata || {}),
            refetchOperation: refetchName,
          },
        });
        nextContext = nextContext.add(operation);
      }
    },
  );
  if (errors != null && errors.length) {
    throw createCombinedError(errors, 'RelayRefetchableFragmentTransform');
  }
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

function buildRefetchOperationOnQueryType(
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): Root {
  const queryType = nullthrows(schema.getQueryType());
  return {
    argumentDefinitions: buildOperationArgumentDefinitions(
      fragment.argumentDefinitions,
    ),
    directives: [],
    kind: 'Root',
    loc: {kind: 'Derived', source: fragment.loc},
    metadata: null,
    name: queryName,
    operation: 'query',
    selections: fragment.selections,
    type: queryType,
  };
}

function buildRefetchOperationOnViewerType(
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): Root {
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
        selections: fragment.selections,
        type: viewerType,
      },
    ],
    type: queryType,
  };
}

function buildRefetchOperationOnNodeType(
  schema: GraphQLSchema,
  fragment: Fragment,
  queryName: string,
): Root {
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
      ((fragment.type instanceof GraphQLInterfaceType &&
        isEquivalentType(fragment.type, nodeType)) ||
        (fragment.type instanceof GraphQLObjectType &&
          fragment.type
            .getInterfaces()
            .some(interfaceType => isEquivalentType(interfaceType, nodeType))))
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
  const idSelection = fragment.selections.find(
    selection =>
      selection.kind === 'ScalarField' &&
      selection.name === 'id' &&
      selection.alias == null &&
      isEquivalentType(getNullableType(selection.type), GraphQLID),
  );
  if (idSelection == null) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${
        fragment.name
      }', refetchable fragments on Node (or types implementing Node) must fetch the 'id' field without an alias.`,
      [fragment.loc],
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
  // If the fragment is on the Node interface then its selections
  // can be inlined into the node() field, otherwise they have to
  // be wrapped in an inline fragment.
  let selections;
  if (isEquivalentType(fragment.type, nodeType)) {
    selections = fragment.selections;
  } else {
    selections = [
      {
        directives: [],
        kind: 'InlineFragment',
        loc: {kind: 'Derived', source: fragment.loc},
        metadata: null,
        selections: fragment.selections,
        typeCondition: fragment.type,
      },
    ];
  }
  return {
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
        selections,
        type: nodeType,
      },
    ],
    type: queryType,
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

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayRefetchableFragmentTransform,
};

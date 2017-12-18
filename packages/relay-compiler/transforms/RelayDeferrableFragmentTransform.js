/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayDeferrableFragmentTransform
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {
  doTypesOverlap,
  getNamedType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLScalarType,
} = require('graphql');
const {IRTransformer, IRVisitor} = require('graphql-compiler');

import type {
  CompilerContext,
  DependentRequest,
  Fragment,
  FragmentSpread,
  InlineFragment,
  LocalArgumentDefinition,
  Root,
} from 'graphql-compiler';

type SpreadUse = {|
  spread: FragmentSpread,
  path: string,
|};

const DEFERRED_ARGUMENT_NAME = 'deferredID';

/**
 * Deferrable fragment spreads are transformed into a series of individual
 * dependent operation requests, expected to be executed as part of a batch
 * operation.
 *
 * To achieve this transform, two steps are performed:
 *
 *   1) `transformOperations` is responsible for identifying which fragments
 *      are deferrable and creating new root operations for them, as well as
 *      creating the "dependent request" associations between them.
 *
 *   2) `transformSpreads` is responsible for replacing deferrable fragment
 *      spreads with an `id` field. This step should only apply to the "query"
 *      compiler phase, so that the request sent to the GraphQL server does not
 *      contain the deferred fragment and in its place has the information
 *      necessary to later fulfill that fragment.
 *
 */
function transformOperations(context: CompilerContext): CompilerContext {
  // First, in an initial pass over all definitions, collect the path to each
  // fragment spread from within a fragment or operation, as well as the set of
  // all fragments which have been deferred.
  const spreadUsesWithin: Map<Fragment | Root, Array<SpreadUse>> = new Map();
  const deferredFragments: Set<Fragment> = new Set();
  context.forEachDocument(document => {
    const pathParts = [];
    const spreadUses = [];
    spreadUsesWithin.set(document, spreadUses);
    IRVisitor.visit(document, {
      LinkedField: {
        enter(field) {
          let pathPart = field.alias || field.name;
          let fieldType = field.type;
          while (fieldType.ofType) {
            if (fieldType instanceof GraphQLList) {
              pathPart += '[*]';
            }
            fieldType = fieldType.ofType;
          }
          pathParts.push(pathPart);
        },
        leave() {
          pathParts.pop();
        },
      },
      FragmentSpread(spread) {
        spreadUses.push({spread, path: pathParts.join('.')});
        if (isDeferrable(spread)) {
          deferredFragments.add(context.getFragment(spread.name));
        }
      },
    });
  });

  // If no fragments have been deferred, then no transformation is necessary.
  if (deferredFragments.size === 0) {
    return context;
  }

  const idType = getIdType(context.clientSchema);

  // Next, transform any existing root operations to include references to
  // their dependent requests.
  const transformedContext = IRTransformer.transform(context, {
    Root(root) {
      const dependentRequests = createDependentRequests(
        context,
        spreadUsesWithin,
        root,
      );
      // If this operation contains deferrable spreads, then it will have
      // additional dependent requests.
      return dependentRequests.length === 0
        ? root
        : {
            ...root,
            dependentRequests: [
              ...root.dependentRequests,
              ...dependentRequests,
            ],
          };
    },
  });

  // Finally, add new operations representing each deferrable fragment.
  const deferredOperations = Array.from(deferredFragments).map(fragment => {
    // Create the deferred operation.
    const deferredOperation = createDeferredOperation(context, fragment);

    // Include the deferred operation along with the necessary
    // additional variable definitions and dependent requests.
    const argumentDefinitions = createArgumentDefinitions(
      context,
      spreadUsesWithin,
      // variablesWithin,
      fragment,
    );
    const dependentRequests = createDependentRequests(
      context,
      spreadUsesWithin,
      fragment,
    );
    const completeDeferredOperation: Root = {
      ...deferredOperation,
      argumentDefinitions: [
        ...deferredOperation.argumentDefinitions,
        ...argumentDefinitions,
      ],
      dependentRequests: [
        ...deferredOperation.dependentRequests,
        ...dependentRequests,
      ],
    };
    return completeDeferredOperation;
  });
  const transformedContextPostFragments = IRTransformer.transform(
    transformedContext,
    {
      FragmentSpread(spread): FragmentSpread {
        if (isDeferrable(spread)) {
          return {
            ...spread,
            metadata: {
              ...spread.metadata,
              ...deferredFragmentSpreadMetadata(spread.name, idType),
            },
          };
        }
        return spread;
      },
    },
  );

  return transformedContextPostFragments.addAll(deferredOperations);
}

/**
 * The second step of the Deferrable transform, replacing deferred spreads
 * with deferred refetch references which correspond to the dependent requests.
 */
function transformSpreads(context: CompilerContext): CompilerContext {
  // Next, transform the definitions:
  //  - Replacing deferrable spreads with refetch references.
  //  - Adding dependent requests to operations.
  return IRTransformer.transform(context, {
    FragmentSpread(spread) {
      if (!isDeferrable(spread)) {
        return spread;
      }
      // If this spread is deferrable, replace it with a refetch reference.
      // The deferred reference is definitionally not a FragmentSpread,
      // though the transformer expects functions to return the same type.
      return (createDeferredReference(context, spread): any);
    },
  });
}

// True if the FragmentSpread is marked as deferrable.
function isDeferrable(spread: FragmentSpread): boolean {
  return Boolean(spread.metadata && spread.metadata.deferrable);
}

// Given a fragment, return the variable definitions necessary for all
// variables used across deeply within.
function createArgumentDefinitions(
  context: CompilerContext,
  spreadUsesWithin: Map<Fragment | Root, Array<SpreadUse>>,
  fragment: Fragment,
): Array<LocalArgumentDefinition> {
  // Collect all recursively included definitions from the root.
  const includedFragments = new Set([fragment]);
  const nodesToVisit = [fragment];
  while (nodesToVisit.length !== 0) {
    const spreadUses = nullthrows(spreadUsesWithin.get(nodesToVisit.pop()));
    for (let i = 0; i < spreadUses.length; i++) {
      const includedFragment = context.getFragment(spreadUses[i].spread.name);
      if (!includedFragments.has(includedFragment)) {
        includedFragments.add(includedFragment);
        nodesToVisit.push(includedFragment);
      }
    }
  }

  // Then get all variables used in all included fragments to determine
  // additional variable definitions, ensuring one definition per variable.
  const variableDefinitions = new Map();
  for (const includedFragment of includedFragments) {
    for (const argumentDefinition of includedFragment.argumentDefinitions) {
      if (!variableDefinitions.has(argumentDefinition.name)) {
        variableDefinitions.set(argumentDefinition.name, {
          kind: 'LocalArgumentDefinition',
          metadata: argumentDefinition.metadata,
          name: argumentDefinition.name,
          type: argumentDefinition.type,
          defaultValue:
            argumentDefinition.kind === 'LocalArgumentDefinition'
              ? argumentDefinition.defaultValue
              : undefined,
        });
      }
    }
  }
  return Array.from(variableDefinitions.values());
}

// Given a fragment or node, return the set of dependent requests to fulfill.
// Defines the relationship between deferred reference selections (above) and
// the deferred operations dependent on them (below).
function createDependentRequests(
  context: CompilerContext,
  spreadUsesWithin: Map<Fragment | Root, Array<SpreadUse>>,
  from: Fragment | Root,
): Array<DependentRequest> {
  const spreadUses = getDeferrableSpreadUses(context, spreadUsesWithin, from);
  return spreadUses.map(({spread, path}) => ({
    operationName: spread.name + '_Deferred',
    metadata: {
      deferrable: true,
      fragmentName: spread.name,
      rootFieldVariable: DEFERRED_ARGUMENT_NAME,
    },
    argumentDependencies: [
      {
        kind: 'ArgumentDependency',
        argumentName: DEFERRED_ARGUMENT_NAME,
        fromName: from.name,
        fromPath: path + '.' + deferredAlias(spread.name),
        ifList: 'each',
        ifNull: 'skip',
      },
    ],
  }));
}

// A utility function which collects the paths to deferrable spreads from
// a given starting Root or Fragment definition. Used above to determine the
// dependent requests from an operation.
const memoizedDeferrableSpreadUses = new WeakMap();
function getDeferrableSpreadUses(
  context: CompilerContext,
  spreadUsesWithin: Map<Fragment | Root, Array<SpreadUse>>,
  node: Fragment | Root,
): Array<SpreadUse> {
  let deferrableSpreadUses = memoizedDeferrableSpreadUses.get(node);
  if (!deferrableSpreadUses) {
    deferrableSpreadUses = [];
    for (const spreadUse of nullthrows(spreadUsesWithin.get(node))) {
      if (isDeferrable(spreadUse.spread)) {
        deferrableSpreadUses.push(spreadUse);
      } else {
        const nestedSpreadUses = getDeferrableSpreadUses(
          context,
          spreadUsesWithin,
          context.getFragment(spreadUse.spread.name),
        );
        for (const nestedSpreadUse of nestedSpreadUses) {
          deferrableSpreadUses.push({
            spread: nestedSpreadUse.spread,
            path: spreadUse.path + '.' + nestedSpreadUse.path,
          });
        }
      }
    }
    memoizedDeferrableSpreadUses.set(node, deferrableSpreadUses);
  }
  return deferrableSpreadUses;
}

// Utility function for creating a deferred reference selection from a
// deferrable fragment spread. This selection will be depended upon by another
// operation in a batch request to fulfill the deferred fragment.
function createDeferredReference(
  context: CompilerContext,
  spread: FragmentSpread,
): InlineFragment {
  const schema = context.clientSchema;
  const nodeType = getNodeType(schema);
  const idType = getIdType(schema);
  const fragmentType = context.getFragment(spread.name).type;
  invariant(
    doTypesOverlap(schema, fragmentType, nodeType),
    'RelayDeferrableFragmentsTransform: Cannot defer %s since objects of ' +
      'type %s can never also be of type Node.',
    spread.name,
    fragmentType,
  );
  invariant(
    spread.args.length === 0,
    'RelayDeferrableFragmentsTransform: Cannot defer %s with arguments.',
    spread.name,
  );
  // The deferrable fragment spread is replaced with two nested inline
  // fragments. The outer of which ensures the type condition of the original
  // fragment applies, while the inner specfically conditions on Node, so
  // id may be safely queried. This is a conservative application known to
  // always be safe, however the "FlattenTransform" may remove these if they
  // are unnecessary.
  //
  // The metadata and directives of the deferrable fragment spread are
  // transferred to the deferred id field.
  return {
    kind: 'InlineFragment',
    metadata: null,
    typeCondition: fragmentType,
    directives: [],
    selections: [
      {
        kind: 'InlineFragment',
        metadata: null,
        typeCondition: nodeType,
        directives: [],
        selections: [
          {
            kind: 'ScalarField',
            name: 'id',
            alias: deferredAlias(spread.name),
            args: [],
            handles: null,
            directives: spread.directives,
            metadata: {
              ...spread.metadata,
              ...deferredFragmentSpreadMetadata(spread.name, idType),
            },
            type: idType,
          },
        ],
      },
    ],
  };
}

// Utility function for creating an operation from a deferred fragment.
function createDeferredOperation(
  context: CompilerContext,
  fragment: Fragment,
): Root {
  const schema = context.clientSchema;
  const queryType = schema.getQueryType();
  const nodeField = queryType.getFields().node;
  invariant(
    nodeField,
    'RelayDeferrableFragmentTransform: "Query" must define the field "node"',
  );
  const idArg = nodeField.args.find(arg => arg.name === 'id');
  invariant(
    idArg,
    'RelayDeferrableFragmentTransform: "node" field must define the argument "id"',
  );
  const idType = idArg.type;
  return {
    kind: 'Root',
    operation: 'query',
    metadata: {deferred: true},
    name: fragment.name + '_Deferred',
    dependentRequests: [],
    argumentDefinitions: [
      {
        kind: 'LocalArgumentDefinition',
        metadata: null,
        name: DEFERRED_ARGUMENT_NAME,
        defaultValue: null,
        type: idType,
      },
    ],
    directives: [],
    selections: [
      {
        kind: 'LinkedField',
        name: 'node',
        alias: null,
        args: [
          {
            kind: 'Argument',
            name: 'id',
            metadata: null,
            value: {
              kind: 'Variable',
              variableName: DEFERRED_ARGUMENT_NAME,
              metadata: null,
              type: idType,
            },
            type: idType,
          },
        ],
        directives: [],
        metadata: null,
        handles: null,
        selections: [
          {
            kind: 'FragmentSpread',
            args: [],
            name: fragment.name,
            metadata: deferredFragmentSpreadMetadata(fragment.name, idType),
            directives: [],
          },
        ],
        type: nodeField.type,
      },
    ],
    type: queryType,
  };
}

function deferredFragmentSpreadMetadata(name, idType) {
  return {
    deferred: true,
    deferredFragmentName: name,
    deferredArgumentName: DEFERRED_ARGUMENT_NAME,
    deferredArgumentStorageKey: 'id',
    idType: idType,
  };
}

function deferredAlias(name: string): string {
  return `${name}_${DEFERRED_ARGUMENT_NAME}`;
}

function getNodeType(schema) {
  const nodeType = schema.getType('Node');
  invariant(
    nodeType instanceof GraphQLInterfaceType,
    'RelayDeferrableFragmentTransform: Schema must define the interface "Node".',
  );
  return nodeType;
}

function getIdType(schema) {
  const nodeType = getNodeType(schema);
  const idField = nodeType.getFields().id;
  invariant(
    idField,
    'RelayDeferrableFragmentTransform: "Node" must define the field "id"',
  );
  const idType = getNamedType(idField.type);
  invariant(
    idType instanceof GraphQLScalarType,
    'RelayDeferrableFragmentTransform: "Node" must define the scalar field "id"',
  );
  return idType;
}

module.exports = {
  transformOperations,
  transformSpreads,
};

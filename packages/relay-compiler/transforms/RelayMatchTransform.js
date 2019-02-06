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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const getNormalizationOperationName = require('../core/getNormalizationOperationName');

const {getRawType} = require('../core/GraphQLSchemaUtils');
const {createUserError} = require('../core/RelayCompilerError');
const {
  assertObjectType,
  isObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLString,
  getNullableType,
} = require('graphql');

import type {
  InlineFragment,
  FragmentSpread,
  LinkedField,
  ScalarField,
} from '../core/GraphQLIR';
import type {GraphQLCompositeType, GraphQLType} from 'graphql';

const SUPPORTED_ARGUMENT_NAME = 'supported';

const JS_FIELD_TYPE = 'JSDependency';
const JS_FIELD_ARG = 'module';
const JS_FIELD_NAME = 'js';

const SCHEMA_EXTENSION = `
  directive @match on FIELD

  directive @module(
    name: String!
  ) on FRAGMENT_SPREAD
`;

/**
 * This transform rewrites LinkedField nodes with @match and rewrites them
 * into `LinkedField` nodes with a `supported` argument.
 */
function relayMatchTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      // TODO: type IRTransformer to allow changing result type
      FragmentSpread: (visitFragmentSpread: $FlowFixMe),
      LinkedField: visitLinkedField,
      InlineFragment: visitInlineFragment,
    },
    node => node.type,
  );
}

function visitInlineFragment(
  node: InlineFragment,
  state: GraphQLType,
): InlineFragment {
  return this.traverse(node, node.typeCondition);
}

function visitLinkedField(
  node: LinkedField,
  parentType: GraphQLType,
): LinkedField {
  const transformedNode: LinkedField = this.traverse(node, node.type);

  const matchDirective = transformedNode.directives.find(
    directive => directive.name === 'match',
  );
  if (matchDirective == null) {
    return transformedNode;
  }

  const rawType = getRawType(parentType);
  if (
    !(
      rawType instanceof GraphQLInterfaceType ||
      rawType instanceof GraphQLObjectType
    )
  ) {
    throw createUserError(
      `@match used on incompatible field '${transformedNode.name}'.` +
        '@match may only be used with fields whose parent type is an ' +
        `interface or object, got invalid type '${String(parentType)}'.`,
      [node.loc],
    );
  }

  const context: CompilerContext = this.getContext();

  const currentField = rawType.getFields()[transformedNode.name];
  const supportedArg = currentField.args.find(
    ({name}) => SUPPORTED_ARGUMENT_NAME,
  );

  const supportedArgType =
    supportedArg != null ? getNullableType(supportedArg.type) : null;
  const supportedArgOfType =
    supportedArgType != null && supportedArgType instanceof GraphQLList
      ? supportedArgType.ofType
      : null;
  if (
    supportedArg == null ||
    supportedArgType == null ||
    supportedArgOfType == null ||
    getNullableType(supportedArgOfType) !== GraphQLString
  ) {
    throw createUserError(
      `@match used on incompatible field '${transformedNode.name}'.` +
        '@match may only be used with fields that accept a ' +
        "'supported: [String!]!' argument.",
      [node.loc],
    );
  }

  const unionType = transformedNode.type;
  if (!(unionType instanceof GraphQLUnionType)) {
    throw createUserError(
      `@match used on incompatible field '${transformedNode.name}'.` +
        '@match may only be used with fields that return a union.',
      [node.loc],
    );
  }

  const seenTypes: Map<GraphQLCompositeType, InlineFragment> = new Map();
  const typeToSelectionMap = {};
  const selections = [];
  transformedNode.selections.forEach(matchSelection => {
    const moduleImport =
      matchSelection.kind === 'InlineFragment'
        ? matchSelection.selections[0]
        : null;
    if (
      matchSelection.kind !== 'InlineFragment' ||
      moduleImport == null ||
      moduleImport.kind !== 'ModuleImport'
    ) {
      throw createUserError(
        'Invalid @match selection: all selections should be ' +
          'fragment spreads with @module.',
        [matchSelection.loc, moduleImport?.loc].filter(Boolean),
      );
    }
    const matchedType = matchSelection.typeCondition;
    const previousTypeUsage = seenTypes.get(matchedType);
    if (previousTypeUsage) {
      throw createUserError(
        `Invalid @match selection: each variant of '${String(unionType)}' ` +
          `may be matched against at-most once, but '${String(matchedType)}'` +
          'was matched against multiple times.',
        [matchSelection.loc, previousTypeUsage.loc],
      );
    }
    seenTypes.set(matchedType, matchSelection);

    const unionVariants = unionType.getTypes();
    const belongsToUnion = unionVariants.includes(matchedType);
    if (!belongsToUnion) {
      let suggestedTypesMessage = '';
      if (unionVariants.length !== 0) {
        suggestedTypesMessage = ` (e.g. ${unionType
          .getTypes()
          .slice(0, 3)
          .map(type => `'${String(type)}'`)
          .join(', ')}, etc) `;
      }
      throw createUserError(
        'Invalid @match selection: selections must match against concrete ' +
          `variants of the union type${suggestedTypesMessage}, got '${String(
            matchedType,
          )}'.`,
        [matchSelection.loc, context.getFragment(moduleImport.name).loc],
      );
    }
    typeToSelectionMap[String(matchedType)] = {
      component: moduleImport.module,
      fragment: moduleImport.name,
    };
    selections.push(matchSelection);
  });

  const stableArgs = [];
  Object.keys(typeToSelectionMap)
    .sort()
    .forEach(typeName => {
      const {component, fragment} = typeToSelectionMap[typeName];
      stableArgs.push(`${fragment}:${component}`);
    });
  const storageKey =
    (transformedNode.alias ?? transformedNode.name) +
    `(${stableArgs.join(',')})`;

  return {
    kind: 'LinkedField',
    alias: transformedNode.alias,
    args: [
      {
        kind: 'Argument',
        name: SUPPORTED_ARGUMENT_NAME,
        type: supportedArg.type,
        value: {
          kind: 'Literal',
          loc: node.loc,
          metadata: {},
          value: Array.from(seenTypes.keys()).map(type => type.name),
        },
        loc: node.loc,
        metadata: {},
      },
    ],
    directives: [],
    handles: null,
    loc: node.loc,
    metadata: {
      storageKey,
    },
    name: transformedNode.name,
    type: unionType,
    selections,
  };
}

// Transform @module
function visitFragmentSpread(
  spread: FragmentSpread,
): FragmentSpread | InlineFragment {
  const transformedNode: FragmentSpread = this.traverse(spread);

  const moduleDirective = transformedNode.directives.find(
    directive => directive.name === 'module',
  );
  if (moduleDirective == null) {
    return transformedNode;
  }
  if (spread.args.length !== 0) {
    throw createUserError(
      '@module does not support @arguments.',
      [spread.args[0]?.loc].filter(Boolean),
    );
  }

  const context: CompilerContext = this.getContext();
  const schema = context.serverSchema;
  const jsModuleType = schema.getType(JS_FIELD_TYPE);
  if (jsModuleType == null || !(jsModuleType instanceof GraphQLScalarType)) {
    throw createUserError(
      'Using @module requires the schema to define a scalar ' +
        `'${JS_FIELD_TYPE}' type.`,
    );
  }

  const fragment = context.getFragment(spread.name);
  if (!isObjectType(fragment.type)) {
    throw createUserError(
      `@module used on invalid fragment spread '...${spread.name}'. @module ` +
        'may only be used with fragments on a concrete (object) type, ' +
        `but the fragment has abstract type '${String(fragment.type)}'.`,
      [spread.loc, fragment.loc],
    );
  }
  const type = assertObjectType(fragment.type);
  const jsField = type.getFields()[JS_FIELD_NAME];
  const jsFieldArg = jsField
    ? jsField.args.find(arg => arg.name === JS_FIELD_ARG)
    : null;
  if (
    jsField == null ||
    jsFieldArg == null ||
    getNullableType(jsFieldArg.type) !== GraphQLString ||
    jsField.type.name !== jsModuleType.name // object identity fails in tests
  ) {
    throw createUserError(
      `@module used on invalid fragment spread '...${spread.name}'. @module ` +
        `requires the fragment type '${String(fragment.type)}' to have a ` +
        `'${JS_FIELD_NAME}(${JS_FIELD_ARG}: String!): ${JS_FIELD_TYPE}' field .`,
      [moduleDirective.loc],
    );
  }

  if (spread.directives.length !== 1) {
    throw createUserError(
      `@module used on invalid fragment spread '...${spread.name}'. @module ` +
        'may not have additional directives.',
      [spread.loc],
    );
  }
  const moduleDirectiveArgs = getLiteralArgumentValues(moduleDirective.args);
  const normalizationName =
    getNormalizationOperationName(spread.name) + '.graphql';
  const moduleField: ScalarField = {
    alias: '__module_component',
    args: [
      {
        kind: 'Argument',
        name: JS_FIELD_ARG,
        type: jsFieldArg.type,
        value: {
          kind: 'Literal',
          loc: moduleDirective.args[0]?.loc ?? moduleDirective.loc,
          metadata: {},
          value: moduleDirectiveArgs.name,
        },
        loc: moduleDirective.loc,
        metadata: {},
      },
    ],
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {
      storageKey: '__module_component',
    },
    name: JS_FIELD_NAME,
    type: jsModuleType,
  };
  const fragmentField: ScalarField = {
    alias: '__module_operation',
    args: [
      {
        kind: 'Argument',
        name: JS_FIELD_ARG,
        type: jsFieldArg.type,
        value: {
          kind: 'Literal',
          loc: moduleDirective.loc,
          metadata: {},
          value: normalizationName,
        },
        loc: moduleDirective.loc,
        metadata: {},
      },
    ],
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {
      storageKey: '__module_operation',
    },
    name: JS_FIELD_NAME,
    type: jsModuleType,
  };

  return {
    kind: 'InlineFragment',
    directives: [],
    loc: moduleDirective.loc,
    metadata: null,
    selections: [
      {
        kind: 'ModuleImport',
        loc: moduleDirective.loc,
        module: moduleDirectiveArgs.name,
        name: spread.name,
        selections: [
          {
            ...spread,
            directives: spread.directives.filter(
              directive => directive !== moduleDirective,
            ),
          },
          moduleField,
          fragmentField,
        ],
      },
    ],
    typeCondition: fragment.type,
  };
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: relayMatchTransform,
};

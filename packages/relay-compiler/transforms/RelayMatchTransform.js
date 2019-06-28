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
const {getModuleComponentKey, getModuleOperationKey} = require('relay-runtime');

import type {
  InlineFragment,
  FragmentSpread,
  LinkedField,
  ScalarField,
} from '../core/GraphQLIR';
import type {GraphQLCompositeType, GraphQLType} from 'graphql';

const SUPPORTED_ARGUMENT_NAME = 'supported';

const JS_FIELD_TYPE = 'JSDependency';
const JS_FIELD_MODULE_ARG = 'module';
const JS_FIELD_ID_ARG = 'id';
const JS_FIELD_NAME = 'js';

const SCHEMA_EXTENSION = `
  directive @match on FIELD

  directive @module(
    name: String!
  ) on FRAGMENT_SPREAD
`;

type State = {|
  +documentName: string,
  +path: Array<string>,
  +parentType: GraphQLType,
|};

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
      ScalarField: visitScalarField,
    },
    node => ({documentName: node.name, parentType: node.type, path: []}),
  );
}

function visitInlineFragment(
  node: InlineFragment,
  state: State,
): InlineFragment {
  return this.traverse(node, {
    ...state,
    parentType: node.typeCondition,
  });
}

function visitScalarField(field: ScalarField): ScalarField {
  if (field.name === JS_FIELD_NAME) {
    const context: CompilerContext = this.getContext();
    const schema = context.serverSchema;
    const jsModuleType = schema.getType(JS_FIELD_TYPE);
    if (
      jsModuleType != null &&
      jsModuleType instanceof GraphQLScalarType &&
      getRawType(field.type).name === jsModuleType.name
    ) {
      throw new createUserError(
        `Direct use of the '${JS_FIELD_NAME}' field is not allowed, use ` +
          '@match/@module instead.',
        [field.loc],
      );
    }
  }
  return field;
}

function visitLinkedField(node: LinkedField, state: State): LinkedField {
  state.path.push(node.alias ?? node.name);
  const transformedNode: LinkedField = this.traverse(node, {
    ...state,
    parentType: node.type,
  });
  state.path.pop();

  const matchDirective = transformedNode.directives.find(
    directive => directive.name === 'match',
  );
  if (matchDirective == null) {
    return transformedNode;
  }

  const {parentType} = state;
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
  const supportedArgumentDefinition = currentField.args.find(
    ({name}) => name === SUPPORTED_ARGUMENT_NAME,
  );

  const supportedArgType =
    supportedArgumentDefinition != null
      ? getNullableType(supportedArgumentDefinition.type)
      : null;
  const supportedArgOfType =
    supportedArgType != null && supportedArgType instanceof GraphQLList
      ? supportedArgType.ofType
      : null;
  if (
    supportedArgumentDefinition == null ||
    supportedArgType == null ||
    supportedArgOfType == null ||
    getNullableType(supportedArgOfType) !== GraphQLString
  ) {
    throw createUserError(
      `@match used on incompatible field '${transformedNode.name}'. ` +
        '@match may only be used with fields that accept a ' +
        "'supported: [String!]!' argument.",
      [node.loc],
    );
  }

  const rawFieldType = getRawType(transformedNode.type);
  if (
    !(rawFieldType instanceof GraphQLUnionType) &&
    !(rawFieldType instanceof GraphQLInterfaceType)
  ) {
    throw createUserError(
      `@match used on incompatible field '${transformedNode.name}'.` +
        '@match may only be used with fields that return a union or interface.',
      [node.loc],
    );
  }

  const seenTypes: Map<GraphQLCompositeType, InlineFragment> = new Map();
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
        'Invalid @match selection: each concrete variant/implementor of ' +
          `'${String(rawFieldType)}' may be matched against at-most once, ` +
          `but '${String(matchedType)}' was matched against multiple times.`,
        [matchSelection.loc, previousTypeUsage.loc],
      );
    }
    seenTypes.set(matchedType, matchSelection);

    const possibleConcreteTypes =
      rawFieldType instanceof GraphQLUnionType
        ? rawFieldType.getTypes()
        : context.serverSchema.getPossibleTypes(rawFieldType);
    const isPossibleConcreteType = possibleConcreteTypes.some(
      type => type.name === matchedType.name,
    );
    if (!isPossibleConcreteType) {
      let suggestedTypesMessage = 'but no concrete types are defined.';
      if (possibleConcreteTypes.length !== 0) {
        suggestedTypesMessage = `expected one of ${possibleConcreteTypes
          .slice(0, 3)
          .map(type => `'${String(type)}'`)
          .join(', ')}, etc.`;
      }
      throw createUserError(
        'Invalid @match selection: selections must match against concrete ' +
          'variants/implementors of type ' +
          `'${String(transformedNode.type)}'. Got '${String(matchedType)}', ` +
          suggestedTypesMessage,
        [matchSelection.loc, context.getFragment(moduleImport.name).loc],
      );
    }
    selections.push(matchSelection);
  });

  const supportedArg = transformedNode.args.find(
    arg => arg.name === SUPPORTED_ARGUMENT_NAME,
  );
  if (supportedArg != null) {
    throw createUserError(
      `Invalid @match selection: the '${SUPPORTED_ARGUMENT_NAME}' argument ` +
        'is automatically added and cannot be supplied explicitly.',
      [supportedArg.loc],
    );
  }

  return {
    kind: 'LinkedField',
    alias: transformedNode.alias,
    args: [
      ...transformedNode.args,
      {
        kind: 'Argument',
        name: SUPPORTED_ARGUMENT_NAME,
        type: supportedArgumentDefinition.type,
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
    metadata: null,
    name: transformedNode.name,
    type: transformedNode.type,
    selections,
  };
}

// Transform @module
function visitFragmentSpread(
  spread: FragmentSpread,
  {documentName, path}: State,
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
  const jsFieldModuleArg = jsField
    ? jsField.args.find(arg => arg.name === JS_FIELD_MODULE_ARG)
    : null;
  const jsFieldIdArg = jsField
    ? jsField.args.find(arg => arg.name === JS_FIELD_ID_ARG)
    : null;
  if (
    jsField == null ||
    jsFieldModuleArg == null ||
    getNullableType(jsFieldModuleArg.type) !== GraphQLString ||
    (jsFieldIdArg != null &&
      getNullableType(jsFieldIdArg.type) !== GraphQLString) ||
    jsField.type.name !== jsModuleType.name // object identity fails in tests
  ) {
    throw createUserError(
      `@module used on invalid fragment spread '...${spread.name}'. @module ` +
        `requires the fragment type '${String(fragment.type)}' to have a ` +
        `'${JS_FIELD_NAME}(${JS_FIELD_MODULE_ARG}: String! ` +
        `[${JS_FIELD_ID_ARG}: String]): ${JS_FIELD_TYPE}' field (your ` +
        "schema may choose to omit the 'id'  argument but if present it " +
        "must accept a 'String').",
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
  const {name: moduleName} = getLiteralArgumentValues(moduleDirective.args);
  if (typeof moduleName !== 'string') {
    throw createUserError(
      "Expected the 'name' argument of @module to be a literal string",
      [(moduleDirective.args.find(arg => arg.name === 'name') ?? spread).loc],
    );
  }
  const moduleId = [documentName, ...path].join('.');
  const normalizationName =
    getNormalizationOperationName(spread.name) + '.graphql';
  const componentKey = getModuleComponentKey(documentName);
  const componentField: ScalarField = {
    alias: componentKey,
    args: [
      {
        kind: 'Argument',
        name: JS_FIELD_MODULE_ARG,
        type: jsFieldModuleArg.type,
        value: {
          kind: 'Literal',
          loc: moduleDirective.args[0]?.loc ?? moduleDirective.loc,
          metadata: {},
          value: moduleName,
        },
        loc: moduleDirective.loc,
        metadata: {},
      },
      jsFieldIdArg != null
        ? {
            kind: 'Argument',
            name: JS_FIELD_ID_ARG,
            type: jsFieldIdArg.type,
            value: {
              kind: 'Literal',
              loc: moduleDirective.args[0]?.loc ?? moduleDirective.loc,
              metadata: {},
              value: moduleId,
            },
            loc: moduleDirective.loc,
            metadata: {},
          }
        : null,
    ].filter(Boolean),
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {skipNormalizationNode: true},
    name: JS_FIELD_NAME,
    type: jsModuleType,
  };
  const operationKey = getModuleOperationKey(documentName);
  const operationField: ScalarField = {
    alias: operationKey,
    args: [
      {
        kind: 'Argument',
        name: JS_FIELD_MODULE_ARG,
        type: jsFieldModuleArg.type,
        value: {
          kind: 'Literal',
          loc: moduleDirective.loc,
          metadata: {},
          value: normalizationName,
        },
        loc: moduleDirective.loc,
        metadata: {},
      },
      jsFieldIdArg != null
        ? {
            kind: 'Argument',
            name: JS_FIELD_ID_ARG,
            type: jsFieldIdArg.type,
            value: {
              kind: 'Literal',
              loc: moduleDirective.args[0]?.loc ?? moduleDirective.loc,
              metadata: {},
              value: moduleId,
            },
            loc: moduleDirective.loc,
            metadata: {},
          }
        : null,
    ].filter(Boolean),
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {skipNormalizationNode: true},
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
        documentName,
        id: moduleId,
        module: moduleName,
        name: spread.name,
        selections: [
          {
            ...spread,
            directives: spread.directives.filter(
              directive => directive !== moduleDirective,
            ),
          },
          operationField,
          componentField,
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

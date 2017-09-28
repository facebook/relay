/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowTypeTransformers
 * @flow
 * @format
 */

'use strict';

const t = require('babel-types');

const {
  readOnlyArrayOfType,
  stringLiteralTypeAnnotation,
} = require('RelayFlowBabelFactories');
const {
  GraphQLEnumType,
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} = require('graphql');

export type ScalarTypeMapping = {
  [type: string]: string,
};

function transformScalarType(
  type: GraphQLType,
  customScalars: ScalarTypeMapping,
  objectProps?: mixed,
) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableScalarType(
      type.ofType,
      objectProps,
      customScalars,
    );
  } else {
    return t.nullableTypeAnnotation(
      transformNonNullableScalarType(type, objectProps, customScalars),
    );
  }
}

function transformNonNullableScalarType(
  type: GraphQLType,
  objectProps,
  customScalars: ScalarTypeMapping,
) {
  if (type instanceof GraphQLList) {
    return readOnlyArrayOfType(
      transformScalarType(type.ofType, customScalars, objectProps),
    );
  } else if (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLInterfaceType
  ) {
    return objectProps;
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, customScalars);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformGraphQLScalarType(
  type: GraphQLScalarType,
  customScalars: ScalarTypeMapping,
) {
  switch (customScalars[type.name] || type.name) {
    case 'ID':
    case 'String':
    case 'Url':
      return t.stringTypeAnnotation();
    case 'Float':
    case 'Int':
      return t.numberTypeAnnotation();
    case 'Boolean':
      return t.booleanTypeAnnotation();
    default:
      return t.anyTypeAnnotation();
  }
}

function transformGraphQLEnumType(type: GraphQLEnumType) {
  // TODO create a flow type for enums
  return t.unionTypeAnnotation(
    type.getValues().map(({value}) => stringLiteralTypeAnnotation(value)),
  );
}

function transformInputType(
  type: GraphQLInputType,
  customScalars: ScalarTypeMapping,
  inputFieldWhiteList?: ?Array<string>,
) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableInputType(
      type.ofType,
      customScalars,
      inputFieldWhiteList,
    );
  } else {
    return t.nullableTypeAnnotation(
      transformNonNullableInputType(type, customScalars, inputFieldWhiteList),
    );
  }
}

function transformNonNullableInputType(
  type: GraphQLInputType,
  customScalars: ScalarTypeMapping,
  inputFieldWhiteList?: ?Array<string>,
) {
  if (type instanceof GraphQLList) {
    return readOnlyArrayOfType(
      transformInputType(type.ofType, customScalars, inputFieldWhiteList),
    );
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, customScalars);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type);
  } else if (type instanceof GraphQLInputObjectType) {
    const fields = type.getFields();
    const props = Object.keys(fields)
      .map(key => fields[key])
      .filter(
        field =>
          !inputFieldWhiteList || inputFieldWhiteList.indexOf(field.name) < 0,
      )
      .map(field => {
        const property = t.objectTypeProperty(
          t.identifier(field.name),
          transformInputType(field.type, customScalars, inputFieldWhiteList),
        );
        if (!(field.type instanceof GraphQLNonNull)) {
          property.optional = true;
        }
        return property;
      });
    return t.objectTypeAnnotation(props);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

module.exports = {
  transformInputType,
  transformScalarType,
};

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @emails oncall+relay
 */

'use strict';

const ASTConvert = require('./ASTConvert');

const nullthrows = require('../util/nullthrowsOSS');

const {createUserError, createCompilerError} = require('./RelayCompilerError');
const {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  buildASTSchema,
  extendSchema,
  isInputType,
  isOutputType,
  isTypeSubTypeOf,
  parse,
  parseType,
  print,
  validate,
} = require('graphql');

import type {Location, Field as GraphQLIRField} from './GraphQLIR';
import type {
  ASTNode,
  DirectiveLocationEnum,
  DocumentNode,
  GraphQLArgument,
  GraphQLError,
  Source,
  TypeNode,
  ValidationRule,
  ValueNode,
} from 'graphql';

export opaque type TypeID = Type | List | NonNull;

export opaque type FieldID = Field;

export type FieldArgument = $ReadOnly<{|
  name: string,
  type: TypeID,
  defaultValue: mixed,
|}>;

export type Directive = $ReadOnly<{|
  args: $ReadOnlyArray<FieldArgument>,
  clientOnlyDirective: boolean,
  locations: $ReadOnlyArray<DirectiveLocationEnum>,
  name: string,
|}>;

export type {Schema};

type Kind = 'Scalar' | 'Enum' | 'Input' | 'Union' | 'Interface' | 'Object';

type FieldsMap = Map<string, Field>;

type TypeMapKey = string | Symbol;
type TypeMap = Map<TypeMapKey, TypeID>;

/**
 * @private
 */
class Type {
  +kind: Kind;
  +name: string;

  constructor(name: string, kind: Kind) {
    this.name = name;
    this.kind = kind;
  }

  toString(): string {
    return this.name;
  }

  toJSON(): string {
    return String(this);
  }
}

/**
 * @private
 */
class List {
  +ofType: TypeID;
  +_typeString: string;

  constructor(type: TypeID) {
    this.ofType = type;
    this._typeString = `[${String(this.ofType)}]`;
  }

  toString(): string {
    return this._typeString;
  }

  toJSON(): string {
    return this.toString();
  }
}

/**
 * @private
 */
class NonNull {
  +ofType: Type | List;
  +_typeString: string;

  constructor(type: Type | List) {
    this.ofType = type;
    this._typeString = `${String(this.ofType)}!`;
  }

  toString(): string {
    return this._typeString;
  }

  toJSON(): string {
    return this.toString();
  }
}

/**
 * @private
 */
class Field {
  +args: Map<string, FieldArgument>;
  +belongsTo: TypeID;
  +name: string;
  +type: TypeID;

  constructor(
    schema: Schema,
    name: string,
    type: TypeID,
    belongsTo: TypeID,
    argDefs: $ReadOnlyArray<GraphQLArgument>,
  ) {
    this.name = name;
    this.type = type;
    this.belongsTo = belongsTo;
    this.args = new Map(
      argDefs.map(arg => {
        return [
          arg.name,
          {
            name: arg.name,
            type: schema.expectTypeFromAST(nullthrows(arg.astNode?.type)),
            defaultValue: arg.defaultValue,
          },
        ];
      }),
    );
  }
}

/**
 * @private
 */
function unwrap(type: TypeID): Type {
  if (type instanceof Type) {
    return type;
  }
  return unwrap(type.ofType);
}

/**
 * @private
 */
function hasConcreteTypeThatImplements(
  schema: Schema,
  type: TypeID,
  interfaceType: TypeID,
): boolean {
  return (
    schema.isAbstractType(type) &&
    getConcreteTypes(schema, type).some(concreteType =>
      schema.implementsInterface(concreteType, interfaceType),
    )
  );
}

/**
 * @private
 */
function getConcreteTypes(
  schema: Schema,
  type: TypeID,
): $ReadOnlyArray<TypeID> {
  return schema.getPossibleTypes(type).filter(possibleType => {
    return !schema.isAbstractType(possibleType);
  });
}

const TYPENAME_FIELD = '__typename';
const CLIENT_ID_FIELD = '__id';

class Schema {
  +_baseSchema: GraphQLSchema;
  +_directivesMap: Map<string, Directive>;
  +_extendedSchema: GraphQLSchema;
  +_fieldsMap: Map<Type, FieldsMap>;
  +_typeMap: TypeMap;
  +_typeNameMap: Map<Type, Field>;
  +_clientIdMap: Map<Type, Field>;

  +QUERY_TYPE_KEY: Symbol;
  +MUTATION_TYPE_KEY: Symbol;
  +SUBSCRIPTION_TYPE_KEY: Symbol;

  /**
   * @private
   */
  constructor(
    baseSchema: GraphQLSchema,
    extendedSchema: GraphQLSchema,
    typeMap: TypeMap,
    fieldsMap: Map<Type, FieldsMap>,
    typeNameMap: Map<Type, Field>,
    clientIdMap: Map<Type, Field>,
    directivesMap: Map<string, Directive> | null,
    QUERY_TYPE_KEY: Symbol,
    MUTATION_TYPE_KEY: Symbol,
    SUBSCRIPTION_TYPE_KEY: Symbol,
  ) {
    this.QUERY_TYPE_KEY = QUERY_TYPE_KEY;
    this.MUTATION_TYPE_KEY = MUTATION_TYPE_KEY;
    this.SUBSCRIPTION_TYPE_KEY = SUBSCRIPTION_TYPE_KEY;

    this._baseSchema = baseSchema;
    this._extendedSchema = extendedSchema;
    this._typeMap = typeMap;
    this._fieldsMap = fieldsMap;
    this._typeNameMap = typeNameMap;
    this._clientIdMap = clientIdMap;
    this._directivesMap =
      directivesMap ??
      new Map(
        this._extendedSchema.getDirectives().map(directive => {
          return [
            directive.name,
            {
              clientOnlyDirective:
                this._baseSchema.getDirective(directive.name) == null,
              name: directive.name,
              locations: directive.locations,
              args: directive.args.map(arg => {
                return {
                  name: arg.name,
                  type: arg.astNode
                    ? this.expectTypeFromAST(arg.astNode.type)
                    : this.expectTypeFromString(String(arg.type)),
                  defaultValue: arg.defaultValue,
                };
              }),
            },
          ];
        }),
      );
  }

  _getTypeFromNode(typeNode: TypeNode): ?TypeID {
    if (typeNode.kind === 'NonNullType') {
      const innerType = this._getTypeFromNode(typeNode.type);
      if (!innerType) {
        return;
      }
      if (innerType instanceof NonNull) {
        throw new createUserError(
          'Unable to wrap non-nullable type with non-null wrapper.',
        );
      }
      const cacheKey = `${this.getTypeString(innerType)}!`;
      let type = this._typeMap.get(cacheKey);
      if (type) {
        return type;
      }
      type = new NonNull(innerType);
      this._typeMap.set(cacheKey, type);
      return type;
    } else if (typeNode.kind === 'ListType') {
      const innerType = this._getTypeFromNode(typeNode.type);
      if (!innerType) {
        return;
      }
      const cacheKey = `[${this.getTypeString(innerType)}]`;
      let type = this._typeMap.get(cacheKey);
      if (type) {
        return type;
      }
      type = new List(innerType);
      this._typeMap.set(cacheKey, type);
      return type;
    } else {
      const name = typeNode.name.value;
      let type = this._typeMap.get(name);
      if (type) {
        return type;
      }
      const graphQLType = this._extendedSchema.getType(name);
      if (!graphQLType) {
        return;
      }
      let kind: Kind;
      if (graphQLType instanceof GraphQLScalarType) {
        kind = 'Scalar';
      } else if (graphQLType instanceof GraphQLInputObjectType) {
        kind = 'Input';
      } else if (graphQLType instanceof GraphQLEnumType) {
        kind = 'Enum';
      } else if (graphQLType instanceof GraphQLUnionType) {
        kind = 'Union';
      } else if (graphQLType instanceof GraphQLInterfaceType) {
        kind = 'Interface';
      } else if (graphQLType instanceof GraphQLObjectType) {
        kind = 'Object';
      } else {
        throw new createUserError(`Unknown GraphQL type: ${graphQLType}`);
      }
      type = new Type(name, kind);
      this._typeMap.set(name, type);
      return type;
    }
  }

  _getRawType(typeName: TypeMapKey): ?TypeID {
    const type = this._typeMap.get(typeName);
    if (type) {
      return type;
    }
    if (typeof typeName === 'string') {
      return this._getTypeFromNode(parseType(typeName));
    } else {
      let graphQLType;
      if (typeName === this.QUERY_TYPE_KEY) {
        graphQLType = this._baseSchema.getQueryType();
      } else if (typeName === this.MUTATION_TYPE_KEY) {
        graphQLType = this._baseSchema.getMutationType();
      } else if (typeName === this.SUBSCRIPTION_TYPE_KEY) {
        graphQLType = this._baseSchema.getSubscriptionType();
      }
      if (graphQLType) {
        const operationType = new Type(graphQLType.name, 'Object');
        this._typeMap.set(typeName, operationType);
        this._typeMap.set(graphQLType.name, operationType);
        return operationType;
      }
    }
  }

  getTypeFromString(typeName: string): ?TypeID {
    return this._getRawType(typeName);
  }

  expectTypeFromString(
    typeName: string,
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): TypeID {
    const type = this.getTypeFromString(typeName);
    if (!type) {
      throw new createUserError(
        message ?? `Unable to find type: ${typeName}.`,
        locations,
        nodes,
      );
    }
    return type;
  }

  expectTypeFromAST(
    ast: TypeNode,
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): TypeID {
    const type = this._getTypeFromNode(ast);
    if (!type) {
      throw createUserError(
        message ?? `Unknown type: '${print(ast)}'.`,
        locations,
        nodes ?? [ast],
      );
    }
    return type;
  }

  getNonNullType(type: TypeID): TypeID {
    if (type instanceof NonNull) {
      return type;
    }
    const cacheKey = `${String(type)}!`;
    let nonNullType = this._typeMap.get(cacheKey);
    if (nonNullType) {
      return nonNullType;
    }
    nonNullType = new NonNull(type);
    this._typeMap.set(cacheKey, nonNullType);
    return nonNullType;
  }

  getRawType(type: TypeID): TypeID {
    return unwrap(type);
  }

  getNullableType(type: TypeID): TypeID {
    if (type instanceof NonNull) {
      return type.ofType;
    }
    return type;
  }

  getNonListType(type: TypeID): TypeID {
    if (type instanceof List) {
      return type.ofType;
    }
    return type;
  }

  areEqualTypes(typeA: TypeID, typeB: TypeID): boolean {
    if (typeA === typeB) {
      return true;
    }
    if (typeA instanceof NonNull && typeB instanceof NonNull) {
      return this.areEqualTypes(typeA.ofType, typeB.ofType);
    }
    if (typeA instanceof List && typeB instanceof List) {
      return this.areEqualTypes(typeA.ofType, typeB.ofType);
    }
    if (typeA instanceof Type && typeB instanceof Type) {
      return typeA.name === typeB.name;
    }
    return false;
  }

  /**
   * Determine if the given type may implement the named type:
   * - it is the named type
   * - it implements the named interface
   * - it is an abstract type and *some* of its concrete types may
   *   implement the named type
   */
  mayImplement(type: TypeID, interfaceType: TypeID): boolean {
    return (
      this.areEqualTypes(type, interfaceType) ||
      this.implementsInterface(type, interfaceType) ||
      (this.isAbstractType(type) &&
        hasConcreteTypeThatImplements(this, type, interfaceType))
    );
  }

  implementsInterface(type: TypeID, interfaceType: TypeID): boolean {
    return this.getInterfaces(type).some(typeInterface =>
      this.areEqualTypes(typeInterface, interfaceType),
    );
  }

  canHaveSelections(type: TypeID): boolean {
    return this.isObject(type) || this.isInterface(type);
  }

  getTypeString(type: TypeID): string {
    return type.toString();
  }

  isTypeSubTypeOf(maybeSubTypeID: ?TypeID, superTypeID: ?TypeID): boolean {
    if (maybeSubTypeID == null) {
      return false;
    }
    if (superTypeID == null) {
      return false;
    }
    // This part is similar to the default implementation of isTypeSubTypeOf
    if (superTypeID instanceof NonNull) {
      if (maybeSubTypeID instanceof NonNull) {
        return this.isTypeSubTypeOf(maybeSubTypeID.ofType, superTypeID.ofType);
      }
      return false;
    }

    if (maybeSubTypeID instanceof NonNull) {
      // If superType is nullable, maybeSubType may be non-null or nullable.
      return this.isTypeSubTypeOf(maybeSubTypeID.ofType, superTypeID);
    }

    // If superType type is a list, maybeSubType type must also be a list.
    if (superTypeID instanceof List) {
      if (maybeSubTypeID instanceof List) {
        return this.isTypeSubTypeOf(maybeSubTypeID.ofType, superTypeID.ofType);
      }
      return false;
    }
    if (maybeSubTypeID instanceof List) {
      // If superType is not a list, maybeSubType must also be not a list.
      return false;
    }

    const maybeSubType = this._extendedSchema.getType(maybeSubTypeID.name);
    const superType = this._extendedSchema.getType(superTypeID.name);
    if (maybeSubType == null) {
      return false;
    }
    if (superType == null) {
      return false;
    }
    return isTypeSubTypeOf(this._extendedSchema, maybeSubType, superType);
  }

  assertScalarType(type: TypeID): TypeID {
    if (!this.isScalar(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a scalar type.`,
      );
    }
    return type;
  }

  assertObjectType(type: TypeID): TypeID {
    if (!this.isObject(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an object type.`,
      );
    }
    return type;
  }

  assertInputType(type: TypeID): TypeID {
    if (!this.isInputType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an input type.`,
      );
    }
    return type;
  }

  assertInterfaceType(type: TypeID): TypeID {
    if (!this.isInterface(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an interface type.`,
      );
    }
    return type;
  }

  assertOutputType(type: TypeID): TypeID {
    if (!this.isOutputType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an input type.`,
      );
    }
    return type;
  }

  assertCompositeType(type: TypeID): TypeID {
    if (!this.isCompositeType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a composite type.`,
      );
    }
    return type;
  }

  assertAbstractType(type: TypeID): TypeID {
    if (!this.isAbstractType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an abstract type.`,
      );
    }
    return type;
  }

  assertLeafType(type: TypeID): TypeID {
    if (!this.isLeafType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a leaf type.`,
      );
    }
    return type;
  }

  assertUnionType(type: TypeID): TypeID {
    if (!this.isUnion(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a union type.`,
      );
    }
    return type;
  }

  assertEnumType(type: TypeID): TypeID {
    if (!this.isEnum(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an enum type.`,
      );
    }
    return type;
  }

  assertIntType(type: TypeID): TypeID {
    if (!this.isInt(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an 'Int' type.`,
      );
    }
    return type;
  }

  assertFloatType(type: TypeID): TypeID {
    if (!this.isFloat(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'Float' type.`,
      );
    }
    return type;
  }

  assertBooleanType(type: TypeID): TypeID {
    if (!this.isBoolean(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'Boolean' type.`,
      );
    }
    return type;
  }

  assertStringType(type: TypeID): TypeID {
    if (!this.isString(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'String' type.`,
      );
    }
    return type;
  }

  assertIdType(type: TypeID): TypeID {
    if (!this.isId(type)) {
      throw new Error(`Expected ${this.getTypeString(type)} to be an ID type.`);
    }
    return type;
  }

  expectBooleanType(): TypeID {
    return this.expectTypeFromString('Boolean');
  }

  expectIntType(): TypeID {
    return this.expectTypeFromString('Int');
  }

  expectFloatType(): TypeID {
    return this.expectTypeFromString('Float');
  }

  expectStringType(): TypeID {
    return this.expectTypeFromString('String');
  }

  expectIdType(): TypeID {
    return this.expectTypeFromString('ID');
  }

  getQueryType(): ?TypeID {
    const queryType = this._getRawType(this.QUERY_TYPE_KEY);
    if (queryType) {
      return queryType;
    }
  }

  getMutationType(): ?TypeID {
    const mutationType = this._getRawType(this.MUTATION_TYPE_KEY);
    if (mutationType) {
      return mutationType;
    }
  }

  getSubscriptionType(): ?TypeID {
    const subscriptionType = this._getRawType(this.SUBSCRIPTION_TYPE_KEY);
    if (subscriptionType) {
      return subscriptionType;
    }
  }

  expectQueryType(
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): TypeID {
    const queryType = this.getQueryType();
    if (!queryType) {
      throw createUserError(
        'Query type is not defined on the Schema' ?? message,
        locations,
        nodes,
      );
    }
    return queryType;
  }

  expectMutationType(
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): TypeID {
    const mutationType = this.getMutationType();
    if (!mutationType) {
      throw createUserError(
        'Mutation type is not defined the Schema' ?? message,
        locations,
        nodes,
      );
    }
    return mutationType;
  }

  expectSubscriptionType(
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): TypeID {
    const subscriptionType = this.getSubscriptionType();
    if (!subscriptionType) {
      throw createUserError(
        'Subscription type is not defined the Schema' ?? message,
        locations,
        nodes,
      );
    }
    return subscriptionType;
  }

  isNonNull(type: TypeID): boolean {
    return type instanceof NonNull;
  }

  isList(type: TypeID): boolean {
    return type instanceof List;
  }

  isWrapper(type: TypeID): boolean {
    return this.isNonNull(type) || this.isList(type);
  }

  isScalar(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Scalar';
    }
    return false;
  }

  isObject(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Object';
    }
    return false;
  }

  isEnum(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Enum';
    }
    return false;
  }

  isUnion(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Union';
    }
    return false;
  }

  isInput(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Input';
    }
    return false;
  }

  isInterface(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.kind === 'Interface';
    }
    return false;
  }

  isInputType(type: TypeID): boolean {
    // Wrappers can be input types (so it's save to check unwrapped type here)
    return isInputType(this._extendedSchema.getType(unwrap(type).name));
  }

  isOutputType(type: TypeID): boolean {
    // Wrappers can be output types (so it's save to check unwrapped type here)
    return isOutputType(this._extendedSchema.getType(unwrap(type).name));
  }

  isCompositeType(type: TypeID): boolean {
    return this.isInterface(type) || this.isUnion(type) || this.isObject(type);
  }

  isAbstractType(type: TypeID): boolean {
    return this.isInterface(type) || this.isUnion(type);
  }

  isLeafType(type: TypeID): boolean {
    return this.isScalar(type) || this.isEnum(type);
  }

  isId(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.name === 'ID';
    }
    return false;
  }

  isInt(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.name === 'Int';
    }
    return false;
  }

  isFloat(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.name === 'Float';
    }
    return false;
  }

  isBoolean(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.name === 'Boolean';
    }
    return false;
  }

  isString(type: TypeID): boolean {
    if (type instanceof Type) {
      return type.name === 'String';
    }
    return false;
  }

  hasField(type: TypeID, fieldName: string): boolean {
    if (!(type instanceof Type)) {
      return false;
    }
    const canHaveTypename = this.isObject(type) || this.isAbstractType(type);
    // Special case for __typename field
    if (
      canHaveTypename &&
      (fieldName === TYPENAME_FIELD || fieldName === CLIENT_ID_FIELD)
    ) {
      return true;
    }

    const name = type.name;
    const gqlType = this._extendedSchema.getType(name);
    if (
      gqlType instanceof GraphQLObjectType ||
      gqlType instanceof GraphQLInterfaceType ||
      gqlType instanceof GraphQLInputObjectType
    ) {
      return gqlType.getFields()[fieldName] != null;
    }
    return false;
  }

  hasId(type: TypeID): boolean {
    if (!(type instanceof Type)) {
      return false;
    }
    if (!this.canHaveSelections(type)) {
      throw createUserError(
        'hasId(): Expected a concrete type or interface, ' +
          `got type ${type.name}`,
      );
    }

    if (!this.hasField(type, 'id')) {
      return false;
    }

    const idField = this.expectField(type, 'id');
    return this.areEqualTypes(
      this.getNullableType(this.getFieldType(idField)),
      this.expectIdType(),
    );
  }

  getFields(type: TypeID): $ReadOnlyArray<FieldID> {
    if (!(type instanceof Type)) {
      throw createUserError(
        `getFields(): Called with for unexpected type ${this.getTypeString(
          type,
        )}`,
      );
    }
    const fieldsMap = this._getFieldsMap(type);
    return Array.from(fieldsMap.values());
  }

  _getFieldsMap(type: Type): FieldsMap {
    const cachedMap = this._fieldsMap.get(type);
    if (cachedMap != null) {
      return cachedMap;
    }

    const fieldsMap = new Map();
    const name = type.name;
    const gqlType = this._extendedSchema.getType(name);
    if (
      gqlType instanceof GraphQLObjectType ||
      gqlType instanceof GraphQLInterfaceType
    ) {
      const typeFields = gqlType.getFields();
      const fieldNames = Object.keys(typeFields);
      fieldNames.forEach(fieldName => {
        const field = typeFields[fieldName];
        if (field == null) {
          return;
        }
        const fieldType = field.astNode
          ? this.expectTypeFromAST(field.astNode.type)
          : this.expectTypeFromString(String(field.type));

        fieldsMap.set(
          fieldName,
          new Field(this, fieldName, fieldType, type, field.args),
        );
      });
    } else if (gqlType instanceof GraphQLInputObjectType) {
      const typeFields = gqlType.getFields();
      const fieldNames = Object.keys(typeFields);
      fieldNames.forEach(fieldName => {
        const field = typeFields[fieldName];
        if (field == null) {
          return;
        }
        const fieldType = field.astNode
          ? this.expectTypeFromAST(field.astNode.type)
          : this.expectTypeFromString(String(field.type));

        fieldsMap.set(
          fieldName,
          new Field(this, fieldName, fieldType, type, []),
        );
      });
    }
    this._fieldsMap.set(type, fieldsMap);
    return fieldsMap;
  }

  getFieldByName(type: TypeID, fieldName: string): ?FieldID {
    if (!(type instanceof Type)) {
      throw createUserError(
        `getFieldByName(): Called with for unexpected type ${this.getTypeString(
          type,
        )}`,
      );
    }

    if (!this.hasField(type, fieldName)) {
      return;
    }

    // A "special" case for __typename and __id fields - which should
    // not be in the list of type fields, but should be fine to select
    if (fieldName === TYPENAME_FIELD) {
      let typename = this._typeNameMap.get(type);
      if (!typename) {
        typename = new Field(
          this,
          TYPENAME_FIELD,
          this.getNonNullType(this.expectStringType()),
          type,
          [],
        );
        this._typeNameMap.set(type, typename);
      }
      return typename;
    }

    if (fieldName === CLIENT_ID_FIELD) {
      let clientId = this._clientIdMap.get(type);
      if (!clientId) {
        clientId = new Field(
          this,
          CLIENT_ID_FIELD,
          this.getNonNullType(this.expectIdType()),
          type,
          [],
        );
        this._clientIdMap.set(type, clientId);
      }
      return clientId;
    }

    const fieldsMap = this._getFieldsMap(type);
    return fieldsMap.get(fieldName);
  }

  expectField(
    type: TypeID,
    fieldName: string,
    message?: ?string,
    locations?: ?$ReadOnlyArray<Location>,
    nodes?: ?$ReadOnlyArray<ASTNode>,
  ): FieldID {
    const field = this.getFieldByName(type, fieldName);
    if (!field) {
      throw createCompilerError(
        message ??
          `Unknown field '${fieldName}' on type '${this.getTypeString(type)}'.`,
        locations,
        nodes,
      );
    }
    return field;
  }

  getFieldConfig(
    field: FieldID,
  ): {|
    type: TypeID,
    args: $ReadOnlyArray<FieldArgument>,
  |} {
    return {
      type: field.type,
      args: Array.from(field.args.values()),
    };
  }

  getFieldName(field: FieldID): string {
    return field.name;
  }

  getFieldType(field: FieldID): TypeID {
    return field.type;
  }

  getFieldParentType(field: FieldID): TypeID {
    return field.belongsTo;
  }

  getFieldArgs(field: FieldID): $ReadOnlyArray<FieldArgument> {
    return Array.from(field.args.values());
  }

  getFieldArgByName(field: FieldID, argName: string): ?FieldArgument {
    return field.args.get(argName);
  }

  getEnumValues(type: TypeID): $ReadOnlyArray<string> {
    if (!(type instanceof Type)) {
      throw new createUserError(
        `Expected "${this.getTypeString(
          type,
        )}" to be an Enum, but received wrapper.`,
      );
    }
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLEnumType) {
      return gqlType.getValues().map(({value}) => String(value));
    }
    throw new createUserError(
      `Expected "${type.name}" to be an Enum, but received "${
        type.kind
      }" kind.`,
    );
  }

  getUnionTypes(type: TypeID): $ReadOnlyArray<TypeID> {
    if (!(type instanceof Type)) {
      throw new createUserError(
        `Expected "${this.getTypeString(
          type,
        )}" to be a Union, but received wrapper.`,
      );
    }
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLUnionType) {
      return gqlType.getTypes().map(typeFromUnion => {
        return this.expectTypeFromString(typeFromUnion.name);
      });
    }
    throw new createUserError(
      `Expected "${type.name}" to be a Union, but received "${type.kind}" kind`,
    );
  }

  getInterfaces(type: TypeID): $ReadOnlyArray<TypeID> {
    if (!(type instanceof Type)) {
      throw new createUserError(
        `Expected "${this.getTypeString(
          type,
        )}" to be an Object, but received wrapper.`,
      );
    }
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLObjectType) {
      return gqlType.getInterfaces().map(typeInterface => {
        return this.expectTypeFromString(typeInterface.name);
      });
    }
    return [];
  }

  getPossibleTypes(type: TypeID): $ReadOnlyArray<TypeID> {
    if (!(type instanceof Type)) {
      throw new createUserError(
        `Expected "${this.getTypeString(
          type,
        )}" to be an Abstract type, but received wrapper.`,
      );
    }
    const gqlType = this._extendedSchema.getType(type.name);
    if (
      gqlType instanceof GraphQLUnionType ||
      gqlType instanceof GraphQLInterfaceType
    ) {
      return this._extendedSchema
        .getPossibleTypes(gqlType)
        .map(possibleType => {
          return this.expectTypeFromString(possibleType.name);
        });
    }
    return [];
  }

  parseLiteral(type: TypeID, valueNode: ValueNode): mixed {
    if (type instanceof Type) {
      const gqlType = this._extendedSchema.getType(type.name);
      if (
        gqlType instanceof GraphQLEnumType ||
        gqlType instanceof GraphQLScalarType
      ) {
        return gqlType.parseLiteral(valueNode);
      }
    }
    throw createUserError(
      `parseLiteral(...) is used with invalid type: ${this.getTypeString(
        type,
      )}.`,
    );
  }

  parseValue(type: TypeID, value: mixed): mixed {
    if (type instanceof Type) {
      const gqlType = this._extendedSchema.getType(type.name);
      if (
        gqlType instanceof GraphQLEnumType ||
        gqlType instanceof GraphQLScalarType
      ) {
        return gqlType.parseValue(value);
      }
    }
    throw createUserError(
      `parseValue(...) is used with invalid type: ${this.getTypeString(type)}.`,
    );
  }

  serialize(type: TypeID, value: mixed): mixed {
    if (type instanceof Type) {
      const gqlType = this._extendedSchema.getType(type.name);
      if (
        gqlType instanceof GraphQLEnumType ||
        gqlType instanceof GraphQLScalarType
      ) {
        return gqlType.serialize(value);
      }
    }
    throw createUserError(
      `parseValue(...) is used with invalid type: ${this.getTypeString(type)}.`,
    );
  }

  getDirectives(): $ReadOnlyArray<Directive> {
    return Array.from(this._directivesMap.values());
  }

  getDirective(directiveName: string): ?Directive {
    return this._directivesMap.get(directiveName);
  }

  isServerType(type: TypeID): boolean {
    const name = this.getTypeString(type);
    return this._baseSchema.getType(name) != null;
  }

  isServerField(field: FieldID): boolean {
    const fieldName = field.name;
    // Allow metadata fields and fields defined on classic "fat" interfaces
    if (['__typename'].includes(fieldName)) {
      return true;
    }
    const fieldRawTypeName = this.getTypeString(unwrap(field.type));
    const fieldParentTypeName = this.getTypeString(unwrap(field.belongsTo));
    // Field type is client-only
    if (!this._baseSchema.getType(fieldRawTypeName)) {
      return false;
    }

    const serverType = this._baseSchema.getType(fieldParentTypeName);
    // Parent type is client-only
    if (serverType == null) {
      return false;
    } else {
      if (
        serverType instanceof GraphQLObjectType ||
        serverType instanceof GraphQLInterfaceType ||
        serverType instanceof GraphQLInputObjectType
      ) {
        // Field is not available in the server schema
        if (!serverType.getFields()[fieldName]) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  isServerDirective(directiveName: string): boolean {
    const directive = this._directivesMap.get(directiveName);
    return directive?.clientOnlyDirective === false;
  }

  isServerDefinedField(type: TypeID, field: GraphQLIRField): boolean {
    return (
      (this.isAbstractType(type) &&
        field.directives.some(({name}) => name === 'fixme_fat_interface')) ||
      (this.hasField(type, field.name) &&
        this.isServerField(
          this.expectField(type, field.name, null, [field.loc]),
        ))
    );
  }

  isClientDefinedField(type: TypeID, field: GraphQLIRField): boolean {
    return !this.isServerDefinedField(type, field);
  }

  /**
   * This method should be replaced with the specific Relay validations
   */
  DEPRECATED__validate(
    document: DocumentNode,
    rules: $ReadOnlyArray<ValidationRule>,
  ): $ReadOnlyArray<GraphQLError> {
    return validate(this._extendedSchema, document, rules);
  }

  /**
   * The only consumer of this is RelayParser.parse(...)
   * We should either refactor RelayParser.parse(...) to not-rely on the `
   * extendSchema` method. Or actually implement it here.
   */
  DEPRECATED__extend(document: DocumentNode): Schema {
    const extendedSchema = extendSchema(this._extendedSchema, document, {
      assumeValid: true,
    });
    return new Schema(
      this._baseSchema,
      extendedSchema,
      this._typeMap,
      this._fieldsMap,
      this._typeNameMap,
      this._clientIdMap,
      this._directivesMap,
      this.QUERY_TYPE_KEY,
      this.MUTATION_TYPE_KEY,
      this.SUBSCRIPTION_TYPE_KEY,
    );
  }
}

const localGraphQLSchemaCache = new Map<Source, GraphQLSchema>();

function DEPRECATED__buildGraphQLSchema(source: Source): GraphQLSchema {
  let schema = localGraphQLSchemaCache.get(source);
  if (schema != null) {
    return schema;
  }
  try {
    schema = buildASTSchema(parse(source), {
      assumeValid: true,
    });
    localGraphQLSchemaCache.set(source, schema);
    return schema;
  } catch (error) {
    throw Object.assign(error, {
      message: `Caught an error "${
        error.message
      }" while loading and parsing schema file: ${
        source.name
      }. Please make sure that schema is valid.`,
    });
  }
}
/**
 * We need this in order to make unit-test works
 * In most of the unit-tests the schema is created from the instance of the
 * GraphQLSchema.
 */
function DEPRECATED__create(
  baseSchema: GraphQLSchema,
  extendedSchema: ?GraphQLSchema,
): Schema {
  return new Schema(
    baseSchema,
    extendedSchema ?? baseSchema,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    null,
    Symbol('Query'),
    Symbol('Mutation'),
    Symbol('Subsription'),
  );
}

function create(
  baseSchema: Source,
  schemaExtensionDocuments?: $ReadOnlyArray<DocumentNode>,
  schemaExtensions?: $ReadOnlyArray<string>,
): Schema {
  const schema = DEPRECATED__buildGraphQLSchema(baseSchema);
  const transformedSchema = ASTConvert.transformASTSchema(
    schema,
    schemaExtensions ?? [],
  );
  const extendedSchema = ASTConvert.extendASTSchema(
    transformedSchema,
    schemaExtensionDocuments ?? [],
  );
  return new Schema(
    schema,
    extendedSchema,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    null,
    Symbol('Query'),
    Symbol('Mutation'),
    Symbol('Subsription'),
  );
}

module.exports = {
  DEPRECATED__buildGraphQLSchema,
  DEPRECATED__create,
  create,
};

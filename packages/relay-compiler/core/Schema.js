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

export opaque type TypeID = BaseType | BaseList | BaseNonNull;

type BaseType =
  | ScalarType
  | EnumType
  | UnionType
  | ObjectType
  | InputType
  | InterfaceType;

type BaseList = List<TypeID>;
type BaseNonNull = NonNull<BaseType | BaseList>;

export opaque type ScalarTypeID: ScalarFieldTypeID = ScalarType;
export opaque type EnumTypeID: ScalarFieldTypeID = EnumType;
export opaque type UnionTypeID: CompositeTypeID = UnionType;
export opaque type InterfaceTypeID: CompositeTypeID = InterfaceType;
export opaque type ObjectTypeID: CompositeTypeID = ObjectType;
export opaque type InputID: TypeID = InputType;
export opaque type CompositeTypeID: LinkedFieldTypeID = LinkedFieldType;

export opaque type ScalarFieldTypeID: TypeID =
  | ScalarFieldType
  | ScalarFieldList
  | ScalarFieldNonNull;

export opaque type LinkedFieldTypeID: TypeID =
  | LinkedFieldType
  | LinkedFieldList
  | LinkedFieldNonNull;

type ScalarFieldType = ScalarType | EnumType;
type ScalarFieldList = List<ScalarFieldTypeID>;
type ScalarFieldNonNull = NonNull<ScalarFieldType | ScalarFieldList>;

type LinkedFieldType = ObjectType | InterfaceType | UnionType;
type LinkedFieldList = List<LinkedFieldTypeID>;
type LinkedFieldNonNull = NonNull<LinkedFieldType | LinkedFieldList>;

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
class ScalarType extends Type {
  +kind: 'Scalar';
}

/**
 * @private
 */
class EnumType extends Type {
  +kind: 'Enum';
}

/**
 * @private
 */
class UnionType extends Type {
  +kind: 'Union';
}

/**
 * @private
 */
class ObjectType extends Type {
  +kind: 'Object';
}

/**
 * @private
 */
class InputType extends Type {
  +kind: 'Input';
}

/**
 * @private
 */
class InterfaceType extends Type {
  +kind: 'Interface';
}

/**
 * @private
 */
class List<+T> {
  +ofType: T;
  +_typeString: string;

  constructor(type: T) {
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
class NonNull<+T> {
  +ofType: T;
  +_typeString: string;

  constructor(type: T) {
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
  +belongsTo: ObjectType | InterfaceType | InputType | UnionType;
  +name: string;
  +type: TypeID;

  constructor(
    schema: Schema,
    name: string,
    type: TypeID,
    belongsTo: ObjectType | InterfaceType | InputType | UnionType,
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
function unwrap(type: TypeID): BaseType {
  if (type instanceof NonNull || type instanceof List) {
    return unwrap(type.ofType);
  }
  return type;
}

/**
 * @private
 */
function hasConcreteTypeThatImplements(
  schema: Schema,
  type: TypeID,
  interfaceType: InterfaceTypeID,
): boolean {
  return (
    schema.isAbstractType(type) &&
    getConcreteTypes(schema, type).some(concreteType =>
      schema.implementsInterface(
        schema.assertCompositeType(concreteType),
        interfaceType,
      ),
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

function isScalar(type: mixed): boolean %checks {
  return type instanceof ScalarType;
}

function isObject(type: mixed): boolean %checks {
  return type instanceof ObjectType;
}

function isEnum(type: mixed): boolean %checks {
  return type instanceof EnumType;
}

function isUnion(type: mixed): boolean %checks {
  return type instanceof UnionType;
}

function isInput(type: mixed): boolean %checks {
  return type instanceof InputType;
}

function isInterface(type: mixed): boolean %checks {
  return type instanceof InterfaceType;
}

function isWrapper(type: mixed): boolean %checks {
  return type instanceof List || type instanceof NonNull;
}

function isBaseType(type: mixed): boolean %checks {
  return (
    type instanceof ScalarType ||
    type instanceof ObjectType ||
    type instanceof EnumType ||
    type instanceof UnionType ||
    type instanceof InputType ||
    type instanceof InterfaceType
  );
}

function isCompositeType(type: mixed): boolean %checks {
  return (
    type instanceof ObjectType ||
    type instanceof UnionType ||
    type instanceof InterfaceType
  );
}

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
      let TypeClass = Type;
      if (graphQLType instanceof GraphQLScalarType) {
        kind = 'Scalar';
        TypeClass = ScalarType;
      } else if (graphQLType instanceof GraphQLInputObjectType) {
        kind = 'Input';
        TypeClass = InputType;
      } else if (graphQLType instanceof GraphQLEnumType) {
        kind = 'Enum';
        TypeClass = EnumType;
      } else if (graphQLType instanceof GraphQLUnionType) {
        kind = 'Union';
        TypeClass = UnionType;
      } else if (graphQLType instanceof GraphQLInterfaceType) {
        kind = 'Interface';
        TypeClass = InterfaceType;
      } else if (graphQLType instanceof GraphQLObjectType) {
        kind = 'Object';
        TypeClass = ObjectType;
      } else {
        throw new createUserError(`Unknown GraphQL type: ${graphQLType}`);
      }
      type = new TypeClass(name, kind);
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
        const operationType = new ObjectType(graphQLType.name, 'Object');
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
    if (isBaseType(typeA) && isBaseType(typeB)) {
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
  mayImplement(type: CompositeTypeID, interfaceType: InterfaceTypeID): boolean {
    return (
      this.areEqualTypes(type, interfaceType) ||
      this.implementsInterface(type, interfaceType) ||
      (this.isAbstractType(type) &&
        hasConcreteTypeThatImplements(this, type, interfaceType))
    );
  }

  implementsInterface(
    type: CompositeTypeID,
    interfaceType: InterfaceTypeID,
  ): boolean {
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

  assertScalarFieldType(type: mixed): ScalarFieldTypeID {
    // Scalar type fields can be wrappers / or can be scalars/enums
    if (
      (isWrapper(type) && !isScalar(unwrap(type)) && !isEnum(unwrap(type))) ||
      (!isWrapper(type) && !isScalar(type) && !isEnum(type))
    ) {
      throw new Error(`Expected ${String(type)} to be a Scalar or Enum type.`);
    }
    return type;
  }

  assertLinkedFieldType(type: mixed): LinkedFieldTypeID {
    // Linked Field types can be wrappers / or can be composite types
    if (
      (isWrapper(type) && !isCompositeType(unwrap(type))) ||
      (!isWrapper(type) && !isCompositeType(type))
    ) {
      throw new Error(
        `Expected ${String(type)} to be a Object, Interface or a Union Type.`,
      );
    }
    return type;
  }

  asScalarFieldType(type: ?TypeID): ?ScalarFieldTypeID {
    if (type && (isScalar(type) || isEnum(type))) {
      return type;
    }
  }

  assertScalarType(type: TypeID): ScalarTypeID {
    if (!isScalar(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a scalar type.`,
      );
    }
    return type;
  }

  assertObjectType(type: TypeID): ObjectTypeID {
    if (!isObject(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an object type.`,
      );
    }
    return type;
  }

  assertInput(type: TypeID): InputID {
    if (!isInput(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an input type.`,
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

  assertInterfaceType(type: TypeID): InterfaceTypeID {
    if (!isInterface(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be an interface type.`,
      );
    }
    return type;
  }

  assertCompositeType(type: TypeID): CompositeTypeID {
    if (!isCompositeType(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a composite type.`,
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

  assertUnionType(type: TypeID): UnionTypeID {
    if (!isUnion(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a union type.`,
      );
    }
    return type;
  }

  assertEnumType(type: TypeID): EnumTypeID {
    if (!isEnum(type)) {
      throw new Error(`Expected ${String(type)} to be an enum type.`);
    }
    return type;
  }

  assertIntType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isInt(type)) {
      throw new Error(`Expected ${String(type)} to be an 'Int' type.`);
    }
    return type;
  }

  assertFloatType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isFloat(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'Float' type.`,
      );
    }
    return type;
  }

  assertBooleanType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isBoolean(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'Boolean' type.`,
      );
    }
    return type;
  }

  assertStringType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isString(type)) {
      throw new Error(
        `Expected ${this.getTypeString(type)} to be a 'String' type.`,
      );
    }
    return type;
  }

  assertIdType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isId(type)) {
      throw new Error(`Expected ${this.getTypeString(type)} to be an ID type.`);
    }
    return type;
  }

  expectBooleanType(): ScalarTypeID {
    return this.assertScalarType(this.expectTypeFromString('Boolean'));
  }

  expectIntType(): ScalarTypeID {
    return this.assertScalarType(this.expectTypeFromString('Int'));
  }

  expectFloatType(): ScalarTypeID {
    return this.assertScalarType(this.expectTypeFromString('Float'));
  }

  expectStringType(): ScalarTypeID {
    return this.assertScalarType(this.expectTypeFromString('String'));
  }

  expectIdType(): ScalarTypeID {
    return this.assertScalarType(this.expectTypeFromString('ID'));
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
    return isWrapper(type);
  }

  isScalar(type: TypeID): boolean {
    return isScalar(type);
  }

  isObject(type: TypeID): boolean {
    return isObject(type);
  }

  isEnum(type: TypeID): boolean {
    return isEnum(type);
  }

  isUnion(type: TypeID): boolean {
    return isUnion(type);
  }

  isInput(type: TypeID): boolean {
    return isInput(type);
  }

  isInterface(type: TypeID): boolean {
    return isInterface(type);
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
    return isCompositeType(type);
  }

  isAbstractType(type: TypeID): boolean {
    return this.isInterface(type) || this.isUnion(type);
  }

  isLeafType(type: TypeID): boolean {
    return this.isScalar(type) || this.isEnum(type);
  }

  isId(type: TypeID): boolean {
    if (type instanceof ScalarType) {
      return type.name === 'ID';
    }
    return false;
  }

  isInt(type: TypeID): boolean {
    if (type instanceof ScalarType) {
      return type.name === 'Int';
    }
    return false;
  }

  isFloat(type: TypeID): boolean {
    if (type instanceof ScalarType) {
      return type.name === 'Float';
    }
    return false;
  }

  isBoolean(type: TypeID): boolean {
    if (type instanceof ScalarType) {
      return type.name === 'Boolean';
    }
    return false;
  }

  isString(type: TypeID): boolean {
    if (type instanceof ScalarType) {
      return type.name === 'String';
    }
    return false;
  }

  hasField(type: CompositeTypeID | InputID, fieldName: string): boolean {
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
    throw createUserError(
      'hasId(): Expected a concrete type or interface, ' +
        `got type ${type.name}`,
    );
  }

  hasId(type: TypeID): boolean {
    if (!(type instanceof ObjectType || type instanceof InterfaceType)) {
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
    if (
      !(
        type instanceof InputType ||
        type instanceof ObjectType ||
        type instanceof InterfaceType
      )
    ) {
      throw createUserError(
        `getFields(): Called with for unexpected type ${this.getTypeString(
          type,
        )}`,
      );
    }
    const fieldsMap = this._getFieldsMap(type);
    return Array.from(fieldsMap.values());
  }

  _getFieldsMap(type: BaseType): FieldsMap {
    const cachedMap = this._fieldsMap.get(type);
    if (cachedMap != null) {
      return cachedMap;
    }

    const fieldsMap = new Map();
    const name = type.name;
    const gqlType = this._extendedSchema.getType(name);
    if (
      (type instanceof ObjectType || type instanceof InterfaceType) &&
      (gqlType instanceof GraphQLObjectType ||
        gqlType instanceof GraphQLInterfaceType)
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
    } else if (
      type instanceof InputType &&
      gqlType instanceof GraphQLInputObjectType
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
          new Field(this, fieldName, fieldType, type, []),
        );
      });
    }
    this._fieldsMap.set(type, fieldsMap);
    return fieldsMap;
  }

  getFieldByName(type: TypeID, fieldName: string): ?FieldID {
    if (
      !(
        type instanceof UnionType ||
        type instanceof ObjectType ||
        type instanceof InterfaceType ||
        type instanceof InputType
      )
    ) {
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

  getEnumValues(type: EnumTypeID): $ReadOnlyArray<string> {
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

  getUnionTypes(type: UnionTypeID): $ReadOnlyArray<TypeID> {
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLUnionType) {
      return gqlType.getTypes().map(typeFromUnion => {
        return this.expectTypeFromString(typeFromUnion.name);
      });
    }
    throw new createUserError(
      `Unable to get union types for type "${this.getTypeString(type)}".`,
    );
  }

  getInterfaces(type: CompositeTypeID): $ReadOnlyArray<TypeID> {
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLObjectType) {
      return gqlType.getInterfaces().map(typeInterface => {
        return this.expectTypeFromString(typeInterface.name);
      });
    }
    return [];
  }

  getPossibleTypes(type: TypeID): $ReadOnlyArray<TypeID> {
    if (!(type instanceof UnionType || type instanceof InterfaceType)) {
      throw new createUserError(
        `Expected "${this.getTypeString(type)}" to be an Abstract type.`,
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

  parseLiteral(type: ScalarTypeID | EnumTypeID, valueNode: ValueNode): mixed {
    const gqlType = this._extendedSchema.getType(type.name);
    if (
      gqlType instanceof GraphQLEnumType ||
      gqlType instanceof GraphQLScalarType
    ) {
      return gqlType.parseLiteral(valueNode);
    }
    throw createUserError(
      `parseLiteral(...) is used with invalid type: ${this.getTypeString(
        type,
      )}.`,
    );
  }

  parseValue(type: ScalarTypeID | EnumTypeID, value: mixed): mixed {
    const gqlType = this._extendedSchema.getType(type.name);
    if (
      gqlType instanceof GraphQLEnumType ||
      gqlType instanceof GraphQLScalarType
    ) {
      return gqlType.parseValue(value);
    }
    throw createUserError(
      `parseValue(...) is used with invalid type: ${this.getTypeString(type)}.`,
    );
  }

  serialize(type: ScalarTypeID | EnumTypeID, value: mixed): mixed {
    const gqlType = this._extendedSchema.getType(type.name);
    if (
      gqlType instanceof GraphQLEnumType ||
      gqlType instanceof GraphQLScalarType
    ) {
      return gqlType.serialize(value);
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

  isServerDefinedField(type: CompositeTypeID, field: GraphQLIRField): boolean {
    return (
      (this.isAbstractType(type) &&
        field.directives.some(({name}) => name === 'fixme_fat_interface')) ||
      (this.hasField(type, field.name) &&
        this.isServerField(
          this.expectField(type, field.name, null, [field.loc]),
        ))
    );
  }

  isClientDefinedField(type: CompositeTypeID, field: GraphQLIRField): boolean {
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

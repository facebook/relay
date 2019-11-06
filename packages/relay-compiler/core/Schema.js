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

const {createCompilerError} = require('./CompilerError');
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
  parse,
  parseType,
  print,
} = require('graphql');

import type {Field as IRField} from './IR';
import type {
  DirectiveLocationEnum,
  DocumentNode,
  GraphQLArgument,
  Source,
  TypeNode,
  ValueNode,
} from 'graphql';

export opaque type TypeID = BaseType | BaseList | BaseNonNull;

type BaseType =
  | ScalarType
  | EnumType
  | UnionType
  | ObjectType
  | InputObjectType
  | InterfaceType;

type BaseList = List<TypeID>;
type BaseNonNull = NonNull<BaseType | BaseList>;

export opaque type ScalarTypeID: ScalarFieldTypeID = ScalarType;
export opaque type EnumTypeID: ScalarFieldTypeID = EnumType;
export opaque type UnionTypeID: CompositeTypeID = UnionType;
export opaque type InterfaceTypeID: CompositeTypeID = InterfaceType;
export opaque type ObjectTypeID: CompositeTypeID = ObjectType;
export opaque type InputObjectTypeID: TypeID = InputObjectType;
export opaque type CompositeTypeID: LinkedFieldTypeID = CompositeType;
export opaque type AbstractTypeID: CompositeTypeID = UnionType | InterfaceType;

export opaque type ScalarFieldTypeID: TypeID =
  | ScalarFieldBaseType
  | ScalarFieldList
  | ScalarFieldNonNull;

export opaque type LinkedFieldTypeID: TypeID =
  | LinkedFieldBaseType
  | LinkedFieldList
  | LinkedFieldNonNull;

export opaque type InputTypeID: TypeID =
  | InputBaseType
  | InputTypeList
  | InputTypeNonNull;

type ScalarFieldBaseType = ScalarType | EnumType;
type ScalarFieldList = List<ScalarFieldTypeID>;
type ScalarFieldNonNull = NonNull<ScalarFieldBaseType | ScalarFieldList>;

type CompositeType = ObjectType | InterfaceType | UnionType;
type LinkedFieldBaseType = CompositeType;
type LinkedFieldList = List<LinkedFieldTypeID>;
type LinkedFieldNonNull = NonNull<LinkedFieldBaseType | LinkedFieldList>;

type InputBaseType = InputObjectType | ScalarType | EnumType;
type InputTypeList = List<InputTypeID>;
type InputTypeNonNull = NonNull<InputBaseType | InputTypeList>;

export opaque type FieldID = Field;

export type FieldArgument = $ReadOnly<{|
  name: string,
  type: InputTypeID,
  defaultValue: mixed,
|}>;

export type Directive = $ReadOnly<{|
  args: $ReadOnlyArray<FieldArgument>,
  clientOnlyDirective: boolean,
  locations: $ReadOnlyArray<DirectiveLocationEnum>,
  name: string,
|}>;

export type {Schema};

type FieldsMap = Map<string, Field>;

type TypeMapKey = string | Symbol;
type TypeMap = Map<TypeMapKey, TypeID>;

/**
 * @private
 */
class Type {
  +name: string;
  constructor(name: string) {
    this.name = name;
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
class ScalarType extends Type {}

/**
 * @private
 */
class EnumType extends Type {}

/**
 * @private
 */
class UnionType extends Type {}

/**
 * @private
 */
class ObjectType extends Type {}

/**
 * @private
 */
class InputObjectType extends Type {}

/**
 * @private
 */
class InterfaceType extends Type {}

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
  +belongsTo: CompositeType | InputObjectType;
  +name: string;
  +type: TypeID;

  constructor(
    schema: Schema,
    name: string,
    type: TypeID,
    belongsTo: CompositeType | InputObjectType,
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
            type: schema.assertInputType(
              schema.expectTypeFromAST(nullthrows(arg.astNode?.type)),
            ),
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
    isAbstractType(type) &&
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
  type: AbstractTypeID,
): $ReadOnlyArray<ObjectTypeID> {
  const concreteTypes = new Set();
  schema.getPossibleTypes(type).forEach(possibleType => {
    if (isObject(possibleType)) {
      concreteTypes.add(possibleType);
    }
  });
  return Array.from(concreteTypes);
}

const TYPENAME_FIELD = '__typename';
const CLIENT_ID_FIELD = '__id';
const QUERY_TYPE_KEY = Symbol('Query');
const MUTATION_TYPE_KEY = Symbol('Mutation');
const SUBSCRIPTION_TYPE_KEY = Symbol('Subscription');

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

function isInputObject(type: mixed): boolean %checks {
  return type instanceof InputObjectType;
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
    type instanceof InputObjectType ||
    type instanceof InterfaceType
  );
}

function isAbstractType(type: mixed): boolean %checks {
  return type instanceof UnionType || type instanceof InterfaceType;
}

function isCompositeType(type: mixed): boolean %checks {
  return (
    type instanceof ObjectType ||
    type instanceof UnionType ||
    type instanceof InterfaceType
  );
}

function isInputType(type: mixed): boolean %checks {
  return (
    type instanceof InputObjectType ||
    type instanceof ScalarType ||
    type instanceof EnumType
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
  +_possibleTypesMap: Map<AbstractTypeID, Set<CompositeTypeID>>;
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
    possibleTypesMap: Map<AbstractTypeID, Set<CompositeTypeID>>,
    directivesMap: Map<string, Directive> | null,
  ) {
    this._baseSchema = baseSchema;
    this._extendedSchema = extendedSchema;
    this._typeMap = typeMap;
    this._fieldsMap = fieldsMap;
    this._typeNameMap = typeNameMap;
    this._clientIdMap = clientIdMap;
    this._possibleTypesMap = possibleTypesMap;
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
                  type: this.assertInputType(
                    arg.astNode
                      ? this.expectTypeFromAST(arg.astNode.type)
                      : this.expectTypeFromString(String(arg.type)),
                  ),
                  defaultValue: arg.defaultValue,
                };
              }),
            },
          ];
        }),
      );
  }

  getTypeFromAST(typeNode: TypeNode): ?TypeID {
    if (typeNode.kind === 'NonNullType') {
      const innerType = this.getTypeFromAST(typeNode.type);
      if (!innerType) {
        return;
      }
      if (innerType instanceof NonNull) {
        throw createCompilerError(
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
      const innerType = this.getTypeFromAST(typeNode.type);
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
      let TypeClass = Type;
      if (graphQLType instanceof GraphQLScalarType) {
        TypeClass = ScalarType;
      } else if (graphQLType instanceof GraphQLInputObjectType) {
        TypeClass = InputObjectType;
      } else if (graphQLType instanceof GraphQLEnumType) {
        TypeClass = EnumType;
      } else if (graphQLType instanceof GraphQLUnionType) {
        TypeClass = UnionType;
      } else if (graphQLType instanceof GraphQLInterfaceType) {
        TypeClass = InterfaceType;
      } else if (graphQLType instanceof GraphQLObjectType) {
        TypeClass = ObjectType;
      } else {
        throw createCompilerError(`Unknown GraphQL type: ${graphQLType}`);
      }
      type = new TypeClass(name);
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
      return this.getTypeFromAST(parseType(typeName));
    } else {
      let graphQLType;
      if (typeName === QUERY_TYPE_KEY) {
        graphQLType = this._baseSchema.getQueryType();
      } else if (typeName === MUTATION_TYPE_KEY) {
        graphQLType = this._baseSchema.getMutationType();
      } else if (typeName === SUBSCRIPTION_TYPE_KEY) {
        graphQLType = this._baseSchema.getSubscriptionType();
      }
      if (graphQLType) {
        const graphQLTypeName = graphQLType.name;
        const operationType =
          this._typeMap.get(graphQLTypeName) ?? new ObjectType(graphQLTypeName);
        this._typeMap.set(typeName, operationType);
        this._typeMap.set(graphQLTypeName, operationType);
        return operationType;
      }
    }
  }

  getTypeFromString(typeName: string): ?TypeID {
    return this._getRawType(typeName);
  }

  expectTypeFromString(typeName: string): TypeID {
    const type = this.getTypeFromString(typeName);
    if (type == null) {
      throw createCompilerError(`Unknown type: '${typeName}'.`);
    }
    return type;
  }

  expectTypeFromAST(ast: TypeNode): TypeID {
    const type = this.getTypeFromAST(ast);
    if (type == null) {
      throw createCompilerError(`Unknown type: '${print(ast)}'.`, null, [ast]);
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

  getListItemType(type: TypeID): TypeID {
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

  isTypeSubTypeOf(maybeSubType: TypeID, superType: TypeID): boolean {
    // Equivalent type is a valid subtype
    if (maybeSubType === superType) {
      return true;
    }

    // If superType is non-null, maybeSubType must also be non-null.
    if (superType instanceof NonNull) {
      if (maybeSubType instanceof NonNull) {
        return this.isTypeSubTypeOf(maybeSubType.ofType, superType.ofType);
      }
      return false;
    }
    if (maybeSubType instanceof NonNull) {
      // If superType is nullable, maybeSubType may be non-null or nullable.
      return this.isTypeSubTypeOf(maybeSubType.ofType, superType);
    }

    // If superType type is a list, maybeSubType type must also be a list.
    if (superType instanceof List) {
      if (maybeSubType instanceof List) {
        return this.isTypeSubTypeOf(maybeSubType.ofType, superType.ofType);
      }
      return false;
    }
    if (maybeSubType instanceof List) {
      // If superType is not a list, maybeSubType must also be not a list.
      return false;
    }

    // If superType type is an abstract type, maybeSubType type may be a currently
    // possible object type.
    if (
      this.isAbstractType(superType) &&
      this.isObject(maybeSubType) &&
      this.isPossibleType(
        this.assertAbstractType(superType),
        this.assertObjectType(maybeSubType),
      )
    ) {
      return true;
    }

    // Otherwise, maybeSubType is not a valid subtype of the superType.
    return false;
  }

  /**
   * Provided two composite types, determine if they "overlap". Two composite
   * types overlap when the Sets of possible concrete types for each intersect.
   *
   * This is often used to determine if a fragment of a given type could possibly
   * be visited in a context of another type.
   *
   * This function is commutative.
   */
  doTypesOverlap(typeA: CompositeTypeID, typeB: CompositeTypeID): boolean {
    // Equivalent types overlap
    if (typeA === typeB) {
      return true;
    }

    if (isAbstractType(typeA)) {
      if (isAbstractType(typeB)) {
        // If both types are abstract, then determine if there is any intersection
        // between possible concrete types of each.
        return Array.from(this.getPossibleTypes(typeA)).some(type => {
          if (isObject(type)) {
            return this.isPossibleType(typeB, type);
          }
        });
      }
      // Determine if the latter type is a possible concrete type of the former.
      return this.isPossibleType(typeA, typeB);
    }

    if (isAbstractType(typeB)) {
      // Determine if the former type is a possible concrete type of the latter.
      return this.isPossibleType(typeB, typeA);
    }

    // Otherwise the types do not overlap.
    return false;
  }

  isPossibleType(
    superType: AbstractTypeID,
    maybeSubType: ObjectTypeID,
  ): boolean {
    return this._getPossibleTypeSet(superType).has(maybeSubType);
  }

  assertScalarFieldType(type: mixed): ScalarFieldTypeID {
    // Scalar type fields can be wrappers / or can be scalars/enums
    if (
      (isWrapper(type) && !isScalar(unwrap(type)) && !isEnum(unwrap(type))) ||
      (!isWrapper(type) && !isScalar(type) && !isEnum(type))
    ) {
      throw createCompilerError(
        `Expected ${String(type)} to be a Scalar or Enum type.`,
      );
    }
    return type;
  }

  assertLinkedFieldType(type: mixed): LinkedFieldTypeID {
    // Linked Field types can be wrappers / or can be composite types
    if (
      (isWrapper(type) && !isCompositeType(unwrap(type))) ||
      (!isWrapper(type) && !isCompositeType(type))
    ) {
      throw createCompilerError(
        `Expected ${String(type)} to be a Object, Interface or a Union Type.`,
      );
    }
    return type;
  }

  assertInputType(type: mixed): InputTypeID {
    // Input type fields can be wrappers / or can be scalars/enums
    if (
      (isWrapper(type) && !isInputType(unwrap(type))) ||
      (!isWrapper(type) && !isInputType(type))
    ) {
      throw createCompilerError(
        `Expected ${String(type)} to be a Input, Scalar or Enum type.`,
      );
    }
    return type;
  }

  asCompositeType(type: mixed): ?CompositeTypeID {
    if (isCompositeType(type)) {
      return type;
    }
  }

  asInputType(type: mixed): ?InputTypeID {
    if (
      (isWrapper(type) && isInputType(unwrap(type))) ||
      (!isWrapper(type) && isInputType(type))
    ) {
      return type;
    }
  }

  asScalarFieldType(type: mixed): ?ScalarFieldTypeID {
    if (isScalar(type) || isEnum(type)) {
      return type;
    }
  }

  assertScalarType(type: TypeID): ScalarTypeID {
    if (!isScalar(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a scalar type.`,
      );
    }
    return type;
  }

  assertObjectType(type: TypeID): ObjectTypeID {
    if (!isObject(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be an object type.`,
      );
    }
    return type;
  }

  assertInputObjectType(type: TypeID): InputObjectTypeID {
    if (!isInputObject(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be an input type.`,
      );
    }
    return type;
  }

  assertInterfaceType(type: TypeID): InterfaceTypeID {
    if (!isInterface(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be an interface type.`,
      );
    }
    return type;
  }

  assertCompositeType(type: TypeID): CompositeTypeID {
    if (!isCompositeType(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a composite type.`,
      );
    }
    return type;
  }

  assertAbstractType(type: TypeID): AbstractTypeID {
    if (!isAbstractType(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be an abstract type.`,
      );
    }
    return type;
  }

  assertLeafType(type: TypeID): TypeID {
    if (!this.isLeafType(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a leaf type.`,
      );
    }
    return type;
  }

  assertUnionType(type: TypeID): UnionTypeID {
    if (!isUnion(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a union type.`,
      );
    }
    return type;
  }

  assertEnumType(type: TypeID): EnumTypeID {
    if (!isEnum(type)) {
      throw createCompilerError(`Expected ${String(type)} to be an enum type.`);
    }
    return type;
  }

  assertIntType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isInt(type)) {
      throw createCompilerError(
        `Expected ${String(type)} to be an 'Int' type.`,
      );
    }
    return type;
  }

  assertFloatType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isFloat(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a 'Float' type.`,
      );
    }
    return type;
  }

  assertBooleanType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isBoolean(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a 'Boolean' type.`,
      );
    }
    return type;
  }

  assertStringType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isString(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be a 'String' type.`,
      );
    }
    return type;
  }

  assertIdType(type: TypeID): ScalarTypeID {
    if (!isScalar(type) || !this.isId(type)) {
      throw createCompilerError(
        `Expected ${this.getTypeString(type)} to be an ID type.`,
      );
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

  getQueryType(): ?ObjectTypeID {
    const queryType = this._getRawType(QUERY_TYPE_KEY);
    if (queryType && isObject(queryType)) {
      return queryType;
    }
  }

  getMutationType(): ?ObjectTypeID {
    const mutationType = this._getRawType(MUTATION_TYPE_KEY);
    if (mutationType && isObject(mutationType)) {
      return mutationType;
    }
  }

  getSubscriptionType(): ?ObjectTypeID {
    const subscriptionType = this._getRawType(SUBSCRIPTION_TYPE_KEY);
    if (subscriptionType && isObject(subscriptionType)) {
      return subscriptionType;
    }
  }

  expectQueryType(): ObjectTypeID {
    const queryType = this.getQueryType();
    if (queryType == null) {
      throw createCompilerError('Query type is not defined on the Schema');
    }
    return queryType;
  }

  expectMutationType(): ObjectTypeID {
    const mutationType = this.getMutationType();
    if (mutationType == null) {
      throw createCompilerError('Mutation type is not defined the Schema');
    }
    return mutationType;
  }

  expectSubscriptionType(): ObjectTypeID {
    const subscriptionType = this.getSubscriptionType();
    if (subscriptionType == null) {
      throw createCompilerError('Subscription type is not defined the Schema');
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

  isInputObject(type: TypeID): boolean {
    return isInputObject(type);
  }

  isInterface(type: TypeID): boolean {
    return isInterface(type);
  }

  isInputType(type: TypeID): boolean {
    // Wrappers can be input types (so it's save to check unwrapped type here)
    return isInputType(type) || (isWrapper(type) && isInputType(unwrap(type)));
  }

  isCompositeType(type: TypeID): boolean {
    return isCompositeType(type);
  }

  isAbstractType(type: TypeID): boolean {
    return isAbstractType(type);
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

  hasField(
    type: CompositeTypeID | InputObjectTypeID,
    fieldName: string,
  ): boolean {
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
    throw createCompilerError(
      'hasField(): Expected a concrete type or interface, ' +
        `got type ${type.name}`,
    );
  }

  hasId(type: CompositeTypeID): boolean {
    if (!this.hasField(type, 'id')) {
      return false;
    }
    const idField = this.expectField(type, 'id');
    return this.areEqualTypes(
      this.getNullableType(this.getFieldType(idField)),
      this.expectIdType(),
    );
  }

  getFields(
    type: CompositeTypeID | InputObjectTypeID,
  ): $ReadOnlyArray<FieldID> {
    const fieldsMap = this._getFieldsMap(type);
    return Array.from(fieldsMap.values());
  }

  _getFieldsMap(type: CompositeTypeID | InputObjectTypeID): FieldsMap {
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
          new Field(
            this,
            fieldName,
            fieldType,
            this.assertCompositeType(type),
            field.args,
          ),
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

  getFieldByName(
    type: CompositeTypeID | InputObjectTypeID,
    fieldName: string,
  ): ?FieldID {
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

    if (isUnion(type)) {
      throw createCompilerError(
        `Unexpected union type '${this.getTypeString(
          type,
        )}' in the 'getFieldByName(...)'. Expected type with fields`,
      );
    }

    const fieldsMap = this._getFieldsMap(type);
    return fieldsMap.get(fieldName);
  }

  expectField(
    type: CompositeTypeID | InputObjectTypeID,
    fieldName: string,
  ): FieldID {
    const field = this.getFieldByName(type, fieldName);
    if (!field) {
      throw createCompilerError(
        `Unknown field '${fieldName}' on type '${this.getTypeString(type)}'.`,
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
    throw createCompilerError(`Expected '${type.name}' to be an enum.`);
  }

  getUnionTypes(type: UnionTypeID): $ReadOnlyArray<TypeID> {
    const gqlType = this._extendedSchema.getType(type.name);
    if (gqlType instanceof GraphQLUnionType) {
      return gqlType.getTypes().map(typeFromUnion => {
        return this.expectTypeFromString(typeFromUnion.name);
      });
    }
    throw createCompilerError(
      `Unable to get union types for type '${this.getTypeString(type)}'.`,
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

  _getPossibleTypeSet(type: AbstractTypeID): Set<CompositeTypeID> {
    let possibleTypes = this._possibleTypesMap.get(type);
    if (!possibleTypes) {
      const gqlType = this._extendedSchema.getType(type.name);
      if (
        gqlType instanceof GraphQLUnionType ||
        gqlType instanceof GraphQLInterfaceType
      ) {
        possibleTypes = new Set(
          this._extendedSchema.getPossibleTypes(gqlType).map(possibleType => {
            return this.assertObjectType(
              this.expectTypeFromString(possibleType.name),
            );
          }),
        );
        this._possibleTypesMap.set(type, possibleTypes);
      } else {
        throw createCompilerError(
          `Expected "${this.getTypeString(type)}" to be an Abstract type.`,
        );
      }
    }
    return possibleTypes;
  }

  getPossibleTypes(type: AbstractTypeID): $ReadOnlySet<CompositeTypeID> {
    return this._getPossibleTypeSet(type);
  }

  parseLiteral(type: ScalarTypeID | EnumTypeID, valueNode: ValueNode): mixed {
    const gqlType = this._extendedSchema.getType(type.name);
    if (
      gqlType instanceof GraphQLEnumType ||
      gqlType instanceof GraphQLScalarType
    ) {
      return gqlType.parseLiteral(valueNode);
    }
    throw createCompilerError(
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
    throw createCompilerError(
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
    throw createCompilerError(
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

  isServerDefinedField(type: CompositeTypeID, field: IRField): boolean {
    return (
      (this.isAbstractType(type) &&
        field.directives.some(({name}) => name === 'fixme_fat_interface')) ||
      (this.hasField(type, field.name) &&
        this.isServerField(this.expectField(type, field.name)))
    );
  }

  isClientDefinedField(type: CompositeTypeID, field: IRField): boolean {
    return !this.isServerDefinedField(type, field);
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
      this._possibleTypesMap,
      this._directivesMap,
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
    new Map(),
    null,
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
    new Map(),
    null,
  );
}

module.exports = {
  DEPRECATED__buildGraphQLSchema,
  DEPRECATED__create,
  create,
};

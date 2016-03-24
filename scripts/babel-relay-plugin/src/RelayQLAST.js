/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const {
  type: types,
  type_introspection: {
    SchemaMetaFieldDef,
    TypeMetaFieldDef,
    TypeNameMetaFieldDef,
  },
} = require('./GraphQL');
const GraphQLRelayDirective = require('./GraphQLRelayDirective');

const find = require('./find');
const invariant = require('./invariant');

import type {
  Argument as GraphQLArgument,
  Directive as GraphQLDirective,
  Field as GraphQLField,
  FragmentDefinition as GraphQLFragmentDefinition,
  FragmentSpread as GraphQLFragmentSpread,
  InlineFragment as GraphQLInlineFragment,
  OperationDefinition as GraphQLOperationDefinition,
  Value as GraphQLValue,
} from 'GraphQLAST';

// TODO: Import types from `graphql`.
type GraphQLSchema = Object;
type GraphQLSchemaArgumentType = Object;
type GraphQLSchemaField = Object;
type GraphQLSchemaType = Object;

type RelayQLContext = {
  definitionName: string;
  generateID: () => string;
  isPattern: boolean;
  schema: GraphQLSchema;
};
type RelayQLSelection =
  RelayQLField |
  RelayQLFragmentSpread |
  RelayQLInlineFragment;

class RelayQLNode<T> {
  ast: T;
  context: RelayQLContext;

  constructor(context: RelayQLContext, ast: T) {
    this.ast = ast;
    this.context = context;
  }

  getType(): RelayQLType {
    invariant(false, 'Missing Implementation');
  }

  getField(fieldName: string): ?RelayQLField {
    return find(this.getFields(), field => field.getName() === fieldName);
  }

  getFields(): Array<RelayQLField> {
    const fields = [];
    this.getSelections().forEach(selection => {
      if (selection instanceof RelayQLField) {
        fields.push(selection);
      }
    });
    return fields;
  }

  getSelections(): Array<RelayQLSelection> {
    if (!this.ast.selectionSet) {
      return [];
    }
    return this.ast.selectionSet.selections.map(selection => {
      if (selection.kind === 'Field') {
        return new RelayQLField(this.context, selection, this.getType());
      } else if (selection.kind === 'FragmentSpread') {
        return new RelayQLFragmentSpread(this.context, selection);
      } else if (selection.kind === 'InlineFragment') {
        return new RelayQLInlineFragment(
          this.context,
          selection,
          this.getType()
        );
      } else {
        invariant(false, 'Unexpected selection kind: %s', selection.kind);
      }
    });
  }

  getDirectives(): Array<RelayQLDirective> {
    return (this.ast.directives || []).map(
      directive => new RelayQLDirective(this.context, directive)
    );
  }

  hasDirective(name: string): boolean {
    return (this.ast.directives || []).some(d => d.name.value === name);
  }

  isPattern(): boolean {
    return this.context.isPattern;
  }
}

class RelayQLDefinition<T> extends RelayQLNode<T> {
  getName(): ?string {
    return this.ast.name ? this.ast.name.value : this.getType().getName({modifiers: false}); // TODO: this.context.definitionName;
  }
}

class RelayQLFragment extends RelayQLDefinition<
  GraphQLFragmentDefinition |
  GraphQLInlineFragment
> {
  hasStaticFragmentID: boolean;
  parentType: ?RelayQLType;
  staticFragmentID: ?string;

  constructor(
    context: RelayQLContext,
    ast: GraphQLFragmentDefinition | GraphQLInlineFragment,
    parentType?: RelayQLType
  ) {
    const relayDirectiveArgs = {};
    const relayDirective = (ast.directives || []).find(
      directive => directive.name.value === 'relay'
    );
    if (relayDirective) {
      (relayDirective.arguments || []).forEach(arg => {
        relayDirectiveArgs[arg.name.value] = arg.value;
      });
    }

    // @relay(pattern: true)
    const isPattern =
      relayDirectiveArgs.pattern &&
      relayDirectiveArgs.pattern.kind === 'BooleanValue' &&
      relayDirectiveArgs.pattern.value;

    // @relay(isStaticFragment: true)
    const isStaticFragment =
      relayDirectiveArgs.isStaticFragment &&
      relayDirectiveArgs.isStaticFragment.kind === 'BooleanValue' &&
      relayDirectiveArgs.isStaticFragment.value;

    super({...context, isPattern}, ast);
    this.hasStaticFragmentID = isStaticFragment;
    this.parentType = parentType;
    this.staticFragmentID = null;
  }

  getStaticFragmentID(): ?string {
    if (this.hasStaticFragmentID && this.staticFragmentID == null) {
      const suffix = this.context.generateID();
      const name = this.getName();
      invariant(
        name,
        'Static fragments require a name. Use `fragment NAME on %s { ... }`.',
        this.getType().getName({modifiers: true})
      );
      this.staticFragmentID = name + ':' + suffix;
    }
    return this.staticFragmentID;
  }

  getType(): RelayQLType {
    let type = this.ast.typeCondition;
    if (type) {
      // Convert `ListType` and `NonNullType` into `NamedType`.
      while (type.kind !== 'NamedType') {
        type = type.type;
      }
      return new RelayQLType(
        this.context,
        this.context.schema.getType(type.name.value)
      );
    } else if (this.ast.kind === 'InlineFragment') {
      // Inline fragments without type conditions fall back to parent type.
      invariant(
        this.parentType,
        'Cannot get type of typeless inline fragment without parent type.'
      );
      return this.parentType;
    } else {
      invariant(false, 'Unexpected fragment kind: %s', this.ast.kind);
    }
  }
}

class RelayQLMutation extends RelayQLDefinition<GraphQLOperationDefinition> {
  getType(): RelayQLType {
    return new RelayQLType(this.context, this.context.schema.getMutationType());
  }
}

class RelayQLQuery extends RelayQLDefinition<GraphQLOperationDefinition> {
  getType(): RelayQLType {
    return new RelayQLType(this.context, this.context.schema.getQueryType());
  }
}

class RelayQLSubscription extends RelayQLDefinition<GraphQLOperationDefinition> {
  getType(): RelayQLType {
    return new RelayQLType(
      this.context,
      this.context.schema.getSubscriptionType()
    );
  }
}

class RelayQLField extends RelayQLNode<GraphQLField> {
  fieldDef: RelayQLFieldDefinition;

  constructor(context: RelayQLContext, ast: GraphQLField, parentType: RelayQLType) {
    super(context, ast);
    const fieldName = this.ast.name.value;
    const fieldDef = parentType.getFieldDefinition(fieldName, ast);
    invariant(
      fieldDef,
      'You supplied a field named `%s` on type `%s`, but no such field ' +
      'exists on that type.',
      fieldName,
      parentType.getName({modifiers: false})
    );
    this.fieldDef = fieldDef;
  }

  getName(): string {
    return this.ast.name.value;
  }

  getAlias(): ?string {
    return this.ast.alias ? this.ast.alias.value : null;
  }

  getType(): RelayQLType {
    return this.fieldDef.getType();
  }

  hasArgument(argName: string): boolean {
    return this.getArguments().some(arg => arg.getName() === argName);
  }

  findArgument(argName: string): ?RelayQLArgument {
    return find(this.getArguments(), arg => arg.getName() === argName);
  }

  getArguments(): Array<RelayQLArgument> {
    const argTypes = this.fieldDef.getDeclaredArguments();
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = argTypes[argName];
      invariant(
        argType,
        'You supplied an argument named `%s` on field `%s`, but no such ' +
        'argument exists on that field.',
        argName,
        this.getName()
      );
      return new RelayQLArgument(this.context, arg, argType);
    });
  }

  hasDeclaredArgument(argName: string): boolean {
    return this.fieldDef.getDeclaredArguments().hasOwnProperty(argName);
  }

  getDeclaredArgument(argName: string): RelayQLArgumentType {
    return this.fieldDef.getArgument(argName);
  }

  getDeclaredArguments(): {[argName: string]: RelayQLArgumentType} {
    return this.fieldDef.getDeclaredArguments();
  }
}

class RelayQLFragmentSpread extends RelayQLNode<GraphQLFragmentSpread> {
  getName(): string {
    return this.ast.name.value;
  }

  getSelections(): Array<RelayQLSelection> {
    invariant(false, 'Cannot get selection of a fragment spread.');
  }
}

class RelayQLInlineFragment extends RelayQLNode<GraphQLInlineFragment> {
  parentType: RelayQLType;

  constructor(
    context: RelayQLContext,
    ast: GraphQLInlineFragment,
    parentType: RelayQLType
  ) {
    super(context, ast);
    this.parentType = parentType;
  }

  getFragment(): RelayQLFragment {
    return new RelayQLFragment(this.context, this.ast, this.parentType);
  }
}

class RelayQLDirective {
  ast: GraphQLDirective;
  context: RelayQLContext;
  argTypes: {[name: string]: RelayQLArgumentType};

  constructor(context: RelayQLContext, ast: GraphQLDirective) {
    this.ast = ast;
    this.context = context;
    this.argTypes = {};

    const directiveName = ast.name.value;
    const schemaDirective =
      directiveName === GraphQLRelayDirective.name ?
        GraphQLRelayDirective :
        context.schema.getDirective(directiveName);
    invariant(
      schemaDirective,
      'You supplied a directive named `%s`, but no such directive exists.',
      directiveName
    );
    schemaDirective.args.forEach(schemaArg => {
      this.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  getName(): string {
    return this.ast.name.value;
  }

  getArguments(): Array<RelayQLArgument> {
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = this.argTypes[argName];
      invariant(
        argType,
        'You supplied an argument named `%s` on directive `%s`, but no ' +
        'such argument exists on that directive.',
        argName,
        this.getName()
      );
      return new RelayQLArgument(this.context, arg, argType);
    });
  }
}

class RelayQLArgument {
  ast: GraphQLArgument;
  context: RelayQLContext;
  type: RelayQLArgumentType;

  constructor(
    context: RelayQLContext,
    ast: GraphQLArgument,
    type: RelayQLArgumentType
  ) {
    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  getName(): string {
    return this.ast.name.value;
  }

  getType(): RelayQLArgumentType {
    return this.type;
  }

  isVariable(): boolean {
    return this.ast.value.kind === 'Variable';
  }

  getVariableName(): string {
    invariant(
      this.ast.value.kind === 'Variable',
      'Cannot get variable name of an argument value.'
    );
    return this.ast.value.name.value;
  }

  getValue(): mixed {
    invariant(
      !this.isVariable(),
      'Cannot get value of an argument variable.'
    );
    const value = this.ast.value;
    if (value.kind === 'ListValue') {
      return value.values.map(
        value => new RelayQLArgument(
          this.context,
          {...this.ast, value},
          this.type.ofType()
        )
      );
    } else {
      return getLiteralValue(value);
    }
  }
}

class RelayQLType {
  isListType: boolean;
  isNonNullType: boolean;
  context: RelayQLContext;
  schemaModifiedType: GraphQLSchemaType;
  schemaUnmodifiedType: GraphQLSchemaType;

  constructor(context: RelayQLContext, schemaModifiedType: GraphQLSchemaType) {
    this.context = context;
    const {
      isListType,
      isNonNullType,
      schemaUnmodifiedType,
    } = stripMarkerTypes(schemaModifiedType);
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedType = schemaUnmodifiedType;
    this.schemaModifiedType = schemaModifiedType;
  }

  canHaveSubselections(): boolean {
    return !(
      this.schemaUnmodifiedType instanceof types.GraphQLScalarType ||
      this.schemaUnmodifiedType instanceof types.GraphQLEnumType
    );
  }

  getName({modifiers}: {modifiers: boolean}): string {
    return modifiers ?
      this.schemaModifiedType.toString() :
      this.schemaUnmodifiedType.toString();
  }

  hasField(fieldName: string): boolean {
    return !!this.getFieldDefinition(fieldName);
  }

  getFieldDefinition(
    fieldName: string,
    fieldAST?: any
  ): ?RelayQLFieldDefinition {
    const type = this.schemaUnmodifiedType;
    const isQueryType = type === this.context.schema.getQueryType();
    const hasTypeName =
      type instanceof types.GraphQLObjectType ||
      type instanceof types.GraphQLInterfaceType ||
      type instanceof types.GraphQLUnionType;
    const hasFields =
      type instanceof types.GraphQLObjectType ||
      type instanceof types.GraphQLInterfaceType;

    let schemaFieldDef;
    if (isQueryType && fieldName === SchemaMetaFieldDef.name) {
      schemaFieldDef = SchemaMetaFieldDef;
    } else if (isQueryType && fieldName === TypeMetaFieldDef.name) {
      schemaFieldDef = TypeMetaFieldDef;
    } else if (hasTypeName && fieldName === TypeNameMetaFieldDef.name) {
      schemaFieldDef = TypeNameMetaFieldDef;
    } else if (hasFields) {
      schemaFieldDef = type.getFields()[fieldName];
    }

    // Temporary workarounds to support legacy schemas
    if (!schemaFieldDef) {
      if (hasTypeName && fieldName === '__type__') {
        schemaFieldDef = {
          name: '__type__',
          type: new types.GraphQLNonNull(this.context.schema.getType('Type')),
          description: 'The introspected type of this object.',
          deprecatedReason: 'Use __typename',
          args: [],
        };
      } else if (
        types.isAbstractType(type) &&
        fieldAST &&
        fieldAST.directives &&
        fieldAST.directives.some(
          directive => directive.name.value === 'fixme_fat_interface'
        )
      ) {
        const possibleTypes = type.getPossibleTypes();
        for (let ii = 0; ii < possibleTypes.length; ii++) {
          const possibleField = possibleTypes[ii].getFields()[fieldName];
          if (possibleField) {
            // Fat interface fields can have differing arguments. Try to return
            // a field with matching arguments, but still return a field if the
            // arguments do not match.
            schemaFieldDef = possibleField;
            if (fieldAST && fieldAST.arguments) {
              const argumentsAllExist = fieldAST.arguments.every(
                argument => find(
                  possibleField.args,
                  argDef => argDef.name === argument.name.value
                )
              );
              if (argumentsAllExist) {
                break;
              }
            }
          }
        }
      }
    }

    return schemaFieldDef ?
      new RelayQLFieldDefinition(this.context, schemaFieldDef) :
      null;
  }

  getInterfaces(): Array<RelayQLType> {
    if (this.schemaUnmodifiedType instanceof types.GraphQLObjectType) {
      return this.schemaUnmodifiedType.getInterfaces().map(
        schemaInterface => new RelayQLType(this.context, schemaInterface)
      );
    }
    return [];
  }

  getConcreteTypes(): Array<RelayQLType> {
    invariant(
      this.isAbstract(),
      'Cannot get concrete types of a concrete type.'
    );
    return this.schemaUnmodifiedType.getPossibleTypes().map(
      concreteType => new RelayQLType(this.context, concreteType)
    );
  }

  getIdentifyingFieldDefinition(): ?RelayQLFieldDefinition {
    if (this.alwaysImplements('Node')) {
      return this.getFieldDefinition('id');
    }
    return null;
  }

  isAbstract(): boolean {
    return types.isAbstractType(this.schemaUnmodifiedType);
  }

  isList(): boolean {
    return this.isListType;
  }

  isNonNull(): boolean {
    return this.isNonNullType;
  }

  isConnection(): boolean {
    if (!/Connection$/.test(this.getName({modifiers: false}))) {
      return false;
    }
    const edges = this.getFieldDefinition('edges');
    if (!edges || !edges.getType().canHaveSubselections()) {
      return false;
    }
    const node = edges.getType().getFieldDefinition('node');
    if (!node || !node.getType().canHaveSubselections()) {
      return false;
    }
    const cursor = edges.getType().getFieldDefinition('cursor');
    if (!cursor || cursor.getType().canHaveSubselections()) {
      return false;
    }
    return true;
  }

  isConnectionEdge(): boolean {
    return (
      /Edge$/.test(this.getName({modifiers: false})) &&
      this.hasField('node') &&
      this.hasField('cursor')
    );
  }

  isConnectionPageInfo(): boolean {
    return this.getName({modifiers: false}) === 'PageInfo';
  }

  alwaysImplements(typeName: string): boolean {
    return (
      this.getName({modifiers: false}) === typeName ||
      this.getInterfaces().some(
        type => type.getName({modifiers: false}) === typeName
      ) ||
      (
        this.isAbstract() &&
        this.getConcreteTypes().every(type => type.alwaysImplements(typeName))
      )
    );
  }

  mayImplement(typeName: string): boolean {
    return (
      this.getName({modifiers: false}) === typeName ||
      this.getInterfaces().some(
        type => type.getName({modifiers: false}) === typeName
      ) ||
      (
        this.isAbstract() &&
        this.getConcreteTypes().some(type => type.alwaysImplements(typeName))
      )
    );
  }

  generateField(fieldName: string): RelayQLField {
    const generatedFieldAST = {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: fieldName,
      },
    };
    return new RelayQLField(this.context, generatedFieldAST, this);
  }

  generateIdFragment(): RelayQLFragment {
    const generatedFragmentAST = {
      kind: 'Fragment',
      name: {
        kind: 'Name',
        value: 'IdFragment',
      },
      typeCondition: {
        kind: 'NamedType',
        name: {
          value: 'Node',
        },
      },
      selectionSet: {
        selections: [{
          kind: 'Field',
          name: {
            name: 'Name',
            value: 'id',
          },
        }],
      },
    };
    return new RelayQLFragment(this.context, (generatedFragmentAST: any), this);
  }
}

class RelayQLFieldDefinition {
  context: RelayQLContext;
  schemaFieldDef: GraphQLSchemaField;

  constructor(
    context: RelayQLContext,
    schemaFieldDef: GraphQLSchemaField
  ) {
    this.context = context;
    this.schemaFieldDef = schemaFieldDef;
  }

  getName(): string {
    return this.schemaFieldDef.name;
  }

  getType(): RelayQLType {
    return new RelayQLType(this.context, this.schemaFieldDef.type);
  }

  hasArgument(argName: string): boolean {
    return this.schemaFieldDef.args.some(
      schemaArg => schemaArg.name === argName
    );
  }

  getArgument(argName: string): RelayQLArgumentType {
    const schemaArg = find(
      this.schemaFieldDef.args,
      schemaArg => schemaArg.name === argName
    );
    invariant(
      schemaArg,
      'You tried to get an argument named `%s` on field `%s`, but no such ' +
      'argument exists on that field.',
      argName,
      this.getName()
    );
    return new RelayQLArgumentType(schemaArg.type);
  }

  getDeclaredArguments(): {[argName: string]: RelayQLArgumentType} {
    const args = {};
    this.schemaFieldDef.args.forEach(schemaArg => {
      args[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
    return args;
  }
}

class RelayQLArgumentType {
  isListType: boolean;
  isNonNullType: boolean;
  schemaModifiedArgType: GraphQLSchemaArgumentType;
  schemaUnmodifiedArgType: GraphQLSchemaArgumentType;

  constructor(schemaModifiedArgType: GraphQLSchemaArgumentType) {
    const {
      isListType,
      isNonNullType,
      schemaUnmodifiedType,
    } = stripMarkerTypes(schemaModifiedArgType);
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedArgType = schemaUnmodifiedType;
    this.schemaModifiedArgType = schemaModifiedArgType;
  }

  getName({modifiers}: {modifiers: boolean}): string {
    return modifiers ?
      this.schemaModifiedArgType.toString() :
      this.schemaUnmodifiedArgType.toString();
  }

  ofType(): RelayQLArgumentType {
    invariant(
      this.isList() || this.isNonNull(),
      'Can only get type of list or non-null type.'
    );
    return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
  }

  isEnum(): boolean {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLEnumType;
  }

  isList(): boolean {
    return this.isListType;
  }

  isNonNull(): boolean {
    return this.isNonNullType;
  }

  isObject(): boolean {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLInputObjectType;
  }

  isScalar(): boolean {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLScalarType;
  }
}

function stripMarkerTypes(schemaModifiedType: GraphQLSchemaType): {
  isListType: boolean;
  isNonNullType: boolean;
  schemaUnmodifiedType: GraphQLSchemaType;
} {
  let isListType = false;
  let isNonNullType = false;
  let schemaUnmodifiedType = schemaModifiedType;
  while (true) {
    if (schemaUnmodifiedType instanceof types.GraphQLList) {
      isListType = true;
    } else if (schemaUnmodifiedType instanceof types.GraphQLNonNull) {
      isNonNullType = true;
    } else {
      break;
    }
    schemaUnmodifiedType = schemaUnmodifiedType.ofType;
  }
  return {isListType, isNonNullType, schemaUnmodifiedType};
}

function getLiteralValue(value: GraphQLValue): mixed {
  switch (value.kind) {
    case 'IntValue':
      return parseInt(value.value, 10);
    case 'FloatValue':
      return parseFloat(value.value);
    case 'StringValue':
    case 'BooleanValue':
    case 'EnumValue':
      return value.value;
    case 'ListValue':
      return value.values.map(getLiteralValue);
    case 'ObjectValue':
      const object = {};
      value.fields.forEach(field => {
        object[field.name.value] = getLiteralValue(field.value);
      });
      return object;
    case 'Variable':
      invariant(
        false,
        'Unexpected nested variable `%s`; variables are supported as top-' +
        'level arguments - `node(id: $id)` - or directly within lists - ' +
        '`nodes(ids: [$id])`.',
        value.name.value
      );
    default:
      invariant(
        false,
        'Unexpected value kind: %s',
        value.kind
      );
  }
}

module.exports = {
  RelayQLArgument,
  RelayQLArgumentType,
  RelayQLDefinition,
  RelayQLDirective,
  RelayQLField,
  RelayQLFieldDefinition,
  RelayQLFragment,
  RelayQLFragmentSpread,
  RelayQLInlineFragment,
  RelayQLMutation,
  RelayQLNode,
  RelayQLQuery,
  RelayQLSubscription,
  RelayQLType,
};

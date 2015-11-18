// @generated
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @fullSyntaxTransform
 */

'use strict';

const types = require('graphql/type');
const {
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef
} = require('graphql/type/introspection');

const find = require('./find');
const invariant = require('./invariant');
/* TODO: Spread is not working on babel6 right now. https://github.com/reactjs/react-rails/issues/313
* Using solution from babel5 https://babeljs.io/repl/ */
const _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

// TODO: Import types from `graphql`.

const GraphQLRelayDirective = {
  name: 'relay',
  args: [{
    name: 'pattern',
    type: types.GraphQLBoolean
  }, {
    name: 'plural',
    type: types.GraphQLBoolean
  }]
};

class RelayQLNode {

  constructor(context, ast) {
    this.ast = ast;
    this.context = context;
  }

  getType() {
    invariant(false, 'Missing Implementation');
  }

  getField(fieldName) {
    return find(this.getFields(), field => field.getName() === fieldName);
  }

  getFields() {
    const fields = [];
    this.getSelections().forEach(selection => {
      if (selection instanceof RelayQLField) {
        fields.push(selection);
      }
    });
    return fields;
  }

  getSelections() {
    if (!this.ast.selectionSet) {
      return [];
    }
    return this.ast.selectionSet.selections.map(selection => {
      if (selection.kind === 'Field') {
        return new RelayQLField(this.context, selection, this.getType());
      } else if (selection.kind === 'FragmentSpread') {
        return new RelayQLFragmentSpread(this.context, selection);
      } else if (selection.kind === 'InlineFragment') {
        return new RelayQLInlineFragment(this.context, selection, this.getType());
      } else {
        invariant(false, 'Unexpected selection kind: %s', selection.kind);
      }
    });
  }

  getDirectives() {
    return (this.ast.directives || []).map(directive => new RelayQLDirective(this.context, directive));
  }

  isPattern() {
    return this.context.isPattern;
  }
}

class RelayQLDefinition extends RelayQLNode {
  getName() {
    return this.ast.name ? this.ast.name.value : this.getType().getName({ modifiers: false }); // TODO: this.context.definitionName;
  }
}

class RelayQLFragment extends RelayQLDefinition {

  constructor(context, ast, parentType) {
    // @relay(pattern: true)
    const isPattern = (ast.directives || []).some(directive => directive.name.value === 'relay' && (directive.arguments || []).some(arg => arg.name.value === 'pattern' && arg.value.kind === 'BooleanValue' && arg.value.value));
    super(_extends({}, context, { isPattern: isPattern }), ast);
    this.parentType = parentType;
  }

  getType() {
    let type = this.ast.typeCondition;
    if (type) {
      // Convert `ListType` and `NonNullType` into `NamedType`.
      while (type.kind !== 'NamedType') {
        type = type.type;
      }
      return new RelayQLType(this.context, this.context.schema.getType(type.name.value));
    } else if (this.ast.kind === 'InlineFragment') {
      // Inline fragments without type conditions fall back to parent type.
      invariant(this.parentType, 'Cannot get type of typeless inline fragment without parent type.');
      return this.parentType;
    } else {
      invariant(false, 'Unexpected fragment kind: %s', this.ast.kind);
    }
  }
}

class RelayQLMutation extends RelayQLDefinition {
  getType() {
    return new RelayQLType(this.context, this.context.schema.getMutationType());
  }
}

class RelayQLQuery extends RelayQLDefinition {
  getType() {
    return new RelayQLType(this.context, this.context.schema.getQueryType());
  }
}

class RelayQLField extends RelayQLNode {

  constructor(context, ast, parentType) {
    super(context, ast);
    const fieldName = this.ast.name.value;
    const fieldDef = parentType.getFieldDefinition(fieldName);
    invariant(fieldDef, 'You supplied a field named `%s` on type `%s`, but no such field ' + 'exists on that type.', fieldName, parentType.getName({ modifiers: false }));
    this.fieldDef = fieldDef;
  }

  getName() {
    return this.ast.name.value;
  }

  getAlias() {
    return this.ast.alias ? this.ast.alias.value : null;
  }

  getType() {
    return this.fieldDef.getType();
  }

  hasArgument(argName) {
    return this.getArguments().some(arg => arg.getName() === argName);
  }

  getArguments() {
    const argTypes = this.fieldDef.getDeclaredArguments();
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = argTypes[argName];
      invariant(argType, 'You supplied an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, this.getName());
      return new RelayQLArgument(this.context, arg, argType);
    });
  }

  hasDeclaredArgument(argName) {
    return this.fieldDef.getDeclaredArguments().hasOwnProperty(argName);
  }

  getDeclaredArgument(argName) {
    return this.fieldDef.getArgument(argName);
  }

  getDeclaredArguments() {
    return this.fieldDef.getDeclaredArguments();
  }
}

class RelayQLFragmentSpread extends RelayQLNode {
  getName() {
    return this.ast.name.value;
  }

  getSelections() {
    invariant(false, 'Cannot get selection of a fragment spread.');
  }
}

class RelayQLInlineFragment extends RelayQLNode {

  constructor(context, ast, parentType) {
    super(context, ast);
    this.parentType = parentType;
  }

  getFragment() {
    return new RelayQLFragment(this.context, this.ast, this.parentType);
  }
}

class RelayQLDirective {

  constructor(context, ast) {
    this.ast = ast;
    this.context = context;
    this.argTypes = {};

    const directiveName = ast.name.value;
    const schemaDirective = directiveName === GraphQLRelayDirective.name ? GraphQLRelayDirective : context.schema.getDirective(directiveName);
    invariant(schemaDirective, 'You supplied a directive named `%s`, but no such directive exists.', directiveName);
    schemaDirective.args.forEach(schemaArg => {
      this.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  getName() {
    return this.ast.name.value;
  }

  getArguments() {
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = this.argTypes[argName];
      invariant(argType, 'You supplied an argument named `%s` on directive `%s`, but no ' + 'such argument exists on that directive.', argName, this.getName());
      return new RelayQLArgument(this.context, arg, argType);
    });
  }
}

class RelayQLArgument {

  constructor(context, ast, type) {
    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  getName() {
    return this.ast.name.value;
  }

  getType() {
    return this.type;
  }

  isVariable() {
    return this.ast.value.kind === 'Variable';
  }

  getVariableName() {
    invariant(this.ast.value.kind === 'Variable', 'Cannot get variable name of an argument value.');
    return this.ast.value.name.value;
  }

  getValue() {
    invariant(!this.isVariable(), 'Cannot get value of an argument variable.');
    const value = this.ast.value;
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
        return value.values.map(value => new RelayQLArgument(this.context, _extends({}, this.ast, { value: value }), this.type.ofType()));
    }
    invariant(false, 'Unexpected argument kind: %s', value.kind);
  }
}

class RelayQLType {

  constructor(context, schemaModifiedType) {
    this.context = context;
    const {
      isListType,
      isNonNullType,
      schemaUnmodifiedType
    } = stripMarkerTypes(schemaModifiedType);
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedType = schemaUnmodifiedType;
    this.schemaModifiedType = schemaModifiedType;
  }

  getName({ modifiers }) {
    return modifiers ? this.schemaModifiedType.toString() : this.schemaUnmodifiedType.toString();
  }

  hasField(fieldName) {
    return !!this.getFieldDefinition(fieldName);
  }

  getFieldDefinition(fieldName) {
    const type = this.schemaUnmodifiedType;
    const isQueryType = type === this.context.schema.getQueryType();
    const hasTypeName = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType || type instanceof types.GraphQLUnionType;
    const hasFields = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType;

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
    return schemaFieldDef ? new RelayQLFieldDefinition(this.context, schemaFieldDef) : null;
  }

  getInterfaces() {
    if (this.schemaUnmodifiedType instanceof types.GraphQLObjectType) {
      return this.schemaUnmodifiedType.getInterfaces().map(schemaInterface => new RelayQLType(this.context, schemaInterface));
    }
    return [];
  }

  getConcreteTypes() {
    invariant(this.isAbstract(), 'Cannot get concrete types of a concrete type.');
    return this.schemaUnmodifiedType.getPossibleTypes().map(concreteType => new RelayQLType(this.context, concreteType));
  }

  getIdentifyingFieldDefinition() {
    if (this.alwaysImplements('Node')) {
      return this.getFieldDefinition('id');
    }
    return null;
  }

  isAbstract() {
    return types.isAbstractType(this.schemaUnmodifiedType);
  }

  isList() {
    return this.isListType;
  }

  isNonNull() {
    return this.isNonNullType;
  }

  isScalar() {
    return this.schemaUnmodifiedType instanceof types.GraphQLScalarType;
  }

  isConnection() {
    if (!/Connection$/.test(this.getName({ modifiers: false }))) {
      return false;
    }
    const edges = this.getFieldDefinition('edges');
    if (!edges || edges.getType().isScalar()) {
      return false;
    }
    const node = edges.getType().getFieldDefinition('node');
    if (!node || node.getType().isScalar()) {
      return false;
    }
    const cursor = edges.getType().getFieldDefinition('cursor');
    if (!cursor || !cursor.getType().isScalar()) {
      return false;
    }
    return true;
  }

  isConnectionEdge() {
    return (/Edge$/.test(this.getName({ modifiers: false })) && this.hasField('node') && this.hasField('cursor')
    );
  }

  isConnectionPageInfo() {
    return this.getName({ modifiers: false }) === 'PageInfo';
  }

  alwaysImplements(typeName) {
    return this.getName({ modifiers: false }) === typeName || this.getInterfaces().some(type => type.getName({ modifiers: false }) === typeName) || this.isAbstract() && this.getConcreteTypes().every(type => type.alwaysImplements(typeName));
  }

  generateField(fieldName) {
    const generatedFieldAST = {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: fieldName
      }
    };
    return new RelayQLField(this.context, generatedFieldAST, this);
  }
}

class RelayQLFieldDefinition {

  constructor(context, schemaFieldDef) {
    this.context = context;
    this.schemaFieldDef = schemaFieldDef;
  }

  getName() {
    return this.schemaFieldDef.name;
  }

  getType() {
    return new RelayQLType(this.context, this.schemaFieldDef.type);
  }

  hasArgument(argName) {
    return this.schemaFieldDef.args.some(schemaArg => schemaArg.name === argName);
  }

  getArgument(argName) {
    const schemaArg = find(this.schemaFieldDef.args, schemaArg => schemaArg.name === argName);
    invariant(schemaArg, 'You tried to get an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, this.getName());
    return new RelayQLArgumentType(schemaArg.type);
  }

  getDeclaredArguments() {
    const args = {};
    this.schemaFieldDef.args.forEach(schemaArg => {
      args[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
    return args;
  }
}

class RelayQLArgumentType {

  constructor(schemaModifiedArgType) {
    const {
      isListType,
      isNonNullType,
      schemaUnmodifiedType
    } = stripMarkerTypes(schemaModifiedArgType);
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedArgType = schemaUnmodifiedType;
    this.schemaModifiedArgType = schemaModifiedArgType;
  }

  getName({ modifiers }) {
    return modifiers ? this.schemaModifiedArgType.toString() : this.schemaUnmodifiedArgType.toString();
  }

  ofType() {
    invariant(this.isList() || this.isNonNull(), 'Can only get type of list or non-null type.');
    return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
  }

  isEnum() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLEnumType;
  }

  isList() {
    return this.isListType;
  }

  isNonNull() {
    return this.isNonNullType;
  }

  isObject() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLInputObjectType;
  }

  isScalar() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLScalarType;
  }
}

function stripMarkerTypes(schemaModifiedType) {
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
  return { isListType, isNonNullType, schemaUnmodifiedType };
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
  RelayQLType
};
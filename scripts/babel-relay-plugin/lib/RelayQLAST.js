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

// TODO: Import types from `graphql`.
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var types = require('graphql/type');

var _require = require('graphql/type/introspection');

var SchemaMetaFieldDef = _require.SchemaMetaFieldDef;
var TypeMetaFieldDef = _require.TypeMetaFieldDef;
var TypeNameMetaFieldDef = _require.TypeNameMetaFieldDef;

var invariant = require('./invariant');
var util = require('util');

var GraphQLRelayDirective = {
  name: 'relay',
  args: [{
    name: 'plural',
    type: types.GraphQLBoolean
  }]
};

var RelayQLNode = (function () {
  function RelayQLNode(context, ast) {
    _classCallCheck(this, RelayQLNode);

    this.ast = ast;
    this.context = context;
  }

  _createClass(RelayQLNode, [{
    key: 'getType',
    value: function getType() {
      invariant(false, 'Missing Implementation');
    }
  }, {
    key: 'getField',
    value: function getField(fieldName) {
      return this.getFields().find(function (field) {
        return field.getName() === fieldName;
      });
    }
  }, {
    key: 'getFields',
    value: function getFields() {
      var fields = [];
      this.getSelections().forEach(function (selection) {
        if (selection instanceof RelayQLField) {
          fields.push(selection);
        }
      });
      return fields;
    }
  }, {
    key: 'getSelections',
    value: function getSelections() {
      var _this = this;

      if (!this.ast.selectionSet) {
        return [];
      }
      return this.ast.selectionSet.selections.map(function (selection) {
        if (selection.kind === 'Field') {
          return new RelayQLField(_this.context, selection, _this.getType());
        } else if (selection.kind === 'FragmentSpread') {
          return new RelayQLFragmentSpread(_this.context, selection);
        } else if (selection.kind === 'InlineFragment') {
          return new RelayQLInlineFragment(_this.context, selection, _this.getType());
        } else {
          invariant(false, 'Unexpected selection kind: %s', selection.kind);
        }
      });
    }
  }, {
    key: 'getDirectives',
    value: function getDirectives() {
      var _this2 = this;

      return (this.ast.directives || []).map(function (directive) {
        return new RelayQLDirective(_this2.context, directive);
      });
    }
  }]);

  return RelayQLNode;
})();

var RelayQLDefinition = (function (_RelayQLNode) {
  _inherits(RelayQLDefinition, _RelayQLNode);

  function RelayQLDefinition() {
    _classCallCheck(this, RelayQLDefinition);

    _get(Object.getPrototypeOf(RelayQLDefinition.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RelayQLDefinition, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name ? this.ast.name.value : this.getType().getName({ modifiers: false }); // TODO: this.context.definitionName;
    }
  }]);

  return RelayQLDefinition;
})(RelayQLNode);

var RelayQLFragment = (function (_RelayQLDefinition) {
  _inherits(RelayQLFragment, _RelayQLDefinition);

  function RelayQLFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLFragment);

    _get(Object.getPrototypeOf(RelayQLFragment.prototype), 'constructor', this).call(this, context, ast);
    this.parentType = parentType;
  }

  _createClass(RelayQLFragment, [{
    key: 'getType',
    value: function getType() {
      var type = this.ast.typeCondition;
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
  }]);

  return RelayQLFragment;
})(RelayQLDefinition);

var RelayQLMutation = (function (_RelayQLDefinition2) {
  _inherits(RelayQLMutation, _RelayQLDefinition2);

  function RelayQLMutation() {
    _classCallCheck(this, RelayQLMutation);

    _get(Object.getPrototypeOf(RelayQLMutation.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RelayQLMutation, [{
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.context.schema.getMutationType());
    }
  }]);

  return RelayQLMutation;
})(RelayQLDefinition);

var RelayQLQuery = (function (_RelayQLDefinition3) {
  _inherits(RelayQLQuery, _RelayQLDefinition3);

  function RelayQLQuery() {
    _classCallCheck(this, RelayQLQuery);

    _get(Object.getPrototypeOf(RelayQLQuery.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RelayQLQuery, [{
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.context.schema.getQueryType());
    }
  }]);

  return RelayQLQuery;
})(RelayQLDefinition);

var RelayQLField = (function (_RelayQLNode2) {
  _inherits(RelayQLField, _RelayQLNode2);

  function RelayQLField(context, ast, parentType) {
    _classCallCheck(this, RelayQLField);

    _get(Object.getPrototypeOf(RelayQLField.prototype), 'constructor', this).call(this, context, ast);
    var fieldName = this.ast.name.value;
    var fieldDef = parentType.getFieldDefinition(fieldName);
    invariant(fieldDef, 'You supplied a field named `%s` on type `%s`, but no such field ' + 'exists on that type.', fieldName, parentType.getName({ modifiers: false }));
    this.fieldDef = fieldDef;
  }

  _createClass(RelayQLField, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getAlias',
    value: function getAlias() {
      return this.ast.alias ? this.ast.alias.value : null;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return this.fieldDef.getType();
    }
  }, {
    key: 'hasArgument',
    value: function hasArgument(argName) {
      return this.getArguments().some(function (arg) {
        return arg.getName() === argName;
      });
    }
  }, {
    key: 'getArguments',
    value: function getArguments() {
      var _this3 = this;

      var argTypes = this.fieldDef.getDeclaredArguments();
      return (this.ast.arguments || []).map(function (arg) {
        var argName = arg.name.value;
        var argType = argTypes[argName];
        invariant(argType, 'You supplied an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, _this3.getName());
        return new RelayQLArgument(_this3.context, arg, argType);
      });
    }
  }, {
    key: 'hasDeclaredArgument',
    value: function hasDeclaredArgument(argName) {
      return this.fieldDef.getDeclaredArguments().hasOwnProperty(argName);
    }
  }, {
    key: 'getDeclaredArgument',
    value: function getDeclaredArgument(argName) {
      return this.fieldDef.getArgument(argName);
    }
  }, {
    key: 'getDeclaredArguments',
    value: function getDeclaredArguments() {
      return this.fieldDef.getDeclaredArguments();
    }
  }]);

  return RelayQLField;
})(RelayQLNode);

var RelayQLFragmentSpread = (function (_RelayQLNode3) {
  _inherits(RelayQLFragmentSpread, _RelayQLNode3);

  function RelayQLFragmentSpread() {
    _classCallCheck(this, RelayQLFragmentSpread);

    _get(Object.getPrototypeOf(RelayQLFragmentSpread.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RelayQLFragmentSpread, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getSelections',
    value: function getSelections() {
      invariant(false, 'Cannot get selection of a fragment spread.');
    }
  }]);

  return RelayQLFragmentSpread;
})(RelayQLNode);

var RelayQLInlineFragment = (function (_RelayQLNode4) {
  _inherits(RelayQLInlineFragment, _RelayQLNode4);

  function RelayQLInlineFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLInlineFragment);

    _get(Object.getPrototypeOf(RelayQLInlineFragment.prototype), 'constructor', this).call(this, context, ast);
    this.parentType = parentType;
  }

  _createClass(RelayQLInlineFragment, [{
    key: 'getFragment',
    value: function getFragment() {
      return new RelayQLFragment(this.context, this.ast, this.parentType);
    }
  }]);

  return RelayQLInlineFragment;
})(RelayQLNode);

var RelayQLDirective = (function () {
  function RelayQLDirective(context, ast) {
    var _this4 = this;

    _classCallCheck(this, RelayQLDirective);

    this.ast = ast;
    this.context = context;
    this.argTypes = {};

    var directiveName = ast.name.value;
    var schemaDirective = directiveName === GraphQLRelayDirective.name ? GraphQLRelayDirective : context.schema.getDirective(directiveName);
    invariant(schemaDirective, 'You supplied a directive named `%s`, but no such directive exists.', directiveName);
    schemaDirective.args.forEach(function (schemaArg) {
      _this4.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  _createClass(RelayQLDirective, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getArguments',
    value: function getArguments() {
      var _this5 = this;

      return (this.ast.arguments || []).map(function (arg) {
        var argName = arg.name.value;
        var argType = _this5.argTypes[argName];
        invariant(argType, 'You supplied an argument named `%s` on directive `%s`, but no ' + 'such argument exists on that directive.', argName, _this5.getName());
        return new RelayQLArgument(_this5.context, arg, argType);
      });
    }
  }]);

  return RelayQLDirective;
})();

var RelayQLArgument = (function () {
  function RelayQLArgument(context, ast, type) {
    _classCallCheck(this, RelayQLArgument);

    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  _createClass(RelayQLArgument, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return this.type;
    }
  }, {
    key: 'isVariable',
    value: function isVariable() {
      return this.ast.value.kind === 'Variable';
    }
  }, {
    key: 'getVariableName',
    value: function getVariableName() {
      invariant(this.ast.value.kind === 'Variable', 'Cannot get variable name of an argument value.');
      return this.ast.value.name.value;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      var _this6 = this;

      invariant(!this.isVariable(), 'Cannot get value of an argument variable.');
      var value = this.ast.value;
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
          return value.values.map(function (value) {
            return new RelayQLArgument(_this6.context, _extends({}, _this6.ast, { value: value }), _this6.type.ofType());
          });
      }
      invariant(false, 'Unexpected argument kind: %s', value.kind);
    }
  }]);

  return RelayQLArgument;
})();

var RelayQLType = (function () {
  function RelayQLType(context, schemaModifiedType) {
    _classCallCheck(this, RelayQLType);

    this.context = context;

    var _stripMarkerTypes = stripMarkerTypes(schemaModifiedType);

    var isListType = _stripMarkerTypes.isListType;
    var isNonNullType = _stripMarkerTypes.isNonNullType;
    var schemaUnmodifiedType = _stripMarkerTypes.schemaUnmodifiedType;

    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedType = schemaUnmodifiedType;
    this.schemaModifiedType = schemaModifiedType;
  }

  _createClass(RelayQLType, [{
    key: 'getName',
    value: function getName(_ref) {
      var modifiers = _ref.modifiers;
      return (function () {
        return modifiers ? this.schemaModifiedType.toString() : this.schemaUnmodifiedType.toString();
      }).apply(this, arguments);
    }
  }, {
    key: 'hasField',
    value: function hasField(fieldName) {
      return !!this.getFieldDefinition(fieldName);
    }
  }, {
    key: 'getFieldDefinition',
    value: function getFieldDefinition(fieldName) {
      var type = this.schemaUnmodifiedType;
      var isQueryType = type === this.context.schema.getQueryType();
      var hasTypeName = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType || type instanceof types.GraphQLUnionType;
      var hasFields = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType;

      var schemaFieldDef = undefined;
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
  }, {
    key: 'getInterfaces',
    value: function getInterfaces() {
      var _this7 = this;

      if (this.schemaUnmodifiedType instanceof types.GraphQLObjectType) {
        return this.schemaUnmodifiedType.getInterfaces().map(function (schemaInterface) {
          return new RelayQLType(_this7.context, schemaInterface);
        });
      }
      return [];
    }
  }, {
    key: 'getConcreteTypes',
    value: function getConcreteTypes() {
      var _this8 = this;

      invariant(this.isAbstract(), 'Cannot get concrete types of a concrete type.');
      return this.schemaUnmodifiedType.getPossibleTypes().map(function (concreteType) {
        return new RelayQLType(_this8.context, concreteType);
      });
    }
  }, {
    key: 'getIdentifyingFieldDefinition',
    value: function getIdentifyingFieldDefinition() {
      if (this.alwaysImplements('Node')) {
        return this.getFieldDefinition('id');
      }
      return null;
    }
  }, {
    key: 'isAbstract',
    value: function isAbstract() {
      return types.isAbstractType(this.schemaUnmodifiedType);
    }
  }, {
    key: 'isList',
    value: function isList() {
      return this.isListType;
    }
  }, {
    key: 'isNonNull',
    value: function isNonNull() {
      return this.isNonNullType;
    }
  }, {
    key: 'isScalar',
    value: function isScalar() {
      return this.schemaUnmodifiedType instanceof types.GraphQLScalarType;
    }
  }, {
    key: 'isConnection',
    value: function isConnection() {
      if (!this.getName({ modifiers: false }).endsWith('Connection')) {
        return false;
      }
      var edges = this.getFieldDefinition('edges');
      if (!edges || edges.getType().isScalar()) {
        return false;
      }
      var node = edges.getType().getFieldDefinition('node');
      if (!node || node.getType().isScalar()) {
        return false;
      }
      var cursor = edges.getType().getFieldDefinition('cursor');
      if (!cursor || !cursor.getType().isScalar()) {
        return false;
      }
      return true;
    }
  }, {
    key: 'isConnectionEdge',
    value: function isConnectionEdge() {
      return this.getName({ modifiers: false }).endsWith('Edge') && this.hasField('node') && this.hasField('cursor');
    }
  }, {
    key: 'isConnectionPageInfo',
    value: function isConnectionPageInfo() {
      return this.getName({ modifiers: false }) === 'PageInfo';
    }
  }, {
    key: 'alwaysImplements',
    value: function alwaysImplements(typeName) {
      return this.getName({ modifiers: false }) === typeName || this.getInterfaces().some(function (type) {
        return type.getName({ modifiers: false }) === typeName;
      }) || this.isAbstract() && this.getConcreteTypes().every(function (type) {
        return type.alwaysImplements(typeName);
      });
    }
  }, {
    key: 'generateField',
    value: function generateField(fieldName) {
      var generatedFieldAST = {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: fieldName
        }
      };
      return new RelayQLField(this.context, generatedFieldAST, this);
    }
  }]);

  return RelayQLType;
})();

var RelayQLFieldDefinition = (function () {
  function RelayQLFieldDefinition(context, schemaFieldDef) {
    _classCallCheck(this, RelayQLFieldDefinition);

    this.context = context;
    this.schemaFieldDef = schemaFieldDef;
  }

  _createClass(RelayQLFieldDefinition, [{
    key: 'getName',
    value: function getName() {
      return this.schemaFieldDef.name;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.schemaFieldDef.type);
    }
  }, {
    key: 'hasArgument',
    value: function hasArgument(argName) {
      return this.schemaFieldDef.args.some(function (schemaArg) {
        return schemaArg.name === argName;
      });
    }
  }, {
    key: 'getArgument',
    value: function getArgument(argName) {
      var schemaArg = this.schemaFieldDef.args.find(function (schemaArg) {
        return schemaArg.name === argName;
      });
      invariant(schemaArg, 'You tried to get an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, this.getName());
      return new RelayQLArgumentType(schemaArg.type);
    }
  }, {
    key: 'getDeclaredArguments',
    value: function getDeclaredArguments() {
      var args = {};
      this.schemaFieldDef.args.forEach(function (schemaArg) {
        args[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
      });
      return args;
    }
  }]);

  return RelayQLFieldDefinition;
})();

var RelayQLArgumentType = (function () {
  function RelayQLArgumentType(schemaModifiedArgType) {
    _classCallCheck(this, RelayQLArgumentType);

    var _stripMarkerTypes2 = stripMarkerTypes(schemaModifiedArgType);

    var isListType = _stripMarkerTypes2.isListType;
    var isNonNullType = _stripMarkerTypes2.isNonNullType;
    var schemaUnmodifiedType = _stripMarkerTypes2.schemaUnmodifiedType;

    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedArgType = schemaUnmodifiedType;
    this.schemaModifiedArgType = schemaModifiedArgType;
  }

  _createClass(RelayQLArgumentType, [{
    key: 'getName',
    value: function getName(_ref2) {
      var modifiers = _ref2.modifiers;
      return (function () {
        return modifiers ? this.schemaModifiedArgType.toString() : this.schemaUnmodifiedArgType.toString();
      }).apply(this, arguments);
    }
  }, {
    key: 'ofType',
    value: function ofType() {
      invariant(this.isList() || this.isNonNull(), 'Can only get type of list or non-null type.');
      return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
    }
  }, {
    key: 'isEnum',
    value: function isEnum() {
      return this.schemaUnmodifiedArgType instanceof types.GraphQLEnumType;
    }
  }, {
    key: 'isList',
    value: function isList() {
      return this.isListType;
    }
  }, {
    key: 'isNonNull',
    value: function isNonNull() {
      return this.isNonNullType;
    }
  }, {
    key: 'isObject',
    value: function isObject() {
      return this.schemaUnmodifiedArgType instanceof types.GraphQLInputObjectType;
    }
  }, {
    key: 'isScalar',
    value: function isScalar() {
      return this.schemaUnmodifiedArgType instanceof types.GraphQLScalarType;
    }
  }]);

  return RelayQLArgumentType;
})();

function stripMarkerTypes(schemaModifiedType) {
  var isListType = false;
  var isNonNullType = false;
  var schemaUnmodifiedType = schemaModifiedType;
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
  return { isListType: isListType, isNonNullType: isNonNullType, schemaUnmodifiedType: schemaUnmodifiedType };
}

module.exports = {
  RelayQLArgument: RelayQLArgument,
  RelayQLArgumentType: RelayQLArgumentType,
  RelayQLDefinition: RelayQLDefinition,
  RelayQLDirective: RelayQLDirective,
  RelayQLField: RelayQLField,
  RelayQLFieldDefinition: RelayQLFieldDefinition,
  RelayQLFragment: RelayQLFragment,
  RelayQLFragmentSpread: RelayQLFragmentSpread,
  RelayQLInlineFragment: RelayQLInlineFragment,
  RelayQLMutation: RelayQLMutation,
  RelayQLNode: RelayQLNode,
  RelayQLQuery: RelayQLQuery,
  RelayQLType: RelayQLType
};
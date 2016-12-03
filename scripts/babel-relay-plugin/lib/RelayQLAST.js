// @generated
/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GraphQLRelayDirective = require('./GraphQLRelayDirective');
var RelayTransformError = require('./RelayTransformError');

var find = require('./find');
var invariant = require('./invariant');
var util = require('util');

var _require = require('./GraphQL'),
    types = _require.type,
    GraphQLDirective = _require.type_directives.GraphQLDirective,
    _require$type_scalars = _require.type_scalars,
    GraphQLBoolean = _require$type_scalars.GraphQLBoolean,
    GraphQLFloat = _require$type_scalars.GraphQLFloat,
    GraphQLID = _require$type_scalars.GraphQLID,
    GraphQLInt = _require$type_scalars.GraphQLInt,
    GraphQLString = _require$type_scalars.GraphQLString,
    _require$type_introsp = _require.type_introspection,
    SchemaMetaFieldDef = _require$type_introsp.SchemaMetaFieldDef,
    TypeMetaFieldDef = _require$type_introsp.TypeMetaFieldDef,
    TypeNameMetaFieldDef = _require$type_introsp.TypeNameMetaFieldDef;

var _require2 = require('./RelayQLNodeInterface'),
    ID = _require2.ID;

var GraphQLRelayDirectiveInstance = new GraphQLDirective(GraphQLRelayDirective);

// TODO: Import types from `graphql`.

var RelayQLNode = function () {
  function RelayQLNode(context, ast) {
    _classCallCheck(this, RelayQLNode);

    this.ast = ast;
    this.context = context;
  }

  _createClass(RelayQLNode, [{
    key: 'getLocation',
    value: function getLocation() {
      return this.ast.loc;
    }
  }, {
    key: 'getType',
    value: function getType() {
      invariant(false, 'Missing Implementation');
    }
  }, {
    key: 'getField',
    value: function getField(fieldName) {
      return find(this.getFields(), function (field) {
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
      // $FlowFixMe
      return this.ast.selectionSet.selections.map(function (selection) {
        if (selection.kind === 'Field') {
          return new RelayQLField(_this.context, selection, _this.getType());
        } else if (selection.kind === 'FragmentSpread') {
          return new RelayQLFragmentSpread(_this.context, selection);
        } else if (selection.kind === 'InlineFragment') {
          return new RelayQLInlineFragment(_this.context, selection, _this.getType());
        } else {
          throw new RelayTransformError(util.format('Unexpected selection kind: %s', selection.kind), _this.getLocation());
        }
      });
    }
  }, {
    key: 'getDirectives',
    value: function getDirectives() {
      var _this2 = this;

      // $FlowFixMe
      return (this.ast.directives || []).map(function (directive) {
        return new RelayQLDirective(_this2.context, directive);
      });
    }
  }, {
    key: 'hasDirective',
    value: function hasDirective(name) {
      // $FlowFixMe
      return (this.ast.directives || []).some(function (d) {
        return d.name.value === name;
      });
    }
  }, {
    key: 'isPattern',
    value: function isPattern() {
      return this.context.isPattern;
    }
  }]);

  return RelayQLNode;
}();

var RelayQLDefinition = function (_RelayQLNode) {
  _inherits(RelayQLDefinition, _RelayQLNode);

  function RelayQLDefinition() {
    _classCallCheck(this, RelayQLDefinition);

    return _possibleConstructorReturn(this, (RelayQLDefinition.__proto__ || Object.getPrototypeOf(RelayQLDefinition)).apply(this, arguments));
  }

  _createClass(RelayQLDefinition, [{
    key: 'getName',
    value: function getName() {
      // TODO: this.context.definitionName;
      return this.ast.name ?
      // $FlowFixMe
      this.ast.name.value : this.getType().getName({ modifiers: false });
    }
  }]);

  return RelayQLDefinition;
}(RelayQLNode);

var RelayQLFragment = function (_RelayQLDefinition) {
  _inherits(RelayQLFragment, _RelayQLDefinition);

  function RelayQLFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLFragment);

    var relayDirectiveArgs = {};
    var relayDirective = find(ast.directives || [], function (directive) {
      return directive.name.value === 'relay';
    });
    if (relayDirective) {
      (relayDirective.arguments || []).forEach(function (arg) {
        relayDirectiveArgs[arg.name.value] = arg.value;
      });
    }

    // @relay(pattern: true)
    var isPattern = relayDirectiveArgs.pattern && relayDirectiveArgs.pattern.kind === 'BooleanValue' && relayDirectiveArgs.pattern.value;

    // @relay(isStaticFragment: true)
    var isStaticFragment = relayDirectiveArgs.isStaticFragment && relayDirectiveArgs.isStaticFragment.kind === 'BooleanValue' && relayDirectiveArgs.isStaticFragment.value;

    var _this4 = _possibleConstructorReturn(this, (RelayQLFragment.__proto__ || Object.getPrototypeOf(RelayQLFragment)).call(this, _extends({}, context, { isPattern: isPattern }), ast));

    _this4.hasStaticFragmentID = isStaticFragment;
    _this4.parentType = parentType;
    _this4.staticFragmentID = null;
    return _this4;
  }

  _createClass(RelayQLFragment, [{
    key: 'getStaticFragmentID',
    value: function getStaticFragmentID() {
      if (this.hasStaticFragmentID && this.staticFragmentID == null) {
        var suffix = this.context.generateID();
        var _name = this.getName();
        if (!_name) {
          throw new RelayTransformError(util.format('Static fragments require a name. Use `fragment NAME on %s { ... }`.', this.getType().getName({ modifiers: true })), this.getLocation());
        }
        this.staticFragmentID = _name + ':' + suffix;
      }
      return this.staticFragmentID;
    }
  }, {
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
        if (!this.parentType) {
          throw new RelayTransformError('Cannot get type of typeless inline fragment without parent type.', this.getLocation());
        }
        return this.parentType;
      } else {
        throw new RelayTransformError(util.format('Unexpected fragment kind: %s', this.ast.kind), this.getLocation());
      }
    }
  }]);

  return RelayQLFragment;
}(RelayQLDefinition);

var RelayQLMutation = function (_RelayQLDefinition2) {
  _inherits(RelayQLMutation, _RelayQLDefinition2);

  function RelayQLMutation() {
    _classCallCheck(this, RelayQLMutation);

    return _possibleConstructorReturn(this, (RelayQLMutation.__proto__ || Object.getPrototypeOf(RelayQLMutation)).apply(this, arguments));
  }

  _createClass(RelayQLMutation, [{
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.context.schema.getMutationType());
    }
  }]);

  return RelayQLMutation;
}(RelayQLDefinition);

var RelayQLQuery = function (_RelayQLDefinition3) {
  _inherits(RelayQLQuery, _RelayQLDefinition3);

  function RelayQLQuery() {
    _classCallCheck(this, RelayQLQuery);

    return _possibleConstructorReturn(this, (RelayQLQuery.__proto__ || Object.getPrototypeOf(RelayQLQuery)).apply(this, arguments));
  }

  _createClass(RelayQLQuery, [{
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.context.schema.getQueryType());
    }
  }]);

  return RelayQLQuery;
}(RelayQLDefinition);

var RelayQLSubscription = function (_RelayQLDefinition4) {
  _inherits(RelayQLSubscription, _RelayQLDefinition4);

  function RelayQLSubscription() {
    _classCallCheck(this, RelayQLSubscription);

    return _possibleConstructorReturn(this, (RelayQLSubscription.__proto__ || Object.getPrototypeOf(RelayQLSubscription)).apply(this, arguments));
  }

  _createClass(RelayQLSubscription, [{
    key: 'getType',
    value: function getType() {
      return new RelayQLType(this.context, this.context.schema.getSubscriptionType());
    }
  }]);

  return RelayQLSubscription;
}(RelayQLDefinition);

var RelayQLField = function (_RelayQLNode2) {
  _inherits(RelayQLField, _RelayQLNode2);

  function RelayQLField(context, ast, parentType) {
    _classCallCheck(this, RelayQLField);

    var _this8 = _possibleConstructorReturn(this, (RelayQLField.__proto__ || Object.getPrototypeOf(RelayQLField)).call(this, context, ast));

    var fieldName = _this8.ast.name.value;
    var fieldDef = parentType.getFieldDefinition(fieldName, ast);
    if (!fieldDef) {
      throw new RelayTransformError(util.format('You supplied a field named `%s` on type `%s`, but no such field ' + 'exists on that type.', fieldName, parentType.getName({ modifiers: false })), _this8.getLocation());
    }
    _this8.fieldDef = fieldDef;
    return _this8;
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
    key: 'findArgument',
    value: function findArgument(argName) {
      return find(this.getArguments(), function (arg) {
        return arg.getName() === argName;
      });
    }
  }, {
    key: 'getArguments',
    value: function getArguments() {
      var _this9 = this;

      var argTypes = this.fieldDef.getDeclaredArguments();
      return (this.ast.arguments || []).map(function (arg) {
        var argName = arg.name.value;
        var argType = argTypes[argName];
        if (!argType) {
          throw new RelayTransformError(util.format('You supplied an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, _this9.getName()), _this9.getLocation());
        }
        return new RelayQLArgument(_this9.context, arg, argType);
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
}(RelayQLNode);

var RelayQLFragmentSpread = function (_RelayQLNode3) {
  _inherits(RelayQLFragmentSpread, _RelayQLNode3);

  function RelayQLFragmentSpread() {
    _classCallCheck(this, RelayQLFragmentSpread);

    return _possibleConstructorReturn(this, (RelayQLFragmentSpread.__proto__ || Object.getPrototypeOf(RelayQLFragmentSpread)).apply(this, arguments));
  }

  _createClass(RelayQLFragmentSpread, [{
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getSelections',
    value: function getSelections() {
      throw new RelayTransformError('Cannot get selection of a fragment spread.', this.getLocation());
    }
  }]);

  return RelayQLFragmentSpread;
}(RelayQLNode);

var RelayQLInlineFragment = function (_RelayQLNode4) {
  _inherits(RelayQLInlineFragment, _RelayQLNode4);

  function RelayQLInlineFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLInlineFragment);

    var _this11 = _possibleConstructorReturn(this, (RelayQLInlineFragment.__proto__ || Object.getPrototypeOf(RelayQLInlineFragment)).call(this, context, ast));

    _this11.parentType = parentType;
    return _this11;
  }

  _createClass(RelayQLInlineFragment, [{
    key: 'getFragment',
    value: function getFragment() {
      return new RelayQLFragment(this.context, this.ast, this.parentType);
    }
  }]);

  return RelayQLInlineFragment;
}(RelayQLNode);

var RelayQLDirective = function () {
  function RelayQLDirective(context, ast) {
    var _this12 = this;

    _classCallCheck(this, RelayQLDirective);

    this.ast = ast;
    this.context = context;
    this.argTypes = {};

    var directiveName = ast.name.value;
    var schemaDirective = directiveName === GraphQLRelayDirective.name ? GraphQLRelayDirectiveInstance : context.schema.getDirective(directiveName);
    if (!schemaDirective) {
      throw new RelayTransformError(util.format('You supplied a directive named `%s`, but no such directive exists.', directiveName), this.getLocation());
    }
    schemaDirective.args.forEach(function (schemaArg) {
      _this12.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  _createClass(RelayQLDirective, [{
    key: 'getLocation',
    value: function getLocation() {
      return this.ast.loc;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.ast.name.value;
    }
  }, {
    key: 'getArguments',
    value: function getArguments() {
      var _this13 = this;

      return (this.ast.arguments || []).map(function (arg) {
        var argName = arg.name.value;
        var argType = _this13.argTypes[argName];
        if (!argType) {
          throw new RelayTransformError(util.format('You supplied an argument named `%s` on directive `%s`, but no ' + 'such argument exists on that directive.', argName, _this13.getName()), _this13.getLocation());
        }
        return new RelayQLArgument(_this13.context, arg, argType);
      });
    }
  }]);

  return RelayQLDirective;
}();

var RelayQLArgument = function () {
  function RelayQLArgument(context, ast, type) {
    _classCallCheck(this, RelayQLArgument);

    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  _createClass(RelayQLArgument, [{
    key: 'getLocation',
    value: function getLocation() {
      return this.ast.loc;
    }
  }, {
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
      if (this.ast.value.kind !== 'Variable') {
        throw new RelayTransformError('Cannot get variable name of an argument value.', this.getLocation());
      }
      return this.ast.value.name.value;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      var _this14 = this;

      if (this.isVariable()) {
        throw new RelayTransformError('Cannot get value of an argument variable.', this.getLocation());
      }

      var value = this.ast.value;
      if (value.kind === 'ListValue') {
        return value.values.map(function (value) {
          return new RelayQLArgument(_this14.context, _extends({}, _this14.ast, { value: value }), _this14.type.ofType());
        });
      } else {
        return getLiteralValue(value);
      }
    }
  }]);

  return RelayQLArgument;
}();

var RelayQLType = function () {
  function RelayQLType(context, schemaModifiedType) {
    _classCallCheck(this, RelayQLType);

    this.context = context;

    var _stripMarkerTypes = stripMarkerTypes(schemaModifiedType),
        isListType = _stripMarkerTypes.isListType,
        isNonNullType = _stripMarkerTypes.isNonNullType,
        schemaUnmodifiedType = _stripMarkerTypes.schemaUnmodifiedType;

    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedType = schemaUnmodifiedType;
    this.schemaModifiedType = schemaModifiedType;
  }

  _createClass(RelayQLType, [{
    key: 'canHaveSubselections',
    value: function canHaveSubselections() {
      return !(this.schemaUnmodifiedType instanceof types.GraphQLScalarType || this.schemaUnmodifiedType instanceof types.GraphQLEnumType);
    }
  }, {
    key: 'getName',
    value: function getName(_ref) {
      var modifiers = _ref.modifiers;

      return modifiers ? this.schemaModifiedType.toString() : this.schemaUnmodifiedType.toString();
    }
  }, {
    key: 'hasField',
    value: function hasField(fieldName) {
      return !!this.getFieldDefinition(fieldName);
    }
  }, {
    key: 'getFieldDefinition',
    value: function getFieldDefinition(fieldName, fieldAST) {
      var type = this.schemaUnmodifiedType;
      var isQueryType = type === this.context.schema.getQueryType();
      var hasTypeName = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType || type instanceof types.GraphQLUnionType;
      var hasFields = type instanceof types.GraphQLObjectType || type instanceof types.GraphQLInterfaceType;

      var schemaFieldDef = void 0;
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
            args: []
          };
        } else if (types.isAbstractType(type) && fieldAST && fieldAST.directives && fieldAST.directives.some(function (directive) {
          return directive.name.value === 'fixme_fat_interface';
        })) {
          var possibleTypes = this.context.schema.getPossibleTypes(type);

          var _loop = function _loop(ii) {
            var possibleField = possibleTypes[ii].getFields()[fieldName];
            if (possibleField) {
              // Fat interface fields can have differing arguments. Try to return
              // a field with matching arguments, but still return a field if the
              // arguments do not match.
              schemaFieldDef = possibleField;
              if (fieldAST && fieldAST.arguments) {
                var argumentsAllExist = fieldAST.arguments.every(function (argument) {
                  return find(possibleField.args, function (argDef) {
                    return argDef.name === argument.name.value;
                  });
                });
                if (argumentsAllExist) {
                  return 'break';
                }
              }
            }
          };

          for (var ii = 0; ii < possibleTypes.length; ii++) {
            var _ret = _loop(ii);

            if (_ret === 'break') break;
          }
        }
      }

      return schemaFieldDef ? new RelayQLFieldDefinition(this.context, schemaFieldDef) : null;
    }
  }, {
    key: 'getInterfaces',
    value: function getInterfaces() {
      var _this15 = this;

      if (this.schemaUnmodifiedType instanceof types.GraphQLObjectType) {
        return this.schemaUnmodifiedType.getInterfaces().map(function (schemaInterface) {
          return new RelayQLType(_this15.context, schemaInterface);
        });
      }
      return [];
    }
  }, {
    key: 'getConcreteTypes',
    value: function getConcreteTypes() {
      var _this16 = this;

      invariant(this.isAbstract(), 'Cannot get concrete types of a concrete type.');
      return this.context.schema.getPossibleTypes(this.schemaUnmodifiedType).map(function (concreteType) {
        return new RelayQLType(_this16.context, concreteType);
      });
    }
  }, {
    key: 'getIdentifyingFieldDefinition',
    value: function getIdentifyingFieldDefinition() {
      if (this.alwaysImplements('Node')) {
        return this.getFieldDefinition(ID);
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
    key: 'isConnection',
    value: function isConnection() {
      if (!/Connection$/.test(this.getName({ modifiers: false }))) {
        return false;
      }
      var edges = this.getFieldDefinition('edges');
      if (!edges || !edges.getType().canHaveSubselections()) {
        return false;
      }
      var node = edges.getType().getFieldDefinition('node');
      if (!node || !node.getType().canHaveSubselections()) {
        return false;
      }
      var cursor = edges.getType().getFieldDefinition('cursor');
      if (!cursor || cursor.getType().canHaveSubselections()) {
        return false;
      }
      return true;
    }
  }, {
    key: 'isConnectionEdge',
    value: function isConnectionEdge() {
      return (/Edge$/.test(this.getName({ modifiers: false })) && this.hasField('node') && this.hasField('cursor')
      );
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
    key: 'mayImplement',
    value: function mayImplement(typeName) {
      return this.getName({ modifiers: false }) === typeName || this.getInterfaces().some(function (type) {
        return type.getName({ modifiers: false }) === typeName;
      }) || this.isAbstract() && this.getConcreteTypes().some(function (type) {
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
  }, {
    key: 'generateIdFragment',
    value: function generateIdFragment() {
      var generatedFragmentAST = {
        kind: 'Fragment',
        name: {
          kind: 'Name',
          value: 'IdFragment'
        },
        typeCondition: {
          kind: 'NamedType',
          name: {
            value: 'Node'
          }
        }
      };
      return new RelayQLFragment(this.context, generatedFragmentAST, this);
    }
  }]);

  return RelayQLType;
}();

var RelayQLFieldDefinition = function () {
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
      var schemaArg = find(this.schemaFieldDef.args, function (schemaArg) {
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
}();

var RelayQLArgumentType = function () {
  function RelayQLArgumentType(schemaModifiedArgType) {
    _classCallCheck(this, RelayQLArgumentType);

    var _stripMarkerTypes2 = stripMarkerTypes(schemaModifiedArgType),
        isListType = _stripMarkerTypes2.isListType,
        isNonNullType = _stripMarkerTypes2.isNonNullType,
        schemaUnmodifiedType = _stripMarkerTypes2.schemaUnmodifiedType;

    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedArgType = schemaUnmodifiedType;
    this.schemaModifiedArgType = schemaModifiedArgType;
  }

  _createClass(RelayQLArgumentType, [{
    key: 'getName',
    value: function getName(_ref2) {
      var modifiers = _ref2.modifiers;

      return modifiers ? this.schemaModifiedArgType.toString() : this.schemaUnmodifiedArgType.toString();
    }
  }, {
    key: 'ofType',
    value: function ofType() {
      invariant(this.isList() || this.isNonNull(), 'Can only get type of list or non-null type.');
      return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
    }
  }, {
    key: 'isCustomScalar',
    value: function isCustomScalar() {
      return this.isScalar() && !(this.schemaUnmodifiedArgType === GraphQLBoolean || this.schemaUnmodifiedArgType === GraphQLFloat || this.schemaUnmodifiedArgType === GraphQLID || this.schemaUnmodifiedArgType === GraphQLInt || this.schemaUnmodifiedArgType === GraphQLString);
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
}();

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

function getLiteralValue(value) {
  var _ret2 = function () {
    switch (value.kind) {
      case 'IntValue':
        return {
          v: parseInt(value.value, 10)
        };
      case 'FloatValue':
        return {
          v: parseFloat(value.value)
        };
      case 'StringValue':
      case 'BooleanValue':
      case 'EnumValue':
        return {
          v: value.value
        };
      case 'ListValue':
        return {
          v: value.values.map(getLiteralValue)
        };
      case 'NullValue':
        return {
          v: null
        };
      case 'ObjectValue':
        var object = {};
        value.fields.forEach(function (field) {
          object[field.name.value] = getLiteralValue(field.value);
        });
        return {
          v: object
        };
      case 'Variable':
        throw new RelayTransformError(util.format('Unexpected nested variable `%s`; variables are supported as top-' + 'level arguments - `node(id: $id)` - or directly within lists - ' + '`nodes(ids: [$id])`.', value.name.value), value.loc);
      default:
        throw new RelayTransformError(util.format('Unexpected value kind: %s', value.kind), value.loc);
    }
  }();

  if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
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
  RelayQLSubscription: RelayQLSubscription,
  RelayQLType: RelayQLType
};
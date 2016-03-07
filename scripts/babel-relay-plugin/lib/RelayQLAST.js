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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./GraphQL');

var types = _require.type;
var _require$type_introsp = _require.type_introspection;
var SchemaMetaFieldDef = _require$type_introsp.SchemaMetaFieldDef;
var TypeMetaFieldDef = _require$type_introsp.TypeMetaFieldDef;
var TypeNameMetaFieldDef = _require$type_introsp.TypeNameMetaFieldDef;

var GraphQLRelayDirective = require('./GraphQLRelayDirective');

var find = require('./find');
var invariant = require('./invariant');

// TODO: Import types from `graphql`.


var RelayQLNode = function () {
  function RelayQLNode(context, ast) {
    _classCallCheck(this, RelayQLNode);

    this.ast = ast;
    this.context = context;
  }

  RelayQLNode.prototype.getType = function getType() {
    invariant(false, 'Missing Implementation');
  };

  RelayQLNode.prototype.getField = function getField(fieldName) {
    return find(this.getFields(), function (field) {
      return field.getName() === fieldName;
    });
  };

  RelayQLNode.prototype.getFields = function getFields() {
    var fields = [];
    this.getSelections().forEach(function (selection) {
      if (selection instanceof RelayQLField) {
        fields.push(selection);
      }
    });
    return fields;
  };

  RelayQLNode.prototype.getSelections = function getSelections() {
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
  };

  RelayQLNode.prototype.getDirectives = function getDirectives() {
    var _this2 = this;

    return (this.ast.directives || []).map(function (directive) {
      return new RelayQLDirective(_this2.context, directive);
    });
  };

  RelayQLNode.prototype.hasDirective = function hasDirective(name) {
    return (this.ast.directives || []).some(function (d) {
      return d.name.value === name;
    });
  };

  RelayQLNode.prototype.isPattern = function isPattern() {
    return this.context.isPattern;
  };

  return RelayQLNode;
}();

var RelayQLDefinition = function (_RelayQLNode) {
  _inherits(RelayQLDefinition, _RelayQLNode);

  function RelayQLDefinition() {
    _classCallCheck(this, RelayQLDefinition);

    return _possibleConstructorReturn(this, _RelayQLNode.apply(this, arguments));
  }

  RelayQLDefinition.prototype.getName = function getName() {
    return this.ast.name ? this.ast.name.value : this.getType().getName({ modifiers: false }); // TODO: this.context.definitionName;
  };

  return RelayQLDefinition;
}(RelayQLNode);

var RelayQLFragment = function (_RelayQLDefinition) {
  _inherits(RelayQLFragment, _RelayQLDefinition);

  function RelayQLFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLFragment);

    var relayDirectiveArgs = {};
    var relayDirective = (ast.directives || []).find(function (directive) {
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

    var _this4 = _possibleConstructorReturn(this, _RelayQLDefinition.call(this, _extends({}, context, { isPattern: isPattern }), ast));

    _this4.hasStaticFragmentID = isStaticFragment;
    _this4.parentType = parentType;
    _this4.staticFragmentID = null;
    return _this4;
  }

  RelayQLFragment.prototype.getStaticFragmentID = function getStaticFragmentID() {
    if (this.hasStaticFragmentID && this.staticFragmentID == null) {
      var suffix = this.context.generateID();
      // The fragmentLocationID is the same for all inline/nested fragments
      // within each Relay.QL tagged template expression; the auto-incrementing
      // suffix distinguishes these fragments from each other.
      this.staticFragmentID = this.context.fragmentLocationID + ':' + suffix;
    }
    return this.staticFragmentID;
  };

  RelayQLFragment.prototype.getType = function getType() {
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
  };

  return RelayQLFragment;
}(RelayQLDefinition);

var RelayQLMutation = function (_RelayQLDefinition2) {
  _inherits(RelayQLMutation, _RelayQLDefinition2);

  function RelayQLMutation() {
    _classCallCheck(this, RelayQLMutation);

    return _possibleConstructorReturn(this, _RelayQLDefinition2.apply(this, arguments));
  }

  RelayQLMutation.prototype.getType = function getType() {
    return new RelayQLType(this.context, this.context.schema.getMutationType());
  };

  return RelayQLMutation;
}(RelayQLDefinition);

var RelayQLQuery = function (_RelayQLDefinition3) {
  _inherits(RelayQLQuery, _RelayQLDefinition3);

  function RelayQLQuery() {
    _classCallCheck(this, RelayQLQuery);

    return _possibleConstructorReturn(this, _RelayQLDefinition3.apply(this, arguments));
  }

  RelayQLQuery.prototype.getType = function getType() {
    return new RelayQLType(this.context, this.context.schema.getQueryType());
  };

  return RelayQLQuery;
}(RelayQLDefinition);

var RelayQLSubscription = function (_RelayQLDefinition4) {
  _inherits(RelayQLSubscription, _RelayQLDefinition4);

  function RelayQLSubscription() {
    _classCallCheck(this, RelayQLSubscription);

    return _possibleConstructorReturn(this, _RelayQLDefinition4.apply(this, arguments));
  }

  RelayQLSubscription.prototype.getType = function getType() {
    return new RelayQLType(this.context, this.context.schema.getSubscriptionType());
  };

  return RelayQLSubscription;
}(RelayQLDefinition);

var RelayQLField = function (_RelayQLNode2) {
  _inherits(RelayQLField, _RelayQLNode2);

  function RelayQLField(context, ast, parentType) {
    _classCallCheck(this, RelayQLField);

    var _this8 = _possibleConstructorReturn(this, _RelayQLNode2.call(this, context, ast));

    var fieldName = _this8.ast.name.value;
    var fieldDef = parentType.getFieldDefinition(fieldName, ast);
    invariant(fieldDef, 'You supplied a field named `%s` on type `%s`, but no such field ' + 'exists on that type.', fieldName, parentType.getName({ modifiers: false }));
    _this8.fieldDef = fieldDef;
    return _this8;
  }

  RelayQLField.prototype.getName = function getName() {
    return this.ast.name.value;
  };

  RelayQLField.prototype.getAlias = function getAlias() {
    return this.ast.alias ? this.ast.alias.value : null;
  };

  RelayQLField.prototype.getType = function getType() {
    return this.fieldDef.getType();
  };

  RelayQLField.prototype.hasArgument = function hasArgument(argName) {
    return this.getArguments().some(function (arg) {
      return arg.getName() === argName;
    });
  };

  RelayQLField.prototype.getArguments = function getArguments() {
    var _this9 = this;

    var argTypes = this.fieldDef.getDeclaredArguments();
    return (this.ast.arguments || []).map(function (arg) {
      var argName = arg.name.value;
      var argType = argTypes[argName];
      invariant(argType, 'You supplied an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, _this9.getName());
      return new RelayQLArgument(_this9.context, arg, argType);
    });
  };

  RelayQLField.prototype.hasDeclaredArgument = function hasDeclaredArgument(argName) {
    return this.fieldDef.getDeclaredArguments().hasOwnProperty(argName);
  };

  RelayQLField.prototype.getDeclaredArgument = function getDeclaredArgument(argName) {
    return this.fieldDef.getArgument(argName);
  };

  RelayQLField.prototype.getDeclaredArguments = function getDeclaredArguments() {
    return this.fieldDef.getDeclaredArguments();
  };

  return RelayQLField;
}(RelayQLNode);

var RelayQLFragmentSpread = function (_RelayQLNode3) {
  _inherits(RelayQLFragmentSpread, _RelayQLNode3);

  function RelayQLFragmentSpread() {
    _classCallCheck(this, RelayQLFragmentSpread);

    return _possibleConstructorReturn(this, _RelayQLNode3.apply(this, arguments));
  }

  RelayQLFragmentSpread.prototype.getName = function getName() {
    return this.ast.name.value;
  };

  RelayQLFragmentSpread.prototype.getSelections = function getSelections() {
    invariant(false, 'Cannot get selection of a fragment spread.');
  };

  return RelayQLFragmentSpread;
}(RelayQLNode);

var RelayQLInlineFragment = function (_RelayQLNode4) {
  _inherits(RelayQLInlineFragment, _RelayQLNode4);

  function RelayQLInlineFragment(context, ast, parentType) {
    _classCallCheck(this, RelayQLInlineFragment);

    var _this11 = _possibleConstructorReturn(this, _RelayQLNode4.call(this, context, ast));

    _this11.parentType = parentType;
    return _this11;
  }

  RelayQLInlineFragment.prototype.getFragment = function getFragment() {
    return new RelayQLFragment(this.context, this.ast, this.parentType);
  };

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
    var schemaDirective = directiveName === GraphQLRelayDirective.name ? GraphQLRelayDirective : context.schema.getDirective(directiveName);
    invariant(schemaDirective, 'You supplied a directive named `%s`, but no such directive exists.', directiveName);
    schemaDirective.args.forEach(function (schemaArg) {
      _this12.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  RelayQLDirective.prototype.getName = function getName() {
    return this.ast.name.value;
  };

  RelayQLDirective.prototype.getArguments = function getArguments() {
    var _this13 = this;

    return (this.ast.arguments || []).map(function (arg) {
      var argName = arg.name.value;
      var argType = _this13.argTypes[argName];
      invariant(argType, 'You supplied an argument named `%s` on directive `%s`, but no ' + 'such argument exists on that directive.', argName, _this13.getName());
      return new RelayQLArgument(_this13.context, arg, argType);
    });
  };

  return RelayQLDirective;
}();

var RelayQLArgument = function () {
  function RelayQLArgument(context, ast, type) {
    _classCallCheck(this, RelayQLArgument);

    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  RelayQLArgument.prototype.getName = function getName() {
    return this.ast.name.value;
  };

  RelayQLArgument.prototype.getType = function getType() {
    return this.type;
  };

  RelayQLArgument.prototype.isVariable = function isVariable() {
    return this.ast.value.kind === 'Variable';
  };

  RelayQLArgument.prototype.getVariableName = function getVariableName() {
    invariant(this.ast.value.kind === 'Variable', 'Cannot get variable name of an argument value.');
    return this.ast.value.name.value;
  };

  RelayQLArgument.prototype.getValue = function getValue() {
    var _this14 = this;

    invariant(!this.isVariable(), 'Cannot get value of an argument variable.');
    var value = this.ast.value;
    if (value.kind === 'ListValue') {
      return value.values.map(function (value) {
        return new RelayQLArgument(_this14.context, _extends({}, _this14.ast, { value: value }), _this14.type.ofType());
      });
    } else {
      return getLiteralValue(value);
    }
  };

  return RelayQLArgument;
}();

var RelayQLType = function () {
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

  RelayQLType.prototype.canHaveSubselections = function canHaveSubselections() {
    return !(this.schemaUnmodifiedType instanceof types.GraphQLScalarType || this.schemaUnmodifiedType instanceof types.GraphQLEnumType);
  };

  RelayQLType.prototype.getName = function getName(_ref) {
    var modifiers = _ref.modifiers;

    return modifiers ? this.schemaModifiedType.toString() : this.schemaUnmodifiedType.toString();
  };

  RelayQLType.prototype.hasField = function hasField(fieldName) {
    return !!this.getFieldDefinition(fieldName);
  };

  RelayQLType.prototype.getFieldDefinition = function getFieldDefinition(fieldName, fieldAST) {
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
        var possibleTypes = type.getPossibleTypes();

        var _loop = function (ii) {
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
  };

  RelayQLType.prototype.getInterfaces = function getInterfaces() {
    var _this15 = this;

    if (this.schemaUnmodifiedType instanceof types.GraphQLObjectType) {
      return this.schemaUnmodifiedType.getInterfaces().map(function (schemaInterface) {
        return new RelayQLType(_this15.context, schemaInterface);
      });
    }
    return [];
  };

  RelayQLType.prototype.getConcreteTypes = function getConcreteTypes() {
    var _this16 = this;

    invariant(this.isAbstract(), 'Cannot get concrete types of a concrete type.');
    return this.schemaUnmodifiedType.getPossibleTypes().map(function (concreteType) {
      return new RelayQLType(_this16.context, concreteType);
    });
  };

  RelayQLType.prototype.getIdentifyingFieldDefinition = function getIdentifyingFieldDefinition() {
    if (this.alwaysImplements('Node')) {
      return this.getFieldDefinition('id');
    }
    return null;
  };

  RelayQLType.prototype.isAbstract = function isAbstract() {
    return types.isAbstractType(this.schemaUnmodifiedType);
  };

  RelayQLType.prototype.isList = function isList() {
    return this.isListType;
  };

  RelayQLType.prototype.isNonNull = function isNonNull() {
    return this.isNonNullType;
  };

  RelayQLType.prototype.isConnection = function isConnection() {
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
  };

  RelayQLType.prototype.isConnectionEdge = function isConnectionEdge() {
    return (/Edge$/.test(this.getName({ modifiers: false })) && this.hasField('node') && this.hasField('cursor')
    );
  };

  RelayQLType.prototype.isConnectionPageInfo = function isConnectionPageInfo() {
    return this.getName({ modifiers: false }) === 'PageInfo';
  };

  RelayQLType.prototype.alwaysImplements = function alwaysImplements(typeName) {
    return this.getName({ modifiers: false }) === typeName || this.getInterfaces().some(function (type) {
      return type.getName({ modifiers: false }) === typeName;
    }) || this.isAbstract() && this.getConcreteTypes().every(function (type) {
      return type.alwaysImplements(typeName);
    });
  };

  RelayQLType.prototype.mayImplement = function mayImplement(typeName) {
    return this.getName({ modifiers: false }) === typeName || this.getInterfaces().some(function (type) {
      return type.getName({ modifiers: false }) === typeName;
    }) || this.isAbstract() && this.getConcreteTypes().some(function (type) {
      return type.alwaysImplements(typeName);
    });
  };

  RelayQLType.prototype.generateField = function generateField(fieldName) {
    var generatedFieldAST = {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: fieldName
      }
    };
    return new RelayQLField(this.context, generatedFieldAST, this);
  };

  RelayQLType.prototype.generateIdFragment = function generateIdFragment() {
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
      },
      selectionSet: {
        selections: [{
          kind: 'Field',
          name: {
            name: 'Name',
            value: 'id'
          }
        }]
      }
    };
    return new RelayQLFragment(this.context, generatedFragmentAST, this);
  };

  return RelayQLType;
}();

var RelayQLFieldDefinition = function () {
  function RelayQLFieldDefinition(context, schemaFieldDef) {
    _classCallCheck(this, RelayQLFieldDefinition);

    this.context = context;
    this.schemaFieldDef = schemaFieldDef;
  }

  RelayQLFieldDefinition.prototype.getName = function getName() {
    return this.schemaFieldDef.name;
  };

  RelayQLFieldDefinition.prototype.getType = function getType() {
    return new RelayQLType(this.context, this.schemaFieldDef.type);
  };

  RelayQLFieldDefinition.prototype.hasArgument = function hasArgument(argName) {
    return this.schemaFieldDef.args.some(function (schemaArg) {
      return schemaArg.name === argName;
    });
  };

  RelayQLFieldDefinition.prototype.getArgument = function getArgument(argName) {
    var schemaArg = find(this.schemaFieldDef.args, function (schemaArg) {
      return schemaArg.name === argName;
    });
    invariant(schemaArg, 'You tried to get an argument named `%s` on field `%s`, but no such ' + 'argument exists on that field.', argName, this.getName());
    return new RelayQLArgumentType(schemaArg.type);
  };

  RelayQLFieldDefinition.prototype.getDeclaredArguments = function getDeclaredArguments() {
    var args = {};
    this.schemaFieldDef.args.forEach(function (schemaArg) {
      args[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
    return args;
  };

  return RelayQLFieldDefinition;
}();

var RelayQLArgumentType = function () {
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

  RelayQLArgumentType.prototype.getName = function getName(_ref2) {
    var modifiers = _ref2.modifiers;

    return modifiers ? this.schemaModifiedArgType.toString() : this.schemaUnmodifiedArgType.toString();
  };

  RelayQLArgumentType.prototype.ofType = function ofType() {
    invariant(this.isList() || this.isNonNull(), 'Can only get type of list or non-null type.');
    return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
  };

  RelayQLArgumentType.prototype.isEnum = function isEnum() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLEnumType;
  };

  RelayQLArgumentType.prototype.isList = function isList() {
    return this.isListType;
  };

  RelayQLArgumentType.prototype.isNonNull = function isNonNull() {
    return this.isNonNullType;
  };

  RelayQLArgumentType.prototype.isObject = function isObject() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLInputObjectType;
  };

  RelayQLArgumentType.prototype.isScalar = function isScalar() {
    return this.schemaUnmodifiedArgType instanceof types.GraphQLScalarType;
  };

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
      var object = {};
      value.fields.forEach(function (field) {
        object[field.name.value] = getLiteralValue(field.value);
      });
      return object;
    case 'Variable':
      invariant(false, 'Unexpected nested variable `%s`; variables are supported as top-' + 'level arguments - `node(id: $id)` - or directly within lists - ' + '`nodes(ids: [$id])`.', value.name.value);
    default:
      invariant(false, 'Unexpected value kind: %s', value.kind);
  }
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
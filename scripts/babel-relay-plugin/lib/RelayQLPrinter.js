/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var kinds = require('graphql/language/kinds');
var printer = require('graphql/language/printer');
var t = require('babel-core/lib/types');
var types = require('graphql/type');
var typeIntrospection = require('graphql/type/introspection');

var util = require('util');

var SchemaMetaFieldDef = typeIntrospection.SchemaMetaFieldDef;
var TypeMetaFieldDef = typeIntrospection.TypeMetaFieldDef;
var TypeNameMetaFieldDef = typeIntrospection.TypeNameMetaFieldDef;

var NULL = t.literal(null);

/**
 * This is part of the Babel transform to convert embedded GraphQL RFC to
 * JavaScript. It converts from GraphQL AST to a string of JavaScript code.
 */
function RelayQLPrinter(schema, rqlFunctionName) {
  this.rqlFunctionName = rqlFunctionName;
  this.schema = schema;
}

RelayQLPrinter.prototype.getCode = function (ast, substitutions) {
  var options = {
    rqlFunctionName: this.rqlFunctionName,
    schema: this.schema,
    substitutions: substitutions
  };

  var printedDocument;
  switch (ast.kind) {
    case kinds.OPERATION_DEFINITION:
      switch (ast.operation) {
        case 'query':
          printedDocument = printQuery(ast, options);
          break;
        case 'mutation':
          printedDocument = printOperation(ast, options);
          break;
      }
      break;
    case kinds.FRAGMENT_DEFINITION:
      printedDocument = printQueryFragment(ast, options);
      break;
  }
  if (!printedDocument) {
    throw new Error('unexpected type: ' + ast.kind);
  }

  return t.functionExpression(null, options.substitutions.map(function (sub) {
    return t.identifier(sub);
  }), t.blockStatement([t.variableDeclaration('var', [t.variableDeclarator(t.identifier('GraphQL'), t.memberExpression(identify(options.rqlFunctionName), t.identifier('__GraphQL')))]), t.returnStatement(printedDocument)]));
};

function printQueryFragment(fragment, options) {
  var typeName = getTypeName(fragment);
  var type = options.schema.getType(typeName);
  if (!type) {
    throw new Error('Fragment was defined on nonexistent type ' + typeName);
  }

  var requisiteFields = {};
  if (hasIdField(type)) {
    requisiteFields.id = true;
  }
  if (types.isAbstractType(type)) {
    requisiteFields.__typename = true;
  }

  var fieldsAndFragments = printFieldsAndFragments(fragment.selectionSet, type, options, requisiteFields, typeName);
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;
  var directives = printDirectives(fragment.directives);
  var metadata = getRelayDirectiveMetadata(fragment);

  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('QueryFragment')), trimArguments([t.literal(getName(fragment)), t.literal(getTypeName(fragment)), fields, fragments, objectify(metadata), directives]));
}

/**
 * Prints a top level query. This code is pretty similar to `printOperation`,
 * unfortunately, GraphQL.Query is currently just different enough, to make it
 * not worth unifying this code.
 */
function printQuery(query, options) {
  var selections = getSelections(query);
  if (selections.length !== 1) {
    throw new Error('Expected only single top level query');
  }

  // Validate the name of the root call. Throws if it doesn't exist.
  var rootField = selections[0];
  var rootCallName = getName(rootField);
  var rootCallDecl = getFieldDef(options.schema, options.schema.getQueryType(), rootField);
  var type = types.getNamedType(rootCallDecl.type);

  var requisiteFields = {};
  var rootCall = getRootCallForType(options.schema, type);
  if (rootCall) {
    requisiteFields[rootCall.arg] = true;
  }
  if (types.isAbstractType(type)) {
    requisiteFields.__typename = true;
  }

  var printedArgs = printArguments(rootField.arguments[0], options);

  var fieldsAndFragments = printFieldsAndFragments(rootField.selectionSet, type, options, requisiteFields, types.getNamedType(type).name);
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;
  var directives = printDirectives(rootField.directives);
  var metadata = {};

  if (rootCallDecl.args.length > 1) {
    throw new Error(util.format('Invalid root field `%s`; Relay only supports root fields with zero or ' + 'one argument', rootCallName));
  } else if (rootCallDecl.args.length === 1) {
    metadata.rootArg = rootCallDecl.args[0].name;

    var rootCallTypeName = getTypeForMetadata(rootCallDecl.args[0].type);
    if (rootCallTypeName) {
      metadata.rootCallType = rootCallTypeName;
    }
  }

  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Query')), trimArguments([t.literal(getName(rootField)), printedArgs, fields, fragments, objectify(metadata), t.literal(getName(query)), directives]));
}

function printOperation(operation, options) {
  var selections = getSelections(operation);
  if (selections.length !== 1) {
    throw new Error('Expected only single top level field on operation');
  }
  var rootField = selections[0];

  if (operation.operation !== 'mutation') {
    throw new Error('Unexpected operation type: ' + operation.operation);
  }

  var className = 'Mutation';
  var field = getFieldDef(options.schema, options.schema.getMutationType(), rootField);
  if (!field) {
    throw new Error('Provided mutation ' + getName(rootField) + ' does not exist in schema.');
  }
  var type = types.getNamedType(field.type);
  var requisiteFields = { clientMutationId: true };

  var printedCall = t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Callv')), trimArguments([t.literal(getName(rootField)), printCallVariable('input')]));

  if (field.args.length !== 1) {
    throw new Error(util.format('Expected operation `%s` to have a single input field.', getName(rootField)));
  }
  var metadata = {
    inputType: field.args[0].type.toString()
  };
  var fieldsAndFragments = printFieldsAndFragments(rootField.selectionSet, type, options, requisiteFields, type.name);
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;

  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier(className)), trimArguments([t.literal(getName(operation)), t.literal(type.name), printedCall, fields, fragments, objectify(metadata)]));
}

function printFieldsAndFragments(selectionSet, type, options, requisiteFields, parentType) {
  var fields = [];
  var fragments = [];
  if (selectionSet && selectionSet.selections) {
    selectionSet.selections.forEach(function (selection) {
      if (selection.kind === kinds.FRAGMENT_SPREAD) {
        // We assume that all spreads were added by us
        if (selection.directives && selection.directives.length) {
          throw new Error('Directives are not yet supported for `${fragment}`-style ' + 'fragment references.');
        }
        fragments.push(printFragmentReference(getName(selection), options));
      } else if (selection.kind === kinds.INLINE_FRAGMENT) {
        fragments.push(printQueryFragment(selection, options));
      } else if (selection.kind === kinds.FIELD) {
        fields.push(selection);

        if (getConnectionMetadataForType(type) && getName(selection) === 'edges' && type.getFields()['pageInfo']) {
          requisiteFields.pageInfo = true;
        }
      } else {
        throw new Error(util.format('Unsupported selection type `%s`.', selection.kind));
      }
    });
  }

  return {
    fields: printFields(fields, type, options, requisiteFields, parentType),
    fragments: fragments.length ? t.arrayExpression(fragments) : NULL
  };
}

function printArguments(args) {
  if (!args) {
    return NULL;
  }
  var value = args.value;
  if (value.kind === kinds.LIST) {
    return t.arrayExpression(value.values.map(function (arg) {
      return printArgument(arg);
    }));
  } else {
    return printArgument(value);
  }
}

function printArgument(arg) {
  var value;
  switch (arg.kind) {
    case kinds.INT:
      value = parseInt(arg.value, 10);
      break;
    case kinds.FLOAT:
      value = parseFloat(arg.value);
      break;
    case kinds.STRING:
    case kinds.ENUM:
    case kinds.BOOLEAN:
      value = arg.value;
      break;
    case kinds.VARIABLE:
      if (!arg.name || arg.name.kind !== kinds.NAME) {
        throw new Error('Expected variable to have a name');
      }
      return printCallVariable(arg.name.value);
    default:
      throw new Error('Unexpected arg kind: ' + arg.kind);
  }
  return printCallValue(value);
}

function printCallVariable(name) {
  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('CallVariable')), [t.literal(name)]);
}

function printCallValue(value) {
  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('CallValue')), [t.literal(value)]);
}

function printFields(fields, type, options, requisiteFields, parentType) {
  var generateFields = {};
  Object.keys(requisiteFields).forEach(function (name) {
    generateFields[name] = true;
  });

  var printedFields = fields.map(function (field) {
    var fieldName = getName(field);
    delete generateFields[fieldName];
    return printField(field, type, options, requisiteFields, false, parentType);
  });
  Object.keys(generateFields).forEach(function (fieldName) {
    var generatedAST = {
      kind: kinds.FIELD,
      name: { kind: kinds.NAME, value: fieldName },
      selectionSet: { selections: [] },
      arguments: []
    };
    printedFields.push(printField(generatedAST, type, options, requisiteFields, true, parentType));
  });
  if (printedFields.length === 0) {
    return NULL;
  }
  return t.arrayExpression(printedFields);
}

function printFragmentReference(substitutionName, options) {
  return t.callExpression(t.memberExpression(identify(options.rqlFunctionName), t.identifier('__frag')), [t.identifier(substitutionName)]);
}

function printField(field, type, options, requisiteFields, isGenerated, parentType) {
  var fieldName = getName(field);
  var fieldDecl = getFieldDef(options.schema, type, field);
  var metadata = {
    parentType: parentType
  };

  if (!fieldDecl) {
    throw new Error(util.format('Type `%s` doesn\'t have a field `%s`.', type.name, fieldName));
  }

  var subRequisiteFields = {};

  if (hasIdField(types.getNamedType(fieldDecl.type))) {
    subRequisiteFields.id = true;
  }

  // TODO: generalize to types that do not implement `Node`
  // var rootCall = getRootCallForType(options.schema, fieldDecl.type);
  // if (rootCall) {
  //   metadata.rootCall = rootCall.name;
  //   if (rootCall.arg) {
  //     metadata.pk = rootCall.arg;
  //   }
  // }
  if (alwaysImplementsNode(options.schema, fieldDecl.type)) {
    metadata.rootCall = 'node';
    metadata.pk = 'id';
  }

  var connectionMetadata = getConnectionMetadata(fieldDecl);
  if (connectionMetadata) {
    metadata.connection = true;

    if (!getArgNamed(fieldDecl, 'find')) {
      metadata.nonFindable = true;
    }

    if (hasArgument(field, 'first') && hasArgument(field, 'before')) {
      throw new Error(util.format('Connections arguments `%s(before: <cursor>, first: <count>)` are ' + 'not supported. Use `(first: <count>)`, ' + '`(after: <cursor>, first: <count>)`, or ' + '`(before: <cursor>, last: <count>)`.', fieldName));
    }
    if (hasArgument(field, 'last') && hasArgument(field, 'after')) {
      throw new Error(util.format('Connections arguments `%s(after: <cursor>, last: <count>)` are ' + 'not supported. Use `(last: <count>)`, ' + '`(before: <cursor>, last: <count>)`, or ' + '`(after: <cursor>, first: <count>)`.', fieldName));
    }

    var hasEdgesSelection = false;
    var selections = getSelections(field);
    selections.forEach(function (subfield) {
      if (subfield.kind !== kinds.FIELD) {
        return;
      }
      var subfieldName = getName(subfield);
      var subfieldDecl = types.getNamedType(fieldDecl.type).getFields()[subfieldName];
      var subfieldType = types.getNamedType(subfieldDecl.type);
      if (subfieldName !== 'edges' && isList(subfieldDecl.type) && subfieldType.name === connectionMetadata.nodeType.name) {
        // Detect eg `nodes{...}` instead of `edges{node{...}}`
        throw new Error(util.format('Unsupported `%s{...}` field on connection `%s`. Use ' + '`edges{node{...}}` instead.', subfieldName, fieldName));
      }
    });
  } else if (types.getNamedType(fieldDecl.type).name === 'PageInfo') {
    subRequisiteFields.hasNextPage = true;
    subRequisiteFields.hasPreviousPage = true;
  } else if (isEdgeType(fieldDecl.type)) {
    subRequisiteFields.cursor = true;
    subRequisiteFields.node = true;
  }

  if (types.isAbstractType(fieldDecl.type)) {
    metadata.dynamic = true;
    subRequisiteFields.__typename = true;
  }

  if (isList(fieldDecl.type)) {
    metadata.plural = true;
  }

  var fieldsAndFragments = printFieldsAndFragments(field.selectionSet, fieldDecl.type, options, subRequisiteFields, types.getNamedType(fieldDecl.type).name);
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;
  var directives = printDirectives(field.directives);

  if (isGenerated) {
    metadata.generated = true;
  }
  if (requisiteFields.hasOwnProperty(fieldName)) {
    metadata.requisite = true;
  }

  var calls = printCalls(field, fieldDecl);
  var fieldAlias = field.alias ? field.alias.value : null;

  return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Field')), trimArguments([t.literal(fieldName), fields, fragments, calls, t.literal(fieldAlias), NULL, objectify(metadata), directives]));
}

function printDirectives(directives) {
  if (!directives || !directives.length) {
    return NULL;
  }
  var printedDirectives;
  directives.forEach(function (directive) {
    var name = getName(directive);
    if (name === 'relay') {
      return;
    }
    printedDirectives = printedDirectives || [];
    printedDirectives.push(t.objectExpression([property('name', t.literal(getName(directive))), property('arguments', t.arrayExpression(directive.arguments.map(function (argument) {
      return t.objectExpression([property('name', t.literal(getName(argument))), property('value', printArgument(argument.value))]);
    })))]));
  });
  if (!printedDirectives) {
    return NULL;
  }
  return t.arrayExpression(printedDirectives);
}

function printCalls(field, fieldDecl, options) {
  if (field.arguments.length === 0) {
    return NULL;
  }

  // Each GraphQL RFC argument is mapped to a separate call. For GraphQL FB
  // calls with multiple arguments, we use GraphQL RFC array literals.
  var callStrings = field.arguments.map(function (arg) {
    var callName = getName(arg);
    var callDecl = getArgNamed(fieldDecl, callName);
    if (!callDecl) {
      throw new Error(util.format('Unknown call "%s" on field "%s".', callName, fieldDecl.name));
    }

    var metadata = {};
    var typeName = getTypeForMetadata(callDecl.type);
    if (typeName) {
      metadata.type = typeName;
    }
    return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Callv')), trimArguments([t.literal(callName), printArguments(arg), objectify(metadata)]));
  });
  return t.arrayExpression(callStrings);
}

/**
 * Collects the values of the `@relay` directive in an object, if the directive
 * is defined and has values.
 *
 * Input:
 *   `fragment on User @relay(plural: true) {...}`
 * Output:
 *   `{plural: true}`
 */
function getRelayDirectiveMetadata(node) {
  var relayDirective;
  node.directives.forEach(function (directive) {
    if (getName(directive) === 'relay') {
      relayDirective = directive;
    }
  });
  if (!relayDirective) {
    return;
  }
  return relayDirective.arguments.reduce(function (acc, arg) {
    acc[getName(arg)] = getScalarValue(arg);
    return acc;
  }, {});
}

function getScalarValue(node) {
  if (node && node.value && node.value.kind) {
    var kind = node.value.kind;
    var value = node.value.value;
    if (kind === 'BooleanValue') {
      return !!value;
    } else if (kind === 'IntValue') {
      return parseInt(value, 10);
    } else {
      if (kind !== 'StringValue') {
        throw new Error('Expected `@relay(...)` argument values to be scalars, got ' + kind);
      }
      return value;
    }
  }
}

function getTypeForMetadata(type) {
  var namedType = types.getNamedType(type);
  if (namedType instanceof types.GraphQLEnumType || namedType instanceof types.GraphQLInputObjectType) {
    return String(type);
  } else if (namedType instanceof types.GraphQLScalarType) {
    return null;
  }
  throw new Error('Unsupported call value type ' + namedType.name);
}

function isEnum(type) {
  return types.getNullableType(type) instanceof types.GraphQLEnumType;
}

function isList(type) {
  return types.getNullableType(type) instanceof types.GraphQLList;
}

function getName(node) {
  if (node && node.name && node.name.kind === kinds.NAME) {
    return node.name.value;
  } else if (node && node.typeCondition) {
    return getTypeName(node);
  }
  throw new Error('Expected node to have a name');
}

function getTypeName(node) {
  if (node && node.typeCondition) {
    if (node.typeCondition.kind === kinds.NAMED_TYPE) {
      return getName(node.typeCondition);
    } else if (node.typeCondition.kind === kinds.NAME) {
      return node.typeCondition.value;
    }
  }
  throw new Error('Expected node to have a name');
}

function isOrImplementsNode(schema, type) {
  var namedType = types.getNamedType(type);
  if (namedType.name === 'Node') {
    return true;
  }
  if (!(namedType instanceof types.GraphQLObjectType)) {
    return false;
  }
  var node = schema.getType('Node');
  return namedType.getInterfaces().indexOf(node) !== -1;
}

function mightImplementNode(schema, type) {
  var namedType = types.getNamedType(type);
  if (isOrImplementsNode(schema, namedType)) {
    return true;
  }

  if (!types.isAbstractType(namedType)) {
    return false;
  }

  return namedType.getPossibleTypes().some(function (subtype) {
    return isOrImplementsNode(schema, subtype);
  });
}

function alwaysImplementsNode(schema, type) {
  var namedType = types.getNamedType(type);
  if (isOrImplementsNode(schema, namedType)) {
    return true;
  }

  if (!types.isAbstractType(namedType)) {
    return false;
  }

  return namedType.getPossibleTypes().every(function (subtype) {
    return isOrImplementsNode(schema, subtype);
  });
}

function getRootCallForType(schema, type) {
  if (alwaysImplementsNode(schema, type)) {
    return { name: 'node', arg: 'id' };
  }
  return null;
}

function isConnectionType(type) {
  return (/.+Connection$/.test(type.name)
  );
}

function hasIdField(type) {
  return !!(type.getFields && type.getFields()['id']);
}

function isEdgeType(type) {
  var namedType = types.getNamedType(type);
  return (/.+Edge$/.test(namedType.name) && !!namedType.getFields()['node'] && !!namedType.getFields()['cursor']
  );
}

function getArgNamed(field, name) {
  var remaining = field.args.filter(function (arg) {
    return arg.name === name;
  });
  return remaining.length === 1 ? remaining[0] : null;
}

function getConnectionMetadata(fieldDecl) {
  // Connections must be limitable.
  if (!getArgNamed(fieldDecl, 'first') && !getArgNamed(fieldDecl, 'last')) {
    return null;
  }
  return getConnectionMetadataForType(fieldDecl.type);
}

function getConnectionMetadataForType(type) {
  if (!isConnectionType(type)) {
    return null;
  }

  var fieldType = types.getNamedType(type);

  // Connections must have a non-scalar `edges` field.
  var edgesField = fieldType.getFields()['edges'];
  if (!edgesField) {
    return null;
  }
  var edgesType = types.getNamedType(edgesField.type);
  if (edgesType instanceof types.GraphQLScalarType) {
    return null;
  }

  // Connections' `edges` field must have a non-scalar `node` field.
  var edgesType = types.getNamedType(edgesField.type);
  var nodeField = edgesType.getFields()['node'];
  if (!nodeField) {
    return null;
  }
  var nodeType = types.getNamedType(nodeField.type);
  if (nodeType instanceof types.GraphQLScalarType) {
    return null;
  }
  // Connections' `edges` field must have a scalar `cursor` field.
  var cursorField = edgesType.getFields()['cursor'];
  if (!cursorField) {
    return null;
  }
  var cursorType = types.getNamedType(cursorField.type);
  if (!(cursorType instanceof types.GraphQLScalarType)) {
    return null;
  }
  return {
    cursorType: cursorType,
    cursorField: cursorField,
    edgesType: edgesType,
    edgesField: edgesField,
    nodeType: nodeType,
    nodeField: nodeField
  };
}

/**
 * Returns the definition of the given `field` within the parent type,
 * or introspection types for `__type`, `__schema`, and `__typename` fields.
 *
 * Note: this is adapted from `graphql`:
 * https://github.com/graphql/graphql-js/blob/81a7d7add03adbb14dc852bbe45ab030c0601489/src/utilities/TypeInfo.js#L212-L237
 */
function getFieldDef(schema, parentType, field) {
  parentType = types.getNamedType(parentType);
  var fieldName = getName(field);
  if (fieldName === SchemaMetaFieldDef.name && schema.getQueryType() === parentType) {
    return SchemaMetaFieldDef;
  }
  if (fieldName === TypeMetaFieldDef.name && schema.getQueryType() === parentType) {
    return TypeMetaFieldDef;
  }
  if (fieldName === TypeNameMetaFieldDef.name && (parentType instanceof types.GraphQLObjectType || parentType instanceof types.GraphQLInterfaceType || parentType instanceof types.GraphQLUnionType)) {
    return TypeNameMetaFieldDef;
  }
  return types.getNamedType(parentType).getFields()[fieldName];
}

function objectify(obj) {
  if (obj == null) {
    return NULL;
  }
  var keys = Object.keys(obj);
  if (!keys.length) {
    return NULL;
  }
  return t.objectExpression(keys.map(function (key) {
    return property(key, t.literal(obj[key]));
  }));
}

function identify(str) {
  return str.split('.').reduce(function (acc, name) {
    if (!acc) {
      return t.identifier(name);
    }
    return t.memberExpression(acc, t.identifier(name));
  }, null);
}

function property(name, value) {
  return t.property('init', t.identifier(name), value);
}

function trimArguments(args) {
  var lastIndex = -1;
  for (var ii = args.length - 1; ii >= 0; ii--) {
    if (args[ii] == null) {
      throw new Error('Use `NULL` to indicate that output should be the literal value `null`.');
    }
    if (args[ii] !== NULL) {
      lastIndex = ii;
      break;
    }
  }
  return args.slice(0, lastIndex + 1);
}

function getSelections(node) {
  if (node.selectionSet && node.selectionSet.selections) {
    return node.selectionSet.selections;
  }
  return [];
}

function hasArgument(field, argumentName) {
  for (var ix = 0; ix < field.arguments.length; ix++) {
    if (getName(field.arguments[ix]) === argumentName) {
      return true;
    }
  }
  return false;
}

module.exports = RelayQLPrinter;
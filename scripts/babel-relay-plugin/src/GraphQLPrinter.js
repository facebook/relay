/*jslint node:true*/
"use strict";

var kinds = require('graphql/language/kinds');
var types = require('graphql/type');

var util = require('util');

/**
 * This is part of the Babel transform to convert embedded GraphQL RFC to
 * JavaScript. It converts from GraphQL AST to a string of JavaScript code.
 */
function GraphQLPrinter(schema, rqlFunctionName) {
  this.rqlFunctionName = rqlFunctionName;
  this.schema = schema;
}

GraphQLPrinter.prototype.getCode = function(ast, substitutions) {
  var options = {
    rqlFunctionName: this.rqlFunctionName,
    schema: this.schema,
    substitutions: substitutions
  };

  switch (ast.kind) {
    case kinds.OPERATION_DEFINITION:
      switch (ast.operation) {
        case 'query':
          return printQuery(ast, options);
        case 'mutation':
          return printOperation(ast, options);
      }
      break;
    case kinds.FRAGMENT_DEFINITION:
      return printQueryFragment(ast, options);
  }
  throw new Error('unexpected type: ' + ast.kind);
};

function printQueryFragment(fragment, options) {
  var argsCode = getFragmentCode(fragment, options);
  var substitutionNames = options.substitutions.join(', ');
  return [
    'function(' + substitutionNames + ') {',
      'var GraphQL = ' + options.rqlFunctionName + '.__GraphQL;',
      'return new GraphQL.QueryFragment(' + argsCode + ');',
    '}'
  ].join('');
}

function printInlineFragment(fragment, options) {
  var argsCode = getFragmentCode(fragment, options);
  return 'new GraphQL.QueryFragment(' + argsCode + ')';
}

function getFragmentCode(fragment, options) {
  var typeName = getTypeName(fragment);
  var type = options.schema.getType(typeName);
  if (!type) {
    throw new Error('Fragment was defined on nonexistent type ' + typeName);
  }

  var requisiteFields = {};
  if (hasIdField(type)) {
    requisiteFields.id = true;
  }

  var fieldsAndFragments = printFieldsAndFragments(
    fragment.selectionSet,
    type,
    options,
    requisiteFields,
    typeName
  );

  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;
  var metadata = getRelayDirectiveMetadata(fragment);

  var metadataCode = stringifyObject(metadata);

  return getFunctionArgCode([
    JSON.stringify(getName(fragment)),
    JSON.stringify(getTypeName(fragment)),
    fields,
    fragments,
    metadataCode
  ]);
}

/**
 * Prints a top level query. This code is pretty similar to `printOperation`,
 * unfortunately, GraphQL.Query is currently just different enough, to make it
 * not worth unifying this code.
 */
function printQuery(query, options) {
  var selections = getSelections(query);
  if (selections.length !== 1) {
    throw new Error('expected only single top level query');
  }

  // Validate the name of the root call. Throws if it doesn't exist.
  var rootField = selections[0];
  var rootCallName = getName(rootField);
  var rootCallDecl = options.schema.getQueryType().getFields()[rootCallName];
  var type = rootCallDecl.type;

  var requisiteFields = {};
  var rootCall = getRootCallForType(options.schema, type);
  if (rootCall) {
    requisiteFields[rootCall.arg] = true;
  }

  var callArgsCode = printArguments(rootField.arguments[0], options);

  var fieldsAndFragments = printFieldsAndFragments(
    rootField.selectionSet,
    type,
    options,
    requisiteFields,
    types.getNamedType(type).name
  );
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;

  var metadata = {};

  if (rootCallDecl.args.length > 1) {
    throw new Error(util.format(
      'Invalid root field `%s`; Relay only supports root fields with zero or ' +
      'one argument',
      rootCallName
    ));
  } else if (rootCallDecl.args.length === 1) {
    metadata.rootArg = rootCallDecl.args[0].name;

    var rootCallTypeName = getTypeForMetadata(rootCallDecl.args[0].type);
    if (rootCallTypeName) {
      metadata.rootCallType = rootCallTypeName;
    }
  }

  var metadataCode = stringifyObject(metadata);

  var argsCode = getFunctionArgCode([
    JSON.stringify(getName(rootField)),
    callArgsCode,
    fields,
    fragments,
    metadataCode,
    JSON.stringify(getName(query))
  ]);

  var substitutionNames = options.substitutions.join(', ');

  return (
    'function(' + substitutionNames + ') {' +
      'var GraphQL = ' + options.rqlFunctionName + '.__GraphQL;' +
      'return new GraphQL.Query(' + argsCode + ');' +
    '}'
  );
}

function printOperation(operation, options) {
  var selections = getSelections(operation);
  if (selections.length !== 1) {
    throw new Error('expected only single top level field on operation');
  }
  var rootField = selections[0];

  if (operation.operation !== 'mutation') {
    throw new Error('Unexpected operation type: ' + operation.operation);
  }

  var className = 'Mutation';
  var field = options.schema.getMutationType().getFields()[getName(rootField)];
  if (!field) {
    throw new Error(
      'Provided mutation ' + getName(rootField) + ' does not exist in schema.'
    );
  }
  var type = types.getNamedType(field.type);
  var requisiteFields = {clientMutationId: true};

  var callCode =
    'new GraphQL.Callv(' +
    getFunctionArgCode([
      JSON.stringify(getName(rootField)),
      printCallVariable('input')
    ]) +
    ')';

  if (field.args.length !== 1) {
    throw new Error(util.format(
      'Expected operation `%s` to have a single input field.',
      getName(rootField)
    ));
  }
  var metadata = {
    inputType: field.args[0].type.toString()
  };
  var fieldsAndFragments = printFieldsAndFragments(
    rootField.selectionSet,
    type,
    options,
    requisiteFields,
    type.name
  );
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;

  var argsCode = getFunctionArgCode([
    JSON.stringify(getName(operation)),
    JSON.stringify(type.name),
    callCode,
    fields,
    fragments,
    stringifyObject(metadata)
  ]);

  var substitutionNames = options.substitutions.join(', ');

  return (
    'function(' + substitutionNames + ') {' +
      'var GraphQL = ' + options.rqlFunctionName + '.__GraphQL;' +
      'return new GraphQL.' + className + '(' + argsCode + ');' +
    '}'
  );
}

function printFieldsAndFragments(
  selectionSet,
  type,
  options,
  requisiteFields,
  parentType
) {
  var fields = [];
  var fragments = [];
  if (selectionSet && selectionSet.selections) {
    selectionSet.selections.forEach(function(selection) {
      if (selection.kind === kinds.FRAGMENT_SPREAD) {
        // We assume that all spreads were added by us
        fragments.push(printFragmentReference(getName(selection), options));
      } else if (selection.kind === kinds.INLINE_FRAGMENT) {
        fragments.push(printInlineFragment(selection, options));
      } else if (selection.kind === kinds.FIELD) {
        fields.push(selection);
      } else {
        throw new Error(util.format(
          'Unsupported selection type `%s`.',
          selection.kind
        ));
      }
    });
  }
  var fragmentsCode = null;
  if (fragments.length) {
    fragmentsCode = '[' + fragments.join(',') + ']';
  }

  return {
    fields: printFields(fields, type, options, requisiteFields, parentType),
    fragments: fragmentsCode,
  };
}

function printArguments(args, options) {
  if (!args) {
    return null;
  }
  var value = args.value;
  if (value.kind === kinds.LIST) {
    return '[' + value.values.map(function(arg) {
      return printArgument(arg, options)
    }).join(', ') + ']';
  } else {
    return printArgument(value, options);
  }
}

function printArgument(arg, options) {
  switch (arg.kind) {
    case kinds.INT:
      return JSON.stringify(parseInt(arg.value, 10));
    case kinds.FLOAT:
      return JSON.stringify(parseFloat(arg.value));
    case kinds.STRING:
    case kinds.ENUM:
    case kinds.BOOLEAN:
      return JSON.stringify(arg.value);
    case kinds.VARIABLE:
      if (!arg.name || arg.name.kind !== kinds.NAME) {
        throw new Error('Expected variable to have a name');
      }
      return printCallVariable(arg.name.value);
    default:
      throw new Error('Unexpected arg kind: ' + arg.kind);
  }
}

function printCallVariable(name) {
  return 'new GraphQL.CallVariable(' + JSON.stringify(name) + ')';
}

function printFields(fields, type, options, requisiteFields, parentType) {
  var generateFields = {};
  Object.keys(requisiteFields).forEach(function(name) {
    generateFields[name] = true;
  });

  var fieldStrings = fields.map(function(field) {
    var fieldName = getName(field);
    delete generateFields[fieldName];
    return printField(field, type, options, requisiteFields, false, parentType);
  });
  Object.keys(generateFields).forEach(function(fieldName) {
    var generatedAST = {
      kind: kinds.FIELD,
      name: { kind: kinds.NAME, value: fieldName },
      selectionSet: {selections: []},
      arguments: [],
    };
    fieldStrings.push(
      printField(generatedAST, type, options, requisiteFields, true, parentType)
    );
  });
  if (fieldStrings.length === 0) {
    return null;
  }
  return '[' + fieldStrings.join(', ') + ']';
}

function printFragmentReference(substitutionName, options) {
  return options.rqlFunctionName + '.__frag(' + substitutionName + ')';
}

function printField(
  field,
  type,
  options,
  requisiteFields,
  isGenerated,
  parentType
) {
  var fieldName = getName(field);
  var fieldDecl = types.getNamedType(type).getFields()[fieldName];
  var metadata = {
    parentType: parentType,
  };

  if (!fieldDecl) {
    throw new Error(util.format(
      'Type "%s" doesn\'t have a field "%s".',
      type.name,
      fieldName
    ));
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

  if (isConnection(options.schema, fieldDecl)) {
    metadata.connection = true;

    if (!getArgNamed(fieldDecl, 'find')) {
      metadata.nonFindable = true;
    }

    var hasEdgesSelection = false;
    var selections = getSelections(field);
    selections.forEach(function(subfield) {
      var subfieldName = getName(subfield);
      if (subfieldName === 'nodes') {
        throw new Error(util.format(
          'Unsupported "nodes" field on connection, `%s`. Instead, use ' +
          '"edges{node{...}}".',
          fieldName
        ));
      }
      if (subfieldName === 'edges') {
        hasEdgesSelection = true;
      }
    });
    if (hasEdgesSelection && !!fieldDecl.type.getFields()['pageInfo']) {
      subRequisiteFields.pageInfo = true;
    }
  } else if (types.getNamedType(fieldDecl.type).name === 'PageInfo') {
    subRequisiteFields.hasNextPage = true;
    subRequisiteFields.hasPreviousPage = true;
  } else if (isEdgeType(fieldDecl.type)) {
    subRequisiteFields.cursor = true;
    subRequisiteFields.node = true;
  }

  if (types.isAbstractType(fieldDecl.type)) {
    metadata.dynamic = true;
  }

  if (isList(fieldDecl.type)) {
    metadata.plural = true;
  }

  var fieldsAndFragments = printFieldsAndFragments(
    field.selectionSet,
    fieldDecl.type,
    options,
    subRequisiteFields,
    types.getNamedType(fieldDecl.type).name
  );
  var fields = fieldsAndFragments.fields;
  var fragments = fieldsAndFragments.fragments;

  if (isGenerated) {
    metadata.generated = true;
  }
  if (requisiteFields.hasOwnProperty(fieldName)) {
    metadata.requisite = true;
  }

  var callsCode = printCalls(field, fieldDecl, options);

  var fieldAliasCode = field.alias ?
    JSON.stringify(field.alias.value) :
    null;
  var metadataCode = stringifyObject(metadata);

  var argsCode = getFunctionArgCode([
    JSON.stringify(fieldName),
    fields,
    fragments,
    callsCode,
    fieldAliasCode,
    null,
    metadataCode
  ]);

  return 'new GraphQL.Field(' + argsCode + ')';
}

function printCalls(field, fieldDecl, options) {
  if (field.arguments.length === 0) {
    return null;
  }

  // Each GraphQL RFC argument is mapped to a separate call. For GraphQL FB
  // calls with multiple arguments, we use GraphQL RFC array literals.
  var callStrings = field.arguments.map(function(arg) {
    var callName = getName(arg);
    var callDecl = getArgNamed(fieldDecl, callName);
    if (!callDecl) {
      throw new Error(util.format(
        'Unknown call "%s" on field "%s".',
        callName,
        fieldDecl.name
      ));
    }

    var metadata = {};
    var typeName = getTypeForMetadata(callDecl.type);
    if (typeName) {
      metadata.type = typeName;
    }
    return (
      'new GraphQL.Callv(' +
        getFunctionArgCode([
          JSON.stringify(callName),
          printArguments(arg, options),
          stringifyObject(metadata),
        ]) +
      ')'
    );
  });
  return '[' + callStrings.join(', ') + ']';
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
  node.directives.forEach(function(directive) {
    if (getName(directive) === 'relay') {
      relayDirective = directive;
    }
  });
  if (!relayDirective) {
    return;
  }
  return relayDirective.arguments.reduce(function(acc, arg) {
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
        throw new Error(
          'Expected `@relay(...)` argument values to be scalars, got ' +
          kind
        );
      }
      return value;
    }
  }
}

function getTypeForMetadata(type) {
  type = types.getNamedType(type);
  if (type instanceof types.GraphQLEnumType) {
    return type.name;
  } else if (type instanceof types.GraphQLInputObjectType) {
    return type.name;
  } else if (type instanceof types.GraphQLScalarType) {
    return null;
  }
  throw new Error('Unsupported call value type ' + type.name);
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
    return {name: 'node', arg: 'id'};
  }
  return null;
}

function isConnectionType(type) {
  return /.+Connection$/.test(type.name);
}

function hasIdField(type) {
  return !!(type.getFields && type.getFields()['id']);
}

function isEdgeType(type) {
  var namedType = types.getNamedType(type);
  return /.+Edge$/.test(namedType.name) &&
    !!namedType.getFields()['node'] &&
    !!namedType.getFields()['cursor'];
}

function getArgNamed(field, name) {
  var remaining = field.args.filter(function (arg) {
    return (arg.name === name);
  });
  return remaining.length === 1 ? remaining[0] : null;
}

function isConnection(schema, fieldDecl) {
  if (!isConnectionType(fieldDecl.type)) {
    return false;
  }
  // Connections must be limitable.
  if (!getArgNamed(fieldDecl, 'first') && !getArgNamed(fieldDecl, 'last')) {
    return false;
  }
  var fieldType = types.getNamedType(fieldDecl.type);

  // Connections must have a non-scalar `edges` field.
  var edgesField = fieldType.getFields()['edges'];
  if (!edgesField) {
    return false;
  }
  var edgesType = types.getNamedType(edgesField.type);
  if (edgesType instanceof types.GraphQLScalarType) {
    return false;
  }

  // Connections' `edges` field must have a non-scalar `node` field.
  var edgesType = types.getNamedType(edgesField.type);
  var nodeField = edgesType.getFields()['node'];
  if (!nodeField) {
    return false;
  }
  var nodeType = types.getNamedType(nodeField.type);
  if (nodeType instanceof types.GraphQLScalarType) {
    return false;
  }
  // Connections' `edges` field must have a scalar `cursor` field.
  var cursorField = edgesType.getFields()['cursor'];
  if (!cursorField) {
    return false;
  }
  var cursorType = types.getNamedType(cursorField.type);
  if (!(cursorType instanceof types.GraphQLScalarType)) {
    return false;
  }
  return true;
}

function trimArray(arr) {
  var lastIndex = -1;
  for (var ii = arr.length - 1; ii >= 0; ii--) {
    if (arr[ii] !== null) {
      lastIndex = ii;
      break;
    }
  }
  arr.length = lastIndex + 1;
  return arr;
}

function stringifyObject(obj) {
  for (var ii in obj) {
    if (obj.hasOwnProperty(ii)) {
      return JSON.stringify(obj);
    }
  }
  return null;
}

function getFunctionArgCode(arr) {
  return trimArray(arr)
    .map(function(arg) {
      return arg === null ? 'null' : arg;
    })
    .join(', ');
}

function getSelections(node) {
  if (node.selectionSet && node.selectionSet.selections) {
    return node.selectionSet.selections;
  }
  return [];
}

module.exports = GraphQLPrinter;

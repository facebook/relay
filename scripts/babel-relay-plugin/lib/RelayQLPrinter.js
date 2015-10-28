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

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('./RelayQLAST');

var RelayQLArgument = _require.RelayQLArgument;
var RelayQLArgumentType = _require.RelayQLArgumentType;
var RelayQLDefinition = _require.RelayQLDefinition;
var RelayQLDirective = _require.RelayQLDirective;
var RelayQLField = _require.RelayQLField;
var RelayQLFragment = _require.RelayQLFragment;
var RelayQLFragmentSpread = _require.RelayQLFragmentSpread;
var RelayQLInlineFragment = _require.RelayQLInlineFragment;
var RelayQLMutation = _require.RelayQLMutation;
var RelayQLQuery = _require.RelayQLQuery;
var RelayQLType = _require.RelayQLType;

var find = require('./find');
var invariant = require('./invariant');
var t = require('babel-core/lib/types');

var NULL = t.literal(null);

var RelayQLPrinter = (function () {
  function RelayQLPrinter(tagName) {
    _classCallCheck(this, RelayQLPrinter);

    this.tagName = tagName;
  }

  _createClass(RelayQLPrinter, [{
    key: 'print',
    value: function print(definition, substitutions) {
      var printedDocument = undefined;
      if (definition instanceof RelayQLQuery) {
        printedDocument = this.printQuery(definition);
      } else if (definition instanceof RelayQLFragment) {
        printedDocument = this.printFragment(definition);
      } else if (definition instanceof RelayQLMutation) {
        printedDocument = this.printMutation(definition);
      } else {
        invariant(false, 'Unsupported definition: %s', definition);
      }
      var callExpression = t.callExpression(t.functionExpression(null, substitutions.map(function (substitution) {
        return t.identifier(substitution.name);
      }), t.blockStatement([t.variableDeclaration('var', [t.variableDeclarator(t.identifier('GraphQL'), t.memberExpression(identify(this.tagName), t.identifier('__GraphQL')))]), t.returnStatement(printedDocument)])), substitutions.map(function (substitution) {
        return substitution.value;
      }));

      if (this.tagName === 'Relay.Query') {
        return t.callExpression(identify('Relay.createQuery'), [callExpression, t.objectExpression([])]);
      }
      return callExpression;
    }
  }, {
    key: 'printQuery',
    value: function printQuery(query) {
      var rootFields = query.getFields();
      invariant(rootFields.length === 1, 'There are %d fields supplied to the query named `%s`, but queries ' + 'must have exactly one field.', rootFields.length, query.getName());
      var rootField = rootFields[0];
      var rootFieldType = rootField.getType();
      var rootFieldArgs = rootField.getArguments();

      var requisiteFields = {};
      var identifyingFieldDef = rootFieldType.getIdentifyingFieldDefinition();
      if (identifyingFieldDef) {
        requisiteFields[identifyingFieldDef.getName()] = true;
      }
      if (rootFieldType.isAbstract()) {
        requisiteFields.__typename = true;
      }
      var selection = this.printSelection(rootField, requisiteFields);
      var metadata = {};
      var printedArg = undefined;
      invariant(rootFieldArgs.length <= 1, 'Invalid root field `%s`; Relay only supports root fields with zero ' + 'or one argument.', rootField.getName());
      if (rootFieldArgs.length === 1) {
        // Until such time as a root field's 'identifying argument' (one that has
        // a 1-1 correspondence with a Relay record, or null) has a formal type,
        // assume that the lone arg in a root field's call is the identifying one.
        var identifyingArg = rootFieldArgs[0];
        metadata.identifyingArgName = identifyingArg.getName();
        var identifyingArgType = this.printArgumentTypeForMetadata(identifyingArg.getType());
        if (identifyingArgType) {
          metadata.identifyingArgType = identifyingArgType;
        }
        printedArg = this.printArgumentValue(identifyingArg);
      } else {
        printedArg = NULL;
      }

      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Query')), trimArguments([t.literal(rootField.getName()), printedArg, selection.fields, selection.fragments, objectify(metadata), t.literal(query.getName()), this.printDirectives(rootField.getDirectives())]));
    }
  }, {
    key: 'printFragment',
    value: function printFragment(fragment) {
      var fragmentType = fragment.getType();

      var requisiteFields = {};
      if (fragmentType.hasField('id')) {
        requisiteFields.id = true;
      }
      if (fragmentType.isAbstract()) {
        requisiteFields.__typename = true;
      }
      var selection = this.printSelection(fragment, requisiteFields);
      var metadata = this.printRelayDirectiveMetadata(fragment);

      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('QueryFragment')), trimArguments([t.literal(fragment.getName()), t.literal(fragmentType.getName({ modifiers: true })), selection.fields, selection.fragments, objectify(metadata), this.printDirectives(fragment.getDirectives())]));
    }
  }, {
    key: 'printMutation',
    value: function printMutation(mutation) {
      var rootFields = mutation.getFields();
      invariant(rootFields.length === 1, 'There are %d fields supplied to the mutation named `%s`, but ' + 'mutations must have exactly one field.', rootFields.length, mutation.getName());
      var rootField = rootFields[0];
      var rootFieldType = rootField.getType();
      validateMutationField(rootField);
      var requisiteFields = { clientMutationId: true };
      var selection = this.printSelection(rootField, requisiteFields);
      var metadata = {
        inputType: this.printArgumentTypeForMetadata(rootField.getDeclaredArgument('input'))
      };

      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Mutation')), trimArguments([t.literal(mutation.getName()), t.literal(rootFieldType.getName({ modifiers: true })), t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Callv')), trimArguments([t.literal(rootField.getName()), this.printVariable('input')])), selection.fields, selection.fragments, objectify(metadata)]));
    }
  }, {
    key: 'printSelection',
    value: function printSelection(parent, requisiteFields) {
      var _this = this;

      var fields = [];
      var printedFragments = [];
      parent.getSelections().forEach(function (selection) {
        if (selection instanceof RelayQLFragmentSpread) {
          // Assume that all spreads exist via template substitution.
          invariant(selection.getDirectives().length === 0, 'Directives are not yet supported for `${fragment}`-style fragment ' + 'references.');
          printedFragments.push(_this.printFragmentReference(selection));
        } else if (selection instanceof RelayQLInlineFragment) {
          printedFragments.push(_this.printFragment(selection.getFragment()));
        } else if (selection instanceof RelayQLField) {
          fields.push(selection);
        } else {
          invariant(false, 'Unsupported selection type `%s`.', selection);
        }
      });
      var printedFields = this.printFields(fields, parent, requisiteFields);

      return {
        fields: printedFields.length ? t.arrayExpression(printedFields) : NULL,
        fragments: printedFragments.length ? t.arrayExpression(printedFragments) : NULL
      };
    }
  }, {
    key: 'printFields',
    value: function printFields(fields, parent, requisiteFields) {
      var _this2 = this;

      var parentType = parent.getType();
      if (parentType.isConnection() && parentType.hasField('pageInfo') && fields.some(function (field) {
        return field.getName() === 'edges';
      })) {
        requisiteFields.pageInfo = true;
      }

      var generatedFields = _extends({}, requisiteFields);

      var printedFields = [];
      fields.forEach(function (field) {
        delete generatedFields[field.getName()];
        printedFields.push(_this2.printField(field, parent, requisiteFields, generatedFields));
      });

      Object.keys(generatedFields).forEach(function (fieldName) {
        var generatedField = parentType.generateField(fieldName);
        printedFields.push(_this2.printField(generatedField, parent, requisiteFields, generatedFields));
      });
      return printedFields;
    }
  }, {
    key: 'printField',
    value: function printField(field, parent, requisiteSiblings, generatedSiblings) {
      var _this3 = this;

      var fieldType = field.getType();

      var metadata = {};
      metadata.parentType = parent.getType().getName({ modifiers: false });
      var requisiteFields = {};
      if (fieldType.hasField('id')) {
        requisiteFields.id = true;
      }

      validateField(field, parent.getType());

      // TODO: Generalize to non-`Node` types.
      if (fieldType.alwaysImplements('Node')) {
        metadata.rootCall = 'node';
        metadata.pk = 'id';
      }
      if (fieldType.isConnection()) {
        if (field.hasDeclaredArgument('first') || field.hasDeclaredArgument('last')) {
          validateConnectionField(field);
          metadata.connection = true;
          if (!field.hasDeclaredArgument('find')) {
            metadata.nonFindable = true;
          }
        }
      } else if (fieldType.isConnectionPageInfo()) {
        requisiteFields.hasNextPage = true;
        requisiteFields.hasPreviousPage = true;
      } else if (fieldType.isConnectionEdge()) {
        requisiteFields.cursor = true;
        requisiteFields.node = true;
      }
      if (fieldType.isAbstract()) {
        metadata.dynamic = true;
        requisiteFields.__typename = true;
      }
      if (fieldType.isList()) {
        metadata.plural = true;
      }
      if (generatedSiblings.hasOwnProperty(field.getName())) {
        metadata.generated = true;
      }
      if (requisiteSiblings.hasOwnProperty(field.getName())) {
        metadata.requisite = true;
      }

      var selection = this.printSelection(field, requisiteFields);
      var fieldAlias = field.getAlias();
      var args = field.getArguments();

      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Field')), trimArguments([t.literal(field.getName()), selection.fields, selection.fragments, args.length ? t.arrayExpression(args.map(function (arg) {
        return _this3.printArgument(arg);
      })) : NULL, fieldAlias ? t.literal(fieldAlias) : NULL, NULL, objectify(metadata), this.printDirectives(field.getDirectives())]));
    }
  }, {
    key: 'printFragmentReference',
    value: function printFragmentReference(fragmentReference) {
      return t.callExpression(t.memberExpression(identify(this.tagName), t.identifier('__frag')), [t.identifier(fragmentReference.getName())]);
    }
  }, {
    key: 'printArgument',
    value: function printArgument(arg) {
      var metadata = {};
      var inputType = this.printArgumentTypeForMetadata(arg.getType());
      if (inputType) {
        metadata.type = inputType;
      }
      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('Callv')), trimArguments([t.literal(arg.getName()), this.printArgumentValue(arg), objectify(metadata)]));
    }
  }, {
    key: 'printArgumentValue',
    value: function printArgumentValue(arg) {
      if (arg.isVariable()) {
        return this.printVariable(arg.getVariableName());
      } else {
        return this.printValue(arg.getValue());
      }
    }
  }, {
    key: 'printVariable',
    value: function printVariable(name) {
      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('CallVariable')), [t.literal(name)]);
    }
  }, {
    key: 'printValue',
    value: function printValue(value) {
      var _this4 = this;

      if (Array.isArray(value)) {
        return t.arrayExpression(value.map(function (element) {
          return _this4.printArgumentValue(element);
        }));
      }
      return t.newExpression(t.memberExpression(t.identifier('GraphQL'), t.identifier('CallValue')), [t.literal(value)]);
    }
  }, {
    key: 'printDirectives',
    value: function printDirectives(directives) {
      var _this5 = this;

      var printedDirectives = [];
      directives.forEach(function (directive) {
        if (directive.getName() === 'relay') {
          return;
        }
        printedDirectives.push(t.objectExpression([property('name', t.literal(directive.getName())), property('arguments', t.arrayExpression(directive.getArguments().map(function (arg) {
          return t.objectExpression([property('name', t.literal(arg.getName())), property('value', _this5.printArgumentValue(arg))]);
        })))]));
      });
      return printedDirectives.length ? t.arrayExpression(printedDirectives) : NULL;
    }
  }, {
    key: 'printRelayDirectiveMetadata',
    value: function printRelayDirectiveMetadata(node) {
      var metadata = {};
      var relayDirective = find(node.getDirectives(), function (directive) {
        return directive.getName() === 'relay';
      });
      if (relayDirective) {
        relayDirective.getArguments().forEach(function (arg) {
          if (arg.isVariable()) {
            invariant(!arg.isVariable(), 'You supplied `$%s` as the `%s` argument to the `@relay` ' + 'directive, but `@relay` require scalar argument values.', arg.getVariableName(), arg.getName());
          }
          metadata[arg.getName()] = arg.getValue();
        });
      }
      return metadata;
    }

    /**
     * Prints the type for arguments that are transmitted via variables.
     */
  }, {
    key: 'printArgumentTypeForMetadata',
    value: function printArgumentTypeForMetadata(argType) {
      // Currently, we always send Enum and Object types as variables.
      if (argType.isEnum() || argType.isObject()) {
        return argType.getName({ modifiers: true });
      }
      // Currently, we always inline scalar types.
      if (argType.isScalar()) {
        return null;
      }
      invariant(false, 'Unsupported input type: %s', argType);
    }
  }]);

  return RelayQLPrinter;
})();

function validateField(field, parentType) {
  if (field.getName() === 'node') {
    var argTypes = field.getDeclaredArguments();
    var argNames = Object.keys(argTypes);
    invariant(argNames.length !== 1 || argNames[0] !== 'id', 'You defined a `node(id: %s)` field on type `%s`, but Relay requires ' + 'the `node` field to be defined on the root type. See the Object ' + 'Identification Guide: \n' + 'http://facebook.github.io/relay/docs/graphql-object-identification.html', argNames[0] && argTypes[argNames[0]].getName({ modifiers: true }), parentType.getName({ modifiers: false }));
  }
}

function validateConnectionField(field) {
  invariant(!field.hasArgument('first') || !field.hasArgument('before'), 'Connection arguments `%s(before: <cursor>, first: <count>)` are ' + 'not supported. Use `(first: <count>)`, ' + '`(after: <cursor>, first: <count>)`, or ' + '`(before: <cursor>, last: <count>)`.', field.getName());
  invariant(!field.hasArgument('last') || !field.hasArgument('after'), 'Connection arguments `%s(after: <cursor>, last: <count>)` are ' + 'not supported. Use `(last: <count>)`, ' + '`(before: <cursor>, last: <count>)`, or ' + '`(after: <cursor>, first: <count>)`.', field.getName());

  // Use `any` because we already check `isConnection` before validating.
  var connectionNodeType = field.getType().getFieldDefinition('edges').getType().getFieldDefinition('node').getType();
  field.getFields().forEach(function (subfield) {
    // Suggest `edges{node{...}}` instead of `nodes{...}`.
    var subfieldType = subfield.getType();
    var isNodesLikeField = subfield.getName() !== 'edges' && subfieldType.isList() && subfieldType.getName({ modifiers: false }) === connectionNodeType.getName({ modifiers: false });
    invariant(!isNodesLikeField, 'You supplied a field named `%s` on a connection named `%s`, but ' + 'pagination is not supported on connections without using edges. Use ' + '`%s{edges{node{...}}}` instead.', subfield.getName(), field.getName(), field.getName());
  });
}

function validateMutationField(rootField) {
  var declaredArgs = rootField.getDeclaredArguments();
  var declaredArgNames = Object.keys(declaredArgs);
  invariant(declaredArgNames.length === 1, 'Your schema defines a mutation field `%s` that takes %d arguments, ' + 'but mutation fields must have exactly one argument named `input`.', rootField.getName(), declaredArgNames.length);
  invariant(declaredArgNames[0] === 'input', 'Your schema defines a mutation field `%s` that takes an argument ' + 'named `%s`, but mutation fields must have exactly one argument ' + 'named `input`.', rootField.getName(), declaredArgNames[0]);

  var rootFieldArgs = rootField.getArguments();
  invariant(rootFieldArgs.length <= 1, 'There are %d arguments supplied to the mutation field named `%s`, ' + 'but mutation fields must have exactly one `input` argument.', rootFieldArgs.length, rootField.getName());
}

function identify(str) {
  return str.split('.').reduce(function (acc, name) {
    if (!acc) {
      return t.identifier(name);
    }
    return t.memberExpression(acc, t.identifier(name));
  }, null);
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

function property(name, value) {
  return t.property('init', t.identifier(name), value);
}

function trimArguments(args) {
  var lastIndex = -1;
  for (var ii = args.length - 1; ii >= 0; ii--) {
    invariant(args[ii] != null, 'Use `NULL` to indicate that output should be the literal value `null`.');
    if (args[ii] !== NULL) {
      lastIndex = ii;
      break;
    }
  }
  return args.slice(0, lastIndex + 1);
}

module.exports = RelayQLPrinter;
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var RelayQLSubscription = _require.RelayQLSubscription;
var RelayQLType = _require.RelayQLType;


var find = require('./find');
var invariant = require('./invariant');
var util = require('util');
var RelayTransformError = require('./RelayTransformError');

var _require2 = require('./RelayQLNodeInterface');

var ID = _require2.ID;


module.exports = function (t, options) {
  var formatFields = options.snakeCase ? function (fields) {
    var formatted = {};
    Object.keys(fields).forEach(function (name) {
      formatted[name] = name.replace(/[A-Z]/g, function (letter) {
        return '_' + letter.toLowerCase();
      });
    });
    return formatted;
  } : function (fields) {
    return fields;
  };

  var EMPTY_ARRAY = t.arrayExpression([]);
  var FIELDS = formatFields({
    __typename: '__typename',
    clientMutationId: 'clientMutationId',
    clientSubscriptionId: 'clientSubscriptionId',
    cursor: 'cursor',
    edges: 'edges',
    hasNextPage: 'hasNextPage',
    hasPreviousPage: 'hasPreviousPage',
    node: 'node',
    pageInfo: 'pageInfo'
  });
  var INPUT_ARGUMENT_NAME = options.inputArgumentName || 'input';
  var NULL = t.nullLiteral();

  var RelayQLPrinter = function () {
    function RelayQLPrinter(tagName, variableNames) {
      _classCallCheck(this, RelayQLPrinter);

      this.tagName = tagName;
      this.variableNames = variableNames;
    }

    _createClass(RelayQLPrinter, [{
      key: 'print',
      value: function print(definition, substitutions) {
        var printedDocument = void 0;
        if (definition instanceof RelayQLQuery) {
          printedDocument = this.printQuery(definition);
        } else if (definition instanceof RelayQLFragment) {
          printedDocument = this.printFragment(definition);
        } else if (definition instanceof RelayQLMutation) {
          printedDocument = this.printMutation(definition);
        } else if (definition instanceof RelayQLSubscription) {
          printedDocument = this.printSubscription(definition);
        } else {
          throw new RelayTransformError(util.format('Unsupported definition: %s', definition), definition.getLocation());
        }
        return t.callExpression(t.functionExpression(null, substitutions.map(function (substitution) {
          return t.identifier(substitution.name);
        }), t.blockStatement([t.returnStatement(printedDocument)])), substitutions.map(function (substitution) {
          return substitution.value;
        }));
      }
    }, {
      key: 'printQuery',
      value: function printQuery(query) {
        var rootFields = query.getFields();
        if (rootFields.length !== 1) {
          throw new RelayTransformError(util.format('There are %d fields supplied to the query named `%s`, but queries ' + 'must have exactly one field.', rootFields.length, query.getName()), query.getLocation());
        }
        var rootField = rootFields[0];
        var rootFieldType = rootField.getType();
        var rootFieldArgs = rootField.getArguments();

        var requisiteFields = {};
        var identifyingFieldDef = rootFieldType.getIdentifyingFieldDefinition();
        if (identifyingFieldDef) {
          requisiteFields[identifyingFieldDef.getName()] = true;
        }
        if (rootFieldType.isAbstract()) {
          requisiteFields[FIELDS.__typename] = true;
        }
        var selections = this.printSelections(rootField, requisiteFields);
        var metadata = {};
        if (rootFieldType.isList()) {
          metadata.isPlural = true;
        }
        if (rootFieldType.isAbstract()) {
          metadata.isAbstract = true;
        }
        if (rootFieldArgs.length > 1) {
          throw new RelayTransformError(util.format('Invalid root field `%s`; Relay only supports root fields with zero ' + 'or one argument.', rootField.getName()), query.getLocation());
        }

        var calls = NULL;
        if (rootFieldArgs.length === 1) {
          // Until such time as a root field's 'identifying argument' (one that has
          // a 1-1 correspondence with a Relay record, or null) has a formal type,
          // assume that the lone arg in a root field's call is the identifying one.
          var identifyingArg = rootFieldArgs[0];
          var identifyingArgName = identifyingArg.getName();
          var identifyingArgType = identifyingArg.getType().getName({ modifiers: true });
          metadata.identifyingArgName = identifyingArgName;
          metadata.identifyingArgType = identifyingArgType;
          calls = t.arrayExpression([codify({
            kind: t.valueToNode('Call'),
            metadata: objectify({
              type: identifyingArgType
            }),
            name: t.valueToNode(identifyingArgName),
            value: this.printArgumentValue(identifyingArg)
          })]);
        }

        return codify({
          calls: calls,
          children: selections,
          directives: this.printDirectives(rootField.getDirectives()),
          fieldName: t.valueToNode(rootField.getName()),
          kind: t.valueToNode('Query'),
          metadata: objectify(metadata),
          name: t.valueToNode(query.getName()),
          type: t.valueToNode(rootFieldType.getName({ modifiers: false }))
        });
      }
    }, {
      key: 'printFragment',
      value: function printFragment(fragment) {
        var _this = this;

        var fragmentType = fragment.getType();

        var requisiteFields = {};
        var idFragment = void 0;
        if (fragmentType.hasField(ID)) {
          requisiteFields[ID] = true;
        } else if (shouldGenerateIdFragment(fragment, fragmentType)) {
          idFragment = fragmentType.generateIdFragment();
        }
        if (fragmentType.isAbstract()) {
          requisiteFields[FIELDS.__typename] = true;
        }
        var selections = this.printSelections(fragment, requisiteFields, idFragment ? [idFragment] : null, fragment.hasDirective('generated'));

        var relayDirective = findRelayDirective(fragment);
        var selectVariables = relayDirective && find(relayDirective.getArguments(), function (arg) {
          return arg.getName() === 'variables';
        });

        var metadata = this.printRelayDirectiveMetadata(fragment, {
          isAbstract: fragmentType.isAbstract(),
          isTrackingEnabled: !!selectVariables
        });

        var fragmentCode = codify({
          children: selections,
          directives: this.printDirectives(fragment.getDirectives()),
          id: this.printFragmentID(fragment),
          kind: t.valueToNode('Fragment'),
          metadata: metadata,
          name: t.valueToNode(fragment.getName()),
          type: t.valueToNode(fragmentType.getName({ modifiers: false }))
        });

        if (selectVariables) {
          var selectVariablesValue = selectVariables.getValue();
          if (!Array.isArray(selectVariablesValue)) {
            throw new RelayTransformError('The variables argument to the @relay directive should be an array ' + 'of strings.', fragment.getLocation());
          }
          return t.callExpression(t.memberExpression(identify(this.tagName), t.identifier('__createFragment')), [fragmentCode, t.objectExpression(selectVariablesValue.map(function (item) {
            var value = item.getValue();
            return property(value, _this.printVariable(value));
          }))]);
        }

        return fragmentCode;
      }
    }, {
      key: 'printFragmentID',
      value: function printFragmentID(fragment) {
        var staticFragmentID = fragment.getStaticFragmentID();
        if (staticFragmentID == null) {
          return t.callExpression(t.memberExpression(identify(this.tagName), t.identifier('__id')), []);
        } else {
          return t.valueToNode(staticFragmentID);
        }
      }
    }, {
      key: 'printMutation',
      value: function printMutation(mutation) {
        var rootFields = mutation.getFields();
        if (rootFields.length !== 1) {
          throw new RelayTransformError(util.format('There are %d fields supplied to the mutation named `%s`, but ' + 'mutations must have exactly one field.', rootFields.length, mutation.getName()), mutation.getLocation());
        }
        var rootField = rootFields[0];
        var rootFieldType = rootField.getType();
        validateMutationField(rootField);
        var requisiteFields = {};
        if (rootFieldType.hasField(FIELDS.clientMutationId)) {
          requisiteFields[FIELDS.clientMutationId] = true;
        }
        var selections = this.printSelections(rootField, requisiteFields);
        var metadata = {
          inputType: this.printArgumentTypeForMetadata(rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME))
        };

        return codify({
          calls: t.arrayExpression([codify({
            kind: t.valueToNode('Call'),
            metadata: objectify({}),
            name: t.valueToNode(rootField.getName()),
            value: this.printVariable('input')
          })]),
          children: selections,
          directives: this.printDirectives(mutation.getDirectives()),
          kind: t.valueToNode('Mutation'),
          metadata: objectify(metadata),
          name: t.valueToNode(mutation.getName()),
          responseType: t.valueToNode(rootFieldType.getName({ modifiers: false }))
        });
      }
    }, {
      key: 'printSubscription',
      value: function printSubscription(subscription) {
        var rootFields = subscription.getFields();
        if (rootFields.length !== 1) {
          throw new RelayTransformError(util.format('There are %d fields supplied to the subscription named `%s`, but ' + 'subscriptions must have exactly one field.', rootFields.length, subscription.getName()), subscription.getLocation());
        }
        var rootField = rootFields[0];
        var rootFieldType = rootField.getType();
        validateMutationField(rootField);
        var requisiteFields = {};
        if (rootFieldType.hasField(FIELDS.clientSubscriptionId)) {
          requisiteFields[FIELDS.clientSubscriptionId] = true;
        }
        var selections = this.printSelections(rootField, requisiteFields);
        var metadata = {
          inputType: this.printArgumentTypeForMetadata(rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME))
        };

        return codify({
          calls: t.arrayExpression([codify({
            kind: t.valueToNode('Call'),
            metadata: objectify({}),
            name: t.valueToNode(rootField.getName()),
            value: this.printVariable('input')
          })]),
          children: selections,
          directives: this.printDirectives(subscription.getDirectives()),
          kind: t.valueToNode('Subscription'),
          metadata: objectify(metadata),
          name: t.valueToNode(subscription.getName()),
          responseType: t.valueToNode(rootFieldType.getName({ modifiers: false }))
        });
      }
    }, {
      key: 'printSelections',
      value: function printSelections(parent, requisiteFields, extraFragments) {
        var _this2 = this;

        var isGeneratedQuery = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var fields = [];
        var printedFragments = [];
        var didPrintFragmentReference = false;
        parent.getSelections().forEach(function (selection) {
          if (selection instanceof RelayQLFragmentSpread) {
            // Assume that all spreads exist via template substitution.
            if (selection.getDirectives().length !== 0) {
              throw new RelayTransformError('Directives are not yet supported for `${fragment}`-style fragment ' + 'references.', selection.getLocation());
            }
            printedFragments.push(_this2.printFragmentReference(selection));
            didPrintFragmentReference = true;
          } else if (selection instanceof RelayQLInlineFragment) {
            printedFragments.push(_this2.printFragment(selection.getFragment()));
          } else if (selection instanceof RelayQLField) {
            fields.push(selection);
          } else {
            throw new RelayTransformError(util.format('Unsupported selection type `%s`.', selection), selection.getLocation());
          }
        });
        if (extraFragments) {
          extraFragments.forEach(function (fragment) {
            printedFragments.push(_this2.printFragment(fragment));
          });
        }
        var printedFields = this.printFields(fields, parent, requisiteFields, isGeneratedQuery);
        var selections = [].concat(_toConsumableArray(printedFields), printedFragments);

        if (selections.length) {
          var arrayExpressionOfSelections = t.arrayExpression(selections);
          return didPrintFragmentReference ? shallowFlatten(arrayExpressionOfSelections) : arrayExpressionOfSelections;
        }
        return NULL;
      }
    }, {
      key: 'printFields',
      value: function printFields(fields, parent, requisiteFields) {
        var _this3 = this;

        var isGeneratedQuery = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var parentType = parent.getType();
        if (parentType.isConnection() && parentType.hasField(FIELDS.pageInfo) && fields.some(function (field) {
          return field.getName() === FIELDS.edges;
        })) {
          requisiteFields[FIELDS.pageInfo] = true;
        }

        var generatedFields = _extends({}, requisiteFields);

        var printedFields = [];
        fields.forEach(function (field) {
          delete generatedFields[field.getName()];
          printedFields.push(_this3.printField(field, parent, requisiteFields, generatedFields, isGeneratedQuery));
        });

        Object.keys(generatedFields).forEach(function (fieldName) {
          var generatedField = parentType.generateField(fieldName);
          printedFields.push(_this3.printField(generatedField, parent, requisiteFields, generatedFields, isGeneratedQuery));
        });
        return printedFields;
      }
    }, {
      key: 'printField',
      value: function printField(field, parent, requisiteSiblings, generatedSiblings) {
        var _this4 = this;

        var isGeneratedQuery = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

        var fieldType = field.getType();

        var metadata = {};
        var requisiteFields = {};
        var idFragment = void 0;
        if (fieldType.hasField(ID)) {
          requisiteFields[ID] = true;
        } else if (shouldGenerateIdFragment(field, fieldType)) {
          idFragment = fieldType.generateIdFragment();
        }

        if (!isGeneratedQuery) {
          validateField(field, parent.getType());
        }

        if (fieldType.canHaveSubselections()) {
          metadata.canHaveSubselections = true;
        }
        // TODO: Generalize to non-`Node` types.
        if (fieldType.alwaysImplements('Node')) {
          metadata.inferredRootCallName = 'node';
          metadata.inferredPrimaryKey = ID;
        }
        if (fieldType.isConnection()) {
          if (field.hasDeclaredArgument('first') || field.hasDeclaredArgument('last')) {
            if (!isGeneratedQuery) {
              validateConnectionField(field);
            }
            metadata.isConnection = true;
            if (field.hasDeclaredArgument('find')) {
              metadata.isFindable = true;
            }
          }
        } else if (fieldType.isConnectionPageInfo()) {
          requisiteFields[FIELDS.hasNextPage] = true;
          requisiteFields[FIELDS.hasPreviousPage] = true;
        } else if (fieldType.isConnectionEdge()) {
          requisiteFields[FIELDS.cursor] = true;
          requisiteFields[FIELDS.node] = true;
        }
        if (fieldType.isAbstract()) {
          metadata.isAbstract = true;
          requisiteFields[FIELDS.__typename] = true;
        }
        if (fieldType.isList()) {
          metadata.isPlural = true;
        }
        if (generatedSiblings.hasOwnProperty(field.getName())) {
          metadata.isGenerated = true;
        }
        if (requisiteSiblings.hasOwnProperty(field.getName())) {
          metadata.isRequisite = true;
        }

        var selections = this.printSelections(field, requisiteFields, idFragment ? [idFragment] : null, isGeneratedQuery);
        var fieldAlias = field.getAlias();
        var args = field.getArguments();
        var calls = args.length ? t.arrayExpression(args.map(function (arg) {
          return _this4.printArgument(arg);
        })) : NULL;

        return codify({
          alias: fieldAlias ? t.valueToNode(fieldAlias) : NULL,
          calls: calls,
          children: selections,
          directives: this.printDirectives(field.getDirectives()),
          fieldName: t.valueToNode(field.getName()),
          kind: t.valueToNode('Field'),
          metadata: this.printRelayDirectiveMetadata(field, metadata),
          type: t.valueToNode(fieldType.getName({ modifiers: false }))
        });
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
        return codify({
          kind: t.valueToNode('Call'),
          metadata: objectify(metadata),
          name: t.valueToNode(arg.getName()),
          value: this.printArgumentValue(arg)
        });
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
        // Assume that variables named like substitutions are substitutions.
        if (this.variableNames.hasOwnProperty(name)) {
          return t.callExpression(t.memberExpression(identify(this.tagName), t.identifier('__var')), [t.identifier(name)]);
        }
        return codify({
          kind: t.valueToNode('CallVariable'),
          callVariableName: t.valueToNode(name)
        });
      }
    }, {
      key: 'printValue',
      value: function printValue(value) {
        var _this5 = this;

        if (Array.isArray(value)) {
          return t.arrayExpression(value.map(function (element) {
            return _this5.printArgumentValue(element);
          }));
        }
        return codify({
          kind: t.valueToNode('CallValue'),
          callValue: printLiteralValue(value)
        });
      }
    }, {
      key: 'printDirectives',
      value: function printDirectives(directives) {
        var _this6 = this;

        var printedDirectives = [];
        directives.forEach(function (directive) {
          if (directive.getName() === 'relay') {
            return;
          }
          printedDirectives.push(t.objectExpression([property('kind', t.valueToNode('Directive')), property('name', t.valueToNode(directive.getName())), property('args', t.arrayExpression(directive.getArguments().map(function (arg) {
            return t.objectExpression([property('name', t.valueToNode(arg.getName())), property('value', _this6.printArgumentValue(arg))]);
          })))]));
        });
        if (printedDirectives.length) {
          return t.arrayExpression(printedDirectives);
        }
        return NULL;
      }
    }, {
      key: 'printRelayDirectiveMetadata',
      value: function printRelayDirectiveMetadata(node, maybeMetadata) {
        var properties = [];
        var relayDirective = findRelayDirective(node);
        if (relayDirective) {
          relayDirective.getArguments().forEach(function (arg) {
            if (arg.isVariable()) {
              throw new RelayTransformError(util.format('You supplied `$%s` as the `%s` argument to the `@relay` ' + 'directive, but `@relay` require scalar argument values.', arg.getVariableName(), arg.getName()), node.getLocation());
            }
            if (arg.getName() !== 'variables') {
              properties.push(property(arg.getName(), t.valueToNode(arg.getValue())));
            }
          });
        }
        if (maybeMetadata) {
          (function () {
            var metadata = maybeMetadata;
            Object.keys(metadata).forEach(function (key) {
              if (metadata[key]) {
                properties.push(property(key, t.valueToNode(metadata[key])));
              }
            });
          })();
        }
        return t.objectExpression(properties);
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
  }();

  /**
   * Determine if a `... on Node { id }` fragment should be generated for a
   * field/fragment to allow identification of the response record. This
   * fragment should be added when some/all implementors of the node's type
   * also implement `Node` but a `Node` fragment is not already present. If it
   * is present then `id` would be added as a requisite field.
   */


  function shouldGenerateIdFragment(node) {
    return node.getType().mayImplement('Node') && !node.getSelections().some(function (selection) {
      return selection instanceof RelayQLInlineFragment && selection.getFragment().getType().getName({ modifiers: false }) === 'Node';
    });
  }

  function validateField(field, parentType) {
    if (field.getName() === 'node') {
      var argTypes = field.getDeclaredArguments();
      var argNames = Object.keys(argTypes);
      if (argNames.length === 1 && argNames[0] === ID) {
        throw new RelayTransformError(util.format('You defined a `node(%s: %s)` field on type `%s`, but Relay requires ' + 'the `node` field to be defined on the root type. See the Object ' + 'Identification Guide: \n' + 'http://facebook.github.io/relay/docs/graphql-object-identification.html', ID, argNames[0] && argTypes[argNames[0]].getName({ modifiers: true }), parentType.getName({ modifiers: false })), field.getLocation());
      }
    }
  }

  function validateConnectionField(field) {
    var first = field.findArgument('first');
    var last = field.findArgument('last');
    var before = field.findArgument('before');
    var after = field.findArgument('after');

    var condition = !first || !last || first.isVariable() && last.isVariable();
    if (!condition) {
      throw new RelayTransformError(util.format('Connection arguments `%s(first: <count>, last: <count>)` are ' + 'not supported unless both are variables. Use `(first: <count>)`, ' + '`(last: <count>)`, or `(first: $<var>, last: $<var>)`.', field.getName()), field.getLocation());
    }
    condition = !first || !before || first.isVariable() && before.isVariable();
    if (!condition) {
      throw new RelayTransformError(util.format('Connection arguments `%s(before: <cursor>, first: <count>)` are ' + 'not supported unless both are variables. Use `(first: <count>)`, ' + '`(after: <cursor>, first: <count>)`, `(before: <cursor>, last: <count>)`, ' + 'or `(before: $<var>, first: $<var>)`.', field.getName()), field.getLocation());
    }
    condition = !last || !after || last.isVariable() && after.isVariable();
    if (!condition) {
      throw new RelayTransformError(util.format('Connection arguments `%s(after: <cursor>, last: <count>)` are ' + 'not supported unless both are variables. Use `(last: <count>)`, ' + '`(before: <cursor>, last: <count>)`, `(after: <cursor>, first: <count>)`, ' + 'or `(after: $<var>, last: $<var>)`.', field.getName()), field.getLocation());
    }

    // Use `any` because we already check `isConnection` before validating.
    var connectionNodeType = field.getType().getFieldDefinition(FIELDS.edges).getType().getFieldDefinition(FIELDS.node).getType();

    // NOTE: These checks are imperfect because we cannot trace fragment spreads.
    forEachRecursiveField(field, function (subfield) {
      if (subfield.getName() === FIELDS.edges || subfield.getName() === FIELDS.pageInfo) {
        var _condition = field.isPattern() || field.hasArgument('find') || field.hasArgument('first') || field.hasArgument('last');

        if (!_condition) {
          throw new RelayTransformError(util.format('You supplied the `%s` field on a connection named `%s`, but you did ' + 'not supply an argument necessary to do so. Use either the `find`, ' + '`first`, or `last` argument.', subfield.getName(), field.getName()), field.getLocation());
        }
      } else {
        // Suggest `edges{node{...}}` instead of `nodes{...}`.
        var subfieldType = subfield.getType();
        var isNodesLikeField = subfieldType.isList() && subfieldType.getName({ modifiers: false }) === connectionNodeType.getName({ modifiers: false });

        if (isNodesLikeField) {
          throw new RelayTransformError(util.format('You supplied a field named `%s` on a connection named `%s`, but ' + 'pagination is not supported on connections without using `%s`. ' + 'Use `%s{%s{%s{...}}}` instead.', subfield.getName(), field.getName(), FIELDS.edges, field.getName(), FIELDS.edges, FIELDS.node), field.getLocation());
        }
      }
    });
  }

  function validateMutationField(rootField) {
    var declaredArgs = rootField.getDeclaredArguments();
    var declaredArgNames = Object.keys(declaredArgs);
    if (declaredArgNames.length !== 1) {
      throw new RelayTransformError(util.format('Your schema defines a mutation field `%s` that takes %d arguments, ' + 'but mutation fields must have exactly one argument named `%s`.', rootField.getName(), declaredArgNames.length, INPUT_ARGUMENT_NAME), rootField.getLocation());
    }

    if (declaredArgNames[0] !== INPUT_ARGUMENT_NAME) {
      throw new RelayTransformError(util.format('Your schema defines a mutation field `%s` that takes an argument ' + 'named `%s`, but mutation fields must have exactly one argument ' + 'named `%s`.', rootField.getName(), declaredArgNames[0], INPUT_ARGUMENT_NAME), rootField.getLocation());
    }

    var rootFieldArgs = rootField.getArguments();
    if (rootFieldArgs.length > 1) {
      throw new RelayTransformError(util.format('There are %d arguments supplied to the mutation field named `%s`, ' + 'but mutation fields must have exactly one `%s` argument.', rootFieldArgs.length, rootField.getName(), INPUT_ARGUMENT_NAME), rootField.getLocation());
    }
  }

  var forEachRecursiveField = function forEachRecursiveField(selection, callback) {
    selection.getSelections().forEach(function (selection) {
      if (selection instanceof RelayQLField) {
        callback(selection);
      } else if (selection instanceof RelayQLInlineFragment) {
        forEachRecursiveField(selection.getFragment(), callback);
      }
      // Ignore `RelayQLFragmentSpread` selections.
    });
  };

  function codify(obj) {
    var properties = [];
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (value !== NULL) {
        properties.push(property(key, value));
      }
    });
    return t.objectExpression(properties);
  }

  function identify(str) {
    // $FlowFixMe
    return str.split('.').reduce(function (acc, name) {
      if (!acc) {
        return t.identifier(name);
      }
      return t.memberExpression(acc, t.identifier(name));
    }, null);
  }

  function objectify(obj) {
    var properties = [];
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (value) {
        properties.push(property(key, t.valueToNode(value)));
      }
    });
    return t.objectExpression(properties);
  }

  function property(name, value) {
    return t.objectProperty(t.identifier(name), value);
  }

  function printLiteralValue(value) {
    if (value == null) {
      return NULL;
    } else if (Array.isArray(value)) {
      return t.arrayExpression(value.map(printLiteralValue));
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value != null) {
      var _ret2 = function () {
        var objectValue = value;
        return {
          v: t.objectExpression(Object.keys(objectValue).map(function (key) {
            return property(key, printLiteralValue(objectValue[key]));
          }))
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    } else {
      return t.valueToNode(value);
    }
  }

  function shallowFlatten(arr) {
    return t.callExpression(t.memberExpression(t.memberExpression(EMPTY_ARRAY, t.identifier('concat')), t.identifier('apply')), [EMPTY_ARRAY, arr]);
  }

  function findRelayDirective(node) {
    return find(node.getDirectives(), function (directive) {
      return directive.getName() === 'relay';
    });
  }

  return RelayQLPrinter;
};
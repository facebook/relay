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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelayQLPrinter = require('./RelayQLPrinter');

var invariant = require('./invariant');
var util = require('./util');

var _require = require('./RelayQLAST'),
    RelayQLDefinition = _require.RelayQLDefinition,
    RelayQLFragment = _require.RelayQLFragment,
    RelayQLMutation = _require.RelayQLMutation,
    RelayQLQuery = _require.RelayQLQuery,
    RelayQLSubscription = _require.RelayQLSubscription;

var _require2 = require('graphql'),
    formatError = _require2.formatError,
    parse = _require2.parse,
    Source = _require2.Source,
    validate = _require2.validate;

var GraphQLWrapper = {
  error: require('graphql/error'),
  language: require('graphql/language'),
  language_parser: require('graphql/language/parser'),
  language_source: require('graphql/language/source'),
  type: require('graphql/type'),
  type_definition: require('graphql/type/definition'),
  type_directives: require('graphql/type/directives'),
  type_introspection: require('graphql/type/introspection'),
  type_scalars: require('graphql/type/scalars'),
  utilities: require('graphql/utilities'),
  utilities_buildClientSchema: require('graphql/utilities/buildClientSchema'),
  utilities_buildASTSchema: require('graphql/utilities/buildASTSchema'),
  validation: require('graphql/validation'),
  validation_rules_KnownFragmentNames: require('graphql/validation/rules/KnownFragmentNames'),
  validation_rules_NoUndefinedVariables: require('graphql/validation/rules/NoUndefinedVariables'),
  validation_rules_NoUnusedFragments: require('graphql/validation/rules/NoUnusedFragments'),
  validation_rules_ScalarLeafs: require('graphql/validation/rules/ScalarLeafs'),
  validation_validate: require('graphql/validation/validate')
};

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a Babel AST via RelayQLPrinter.
 */
var RelayQLTransformer = function () {
  function RelayQLTransformer(schema, options) {
    _classCallCheck(this, RelayQLTransformer);

    this.schema = schema;
    this.options = options;
  }

  _createClass(RelayQLTransformer, [{
    key: 'transform',
    value: function transform(t, // Babel
    node, options) {
      var _processTemplateLiter = this.processTemplateLiteral(node, options.documentName),
          substitutions = _processTemplateLiter.substitutions,
          templateText = _processTemplateLiter.templateText,
          variableNames = _processTemplateLiter.variableNames;

      var documentText = this.processTemplateText(templateText, options);
      var definition = this.processDocumentText(documentText, options);

      var Printer = RelayQLPrinter(t, this.options);
      return new Printer(options.tagName, variableNames).print(definition, substitutions, options.enableValidation);
    }

    /**
     * Convert TemplateLiteral into a single template string with substitution
     * names, a matching array of substituted values, and a set of substituted
     * variable names.
     */

  }, {
    key: 'processTemplateLiteral',
    value: function processTemplateLiteral(node, documentName) {
      var _this = this;

      var chunks = [];
      var variableNames = {};
      var substitutions = [];
      node.quasis.forEach(function (element, ii) {
        var chunk = element.value.cooked;
        chunks.push(chunk);
        if (!element.tail) {
          var name = 'RQL_' + ii;
          var _value = node.expressions[ii];
          substitutions.push({ name: name, value: _value });
          if (/:\s*$/.test(chunk)) {
            invariant(_this.options.substituteVariables, 'You supplied a GraphQL document named `%s` that uses template ' + 'substitution for an argument value, but variable substitution ' + 'has not been enabled.', documentName);
            chunks.push('$' + name);
            variableNames[name] = undefined;
          } else {
            chunks.push('...' + name);
          }
        }
      });
      return { substitutions: substitutions, templateText: chunks.join('').trim(), variableNames: variableNames };
    }

    /**
     * Converts the template string into a valid GraphQL document string.
     */

  }, {
    key: 'processTemplateText',
    value: function processTemplateText(templateText, _ref) {
      var documentName = _ref.documentName,
          propName = _ref.propName;

      var pattern = /^(fragment|mutation|query|subscription)\s*(\w*)?([\s\S]*)/;
      var matches = pattern.exec(templateText);
      invariant(matches, 'You supplied a GraphQL document named `%s` with invalid syntax. It ' + 'must start with `fragment`, `mutation`, `query`, or `subscription`.', documentName);
      var type = matches[1];
      var name = matches[2] || documentName;
      var rest = matches[3];
      // Allow `fragment on Type {...}`.
      if (type === 'fragment' && name === 'on') {
        name = documentName + (propName ? '_' + capitalize(propName) : '') + 'RelayQL';
        rest = 'on' + rest;
      }
      var definitionName = capitalize(name);
      return type + ' ' + definitionName + ' ' + rest;
    }

    /**
     * Parses the GraphQL document string into a RelayQLDocument.
     */

  }, {
    key: 'processDocumentText',
    value: function processDocumentText(documentText, _ref2) {
      var documentName = _ref2.documentName,
          enableValidation = _ref2.enableValidation;

      var document = parse(new Source(documentText, documentName));
      var validationErrors = enableValidation ? this.validateDocument(document, documentName) : null;
      if (validationErrors) {
        var error = new Error(util.format('You supplied a GraphQL document named `%s` with validation errors.', documentName));
        error.validationErrors = validationErrors;
        error.sourceText = documentText;
        throw error;
      }
      var definition = document.definitions[0];

      var context = {
        definitionName: capitalize(documentName),
        isPattern: false,
        generateID: createIDGenerator(),
        schema: this.schema
      };
      if (definition.kind === 'FragmentDefinition') {
        return new RelayQLFragment(context, definition);
      } else if (definition.kind === 'OperationDefinition') {
        if (definition.operation === 'mutation') {
          return new RelayQLMutation(context, definition);
        } else if (definition.operation === 'query') {
          return new RelayQLQuery(context, definition);
        } else if (definition.operation === 'subscription') {
          return new RelayQLSubscription(context, definition);
        } else {
          invariant(false, 'Unsupported operation: %s', definition.operation);
        }
      } else {
        invariant(false, 'Unsupported definition kind: %s', definition.kind);
      }
    }
  }, {
    key: 'validateDocument',
    value: function validateDocument(document, documentName) {
      invariant(document.definitions.length === 1, 'You supplied a GraphQL document named `%s` with %d definitions, but ' + 'it must have exactly one definition.', documentName, document.definitions.length);
      var definition = document.definitions[0];
      var isMutation = definition.kind === 'OperationDefinition' && definition.operation === 'mutation';

      var validator = this.options.validator;
      var validationErrors = void 0;
      if (validator) {
        validationErrors = validator(GraphQLWrapper).validate(this.schema, document);
      } else {
        var rules = [require('graphql/validation/rules/ArgumentsOfCorrectType').ArgumentsOfCorrectType, require('graphql/validation/rules/DefaultValuesOfCorrectType').DefaultValuesOfCorrectType, require('graphql/validation/rules/FieldsOnCorrectType').FieldsOnCorrectType, require('graphql/validation/rules/FragmentsOnCompositeTypes').FragmentsOnCompositeTypes, require('graphql/validation/rules/KnownArgumentNames').KnownArgumentNames, require('graphql/validation/rules/KnownTypeNames').KnownTypeNames, require('graphql/validation/rules/PossibleFragmentSpreads').PossibleFragmentSpreads, require('graphql/validation/rules/VariablesInAllowedPosition').VariablesInAllowedPosition];
        if (!isMutation) {
          rules.push(require('graphql/validation/rules/ProvidedNonNullArguments').ProvidedNonNullArguments);
        }
        validationErrors = validate(this.schema, document, rules);
      }

      if (validationErrors && validationErrors.length > 0) {
        return validationErrors.map(formatError);
      }
      return null;
    }
  }]);

  return RelayQLTransformer;
}();

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

/**
 * Utility to generate locally scoped auto-incrementing IDs.
 */
function createIDGenerator() {
  var _id = 0;
  return function () {
    return (_id++).toString(32);
  };
}

module.exports = RelayQLTransformer;
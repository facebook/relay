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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var GraphQL = require('./GraphQL');
var formatError = GraphQL.error.formatError;
var parser = GraphQL.language_parser;
var Source = GraphQL.language_source.Source;
var validate = GraphQL.validation.validate;

var _require = require('./RelayQLAST');

var RelayQLDefinition = _require.RelayQLDefinition;
var RelayQLFragment = _require.RelayQLFragment;
var RelayQLMutation = _require.RelayQLMutation;
var RelayQLQuery = _require.RelayQLQuery;
var RelayQLSubscription = _require.RelayQLSubscription;

var RelayQLPrinter = require('./RelayQLPrinter');

var invariant = require('./invariant');
var util = require('util');

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a Babel AST via RelayQLPrinter.
 */

var RelayQLTransformer = (function () {
  function RelayQLTransformer(schema, options) {
    _classCallCheck(this, RelayQLTransformer);

    this.schema = schema;
    this.options = options;
  }

  _createClass(RelayQLTransformer, [{
    key: 'transform',
    value: function transform(t, // Babel
    node, documentName, tagName) {
      var _processTemplateLiteral = this.processTemplateLiteral(node, documentName);

      var substitutions = _processTemplateLiteral.substitutions;
      var templateText = _processTemplateLiteral.templateText;
      var variableNames = _processTemplateLiteral.variableNames;

      var documentText = this.processTemplateText(templateText, documentName);
      var definition = this.processDocumentText(documentText, documentName);

      var Printer = RelayQLPrinter(t, this.options);
      return new Printer(tagName, variableNames).print(definition, substitutions);
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
          var _name = 'RQL_' + ii;
          var _value = node.expressions[ii];
          substitutions.push({ name: _name, value: _value });
          if (/:\s*$/.test(chunk)) {
            invariant(_this.options.substituteVariables, 'You supplied a GraphQL document named `%s` that uses template ' + 'substitution for an argument value, but variable substitution ' + 'has not been enabled.', documentName);
            chunks.push('$' + _name);
            variableNames[_name] = undefined;
          } else {
            chunks.push('...' + _name);
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
    value: function processTemplateText(templateText, documentName) {
      var pattern = /^(fragment|mutation|query|subscription)\s*(\w*)?([\s\S]*)/;
      var matches = pattern.exec(templateText);
      invariant(matches, 'You supplied a GraphQL document named `%s` with invalid syntax. It ' + 'must start with `fragment`, `mutation`, `query`, or `subscription`.', documentName);
      var type = matches[1];
      var name = matches[2] || documentName;
      var rest = matches[3];
      // Allow `fragment on Type {...}`.
      if (type === 'fragment' && name === 'on') {
        name = documentName;
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
    value: function processDocumentText(documentText, documentName) {
      var document = parser.parse(new Source(documentText, documentName));
      var validationErrors = this.validateDocument(document);
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
    value: function validateDocument(document) {
      invariant(document.definitions.length === 1, 'You supplied a GraphQL document named `%s` with %d definitions, but ' + 'it must have exactly one definition.', document.definitions.length);
      var definition = document.definitions[0];
      var isMutation = definition.kind === 'OperationDefinition' && definition.operation === 'mutation';

      var validator = this.options.validator;
      var validationErrors = undefined;
      if (validator) {
        var _validator = validator(GraphQL);

        var _validate = _validator.validate;

        validationErrors = _validate(this.schema, document);
      } else {
        var rules = [require('graphql/validation/rules/ArgumentsOfCorrectType').ArgumentsOfCorrectType, require('graphql/validation/rules/DefaultValuesOfCorrectType').DefaultValuesOfCorrectType, require('graphql/validation/rules/FieldsOnCorrectType').FieldsOnCorrectType, require('graphql/validation/rules/FragmentsOnCompositeTypes').FragmentsOnCompositeTypes, require('graphql/validation/rules/KnownArgumentNames').KnownArgumentNames, require('graphql/validation/rules/KnownTypeNames').KnownTypeNames, require('graphql/validation/rules/PossibleFragmentSpreads').PossibleFragmentSpreads, require('graphql/validation/rules/PossibleFragmentSpreads').PossibleFragmentSpreads, require('graphql/validation/rules/VariablesInAllowedPosition').VariablesInAllowedPosition];
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
})();

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

module.exports = RelayQLTransformer;
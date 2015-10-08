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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('./RelayQLAST');

var RelayQLDefinition = _require.RelayQLDefinition;
var RelayQLFragment = _require.RelayQLFragment;
var RelayQLMutation = _require.RelayQLMutation;
var RelayQLQuery = _require.RelayQLQuery;

var RelayQLPrinter = require('./RelayQLPrinter');

var formatError = require('graphql/error').formatError;
var parser = require('graphql/language/parser');
var Source = require('graphql/language/source').Source;
var validate = require('graphql/validation/validate').validate;
var invariant = require('./invariant');
var util = require('util');

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a Babel AST via RelayQLPrinter.
 */

var RelayQLTransformer = (function () {
  function RelayQLTransformer(schema) {
    _classCallCheck(this, RelayQLTransformer);

    this.schema = schema;
  }

  _createClass(RelayQLTransformer, [{
    key: 'transform',
    value: function transform(node, documentName, tagName) {
      var _processTemplateLiteral = this.processTemplateLiteral(node);

      var templateText = _processTemplateLiteral.templateText;
      var substitutions = _processTemplateLiteral.substitutions;

      var documentText = this.processTemplateText(templateText, documentName);
      var definition = this.processDocumentText(documentText, documentName);
      return new RelayQLPrinter(tagName).print(definition, substitutions);
    }

    /**
     * Convert TemplateLiteral into a single template string with substitution
     * names and a matching array of substituted values.
     */
  }, {
    key: 'processTemplateLiteral',
    value: function processTemplateLiteral(node) {
      var chunks = [];
      var substitutions = [];
      node.quasis.forEach(function (element, ii) {
        chunks.push(element.value.cooked);
        if (!element.tail) {
          var _name = 'sub_' + ii;
          var _value = node.expressions[ii];
          substitutions.push({ name: _name, value: _value });
          chunks.push('...' + _name);
        }
      });
      return { substitutions: substitutions, templateText: chunks.join('').trim() };
    }

    /**
     * Converts the template string into a valid GraphQL document string.
     */
  }, {
    key: 'processTemplateText',
    value: function processTemplateText(templateText, documentName) {
      var matches = /^(fragment|mutation|query)\s*(\w*)?([\s\S]*)/.exec(templateText);
      invariant(matches, 'You supplied a GraphQL document named `%s` with invalid syntax. It ' + 'must start with `fragment`, `mutation`, or `query`.', documentName);
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
        schema: this.schema
      };
      if (definition.kind === 'FragmentDefinition') {
        return new RelayQLFragment(context, definition);
      } else if (definition.kind === 'OperationDefinition') {
        if (definition.operation === 'mutation') {
          return new RelayQLMutation(context, definition);
        } else if (definition.operation === 'query') {
          return new RelayQLQuery(context, definition);
        } else {
          invariant(false, 'Unsupported operation: %s', definition.operation);
        }
      } else {
        console.log(definition);
        invariant(false, 'Unsupported definition kind: %s', definition.kind);
      }
    }
  }, {
    key: 'validateDocument',
    value: function validateDocument(document) {
      invariant(document.definitions.length === 1, 'You supplied a GraphQL document named `%s` with %d definitions, but ' + 'it must have exactly one definition.', document.definitions.length);
      var definition = document.definitions[0];
      var isMutation = definition.kind === 'OperationDefinition' && definition.operation === 'mutation';

      var rules = [require('graphql/validation/rules/ArgumentsOfCorrectType').ArgumentsOfCorrectType, require('graphql/validation/rules/DefaultValuesOfCorrectType').DefaultValuesOfCorrectType, require('graphql/validation/rules/FieldsOnCorrectType').FieldsOnCorrectType, require('graphql/validation/rules/FragmentsOnCompositeTypes').FragmentsOnCompositeTypes, require('graphql/validation/rules/KnownArgumentNames').KnownArgumentNames, require('graphql/validation/rules/KnownTypeNames').KnownTypeNames, require('graphql/validation/rules/PossibleFragmentSpreads').PossibleFragmentSpreads, require('graphql/validation/rules/PossibleFragmentSpreads').PossibleFragmentSpreads, require('graphql/validation/rules/VariablesInAllowedPosition').VariablesInAllowedPosition];
      if (!isMutation) {
        rules.push(require('graphql/validation/rules/ProvidedNonNullArguments').ProvidedNonNullArguments);
      }
      var validationErrors = validate(this.schema, document, rules);
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
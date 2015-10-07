/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

var RelayQLPrinter = require('./RelayQLPrinter');
var {
  RelayQLFragment,
  RelayQLMutation,
  RelayQLQuery,
} = require('./RelayQLAST');

var assert = require('assert');
var formatError = require('graphql/error').formatError;
var parser = require('graphql/language/parser');
var Source = require('graphql/language/source').Source;
var validate = require('graphql/validation/validate').validate;
var util = require('util');

function RelayQLTransformer(schema /*: GraphQLSchema */) {
  this.schema = schema;
}

RelayQLTransformer.prototype.transformQuery = function(
  queryAndSubstitutions,
  documentName, /*: string */
  tagName /*: string */
) /*: string */ {
  const substitutions = queryAndSubstitutions.substitutions;
  const text = queryAndSubstitutions.text;

  const document = this.parseDocument(text, documentName);
  const printer = new RelayQLPrinter(tagName);
  return printer.print(document, substitutions);
};

RelayQLTransformer.prototype.parseDocument = function(
  query, /*: string */
  documentName /*: string */
) /*: string */ {
  const match = /^(fragment|mutation|query)\s*(\w*)?([\s\S]*)/.exec(query)
  assert(
    match,
    util.format(
      'GraphQL: expected query `%s...` to start with a document type. ' +
      'Specify `fragment`, `mutation`, or `query`.',
      query.substr(0, 20)
    )
  );
  const type = match[1];
  let name = match[2] || documentName;
  let rest = match[3];

  if (type === 'fragment' && name === 'on') {
    // Allow `fragment on User {...}`
    rest = 'on' + rest;
    name = documentName;
  }

  name = this.getName(name);
  const queryText = type + ' ' + name + ' ' + rest;
  const ast = parse(type, queryText, this.schema).definitions[0];

  const context = {
    documentName: name,
    schema: this.schema,
  };
  switch (type) {
    case 'fragment':
      return new RelayQLFragment(context, ast);
    case 'mutation':
      return new RelayQLMutation(context, ast);
    case 'query':
      return new RelayQLQuery(context, ast);
  }
  throw new Error(util.format('Unsupported type: %s', type));
};

RelayQLTransformer.prototype.getName = function(
  documentName /*: string */
) /*: string */ {
  if (!documentName || !documentName.length) {
    throw new Error('RelayQLTransformer: expected document to have a name.');
  }
  return documentName[0].toUpperCase() + documentName.slice(1);
};

/**
 * Parses a query document into an AST, returning the AST plus any validation
 * errors.
 */
function parse(
  type, /*: string */
  text, /*: string */
  schema /*: GraphQLSchema */
) /*: any */ {
  var source = new Source(text, 'GraphQL Document');
  var documentAST = parser.parse(source);
  var rules = [
    require(
      'graphql/validation/rules/ArgumentsOfCorrectType'
    ).ArgumentsOfCorrectType,
    require(
      'graphql/validation/rules/DefaultValuesOfCorrectType'
    ).DefaultValuesOfCorrectType,
    require(
      'graphql/validation/rules/FieldsOnCorrectType'
    ).FieldsOnCorrectType,
    require(
      'graphql/validation/rules/FragmentsOnCompositeTypes'
    ).FragmentsOnCompositeTypes,
    require(
      'graphql/validation/rules/KnownArgumentNames'
    ).KnownArgumentNames,
    require(
      'graphql/validation/rules/KnownTypeNames'
    ).KnownTypeNames,
    require(
      'graphql/validation/rules/PossibleFragmentSpreads'
    ).PossibleFragmentSpreads,
    require(
      'graphql/validation/rules/PossibleFragmentSpreads'
    ).PossibleFragmentSpreads,
    require(
      'graphql/validation/rules/VariablesInAllowedPosition'
    ).VariablesInAllowedPosition,
  ];
  if (type !== 'mutation') {
    rules.push(
      require(
        'graphql/validation/rules/ProvidedNonNullArguments'
      ).ProvidedNonNullArguments
    );
  }
  var validationErrors = validate(schema, documentAST, rules);
  if (validationErrors && validationErrors.length > 0) {
    validationErrors = validationErrors.map(formatError);
    var error = new Error('This document is invalid');
    error.validationErrors = validationErrors;
    error.sourceText = text;
    throw error;
  }
  return documentAST;
}

module.exports = RelayQLTransformer;

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const {
  RelayQLDefinition,
  RelayQLFragment,
  RelayQLMutation,
  RelayQLQuery,
} = require('./RelayQLAST');
const RelayQLPrinter = require('./RelayQLPrinter');

const formatError = require('graphql/error').formatError;
const parser = require('graphql/language/parser');
const Source = require('graphql/language/source').Source;
const validate = require('graphql/validation/validate').validate;
const invariant = require('./invariant');
const util = require('util');

import type {Document as GraphQLDocument} from 'GraphQLAST';
import type {Printable, Substitution} from './RelayQLPrinter';

type GraphQLAST = Object;
type GraphQLLocation = {
  column: number;
  line: number;
};
type GraphQLSchema = Object;
type GraphQLValidationError = {
  message: string;
  locations: Array<GraphQLLocation>;
};

type TemplateLiteral = {
  type: 'TemplateElement';
  quasis: Array<TemplateElement>;
  expressions: Array<Printable>;
  range: [number, number];
  loc: Object;
};
type TemplateElement = {
  type: 'TemplateElement';
  value: {
    raw: string;
    cooked: string;
  };
  tail: boolean;
  range: [number, number];
  loc: Object;
};

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a Babel AST via RelayQLPrinter.
 */
class RelayQLTransformer {
  schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this.schema = schema;
  }

  transform(
    node: TemplateLiteral,
    documentName: string,
    tagName: string
  ): Printable {
    const {templateText, substitutions} = this.processTemplateLiteral(node);
    const documentText = this.processTemplateText(templateText, documentName);
    const definition = this.processDocumentText(documentText, documentName);
    return new RelayQLPrinter(tagName).print(definition, substitutions);
  }

  /**
   * Convert TemplateLiteral into a single template string with substitution
   * names and a matching array of substituted values.
   */
  processTemplateLiteral(
    node: TemplateLiteral
  ): {
    substitutions: Array<Substitution>;
    templateText: string;
  } {
    const chunks = [];
    const substitutions = [];
    node.quasis.forEach((element, ii) => {
      chunks.push(element.value.cooked);
      if (!element.tail) {
        const name = 'sub_' + ii;
        const value = node.expressions[ii];
        substitutions.push({name, value});
        chunks.push('...' + name);
      }
    });
    return {substitutions, templateText: chunks.join('').trim()};
  }

  /**
   * Converts the template string into a valid GraphQL document string.
   */
  processTemplateText(
    templateText: string,
    documentName: string
  ): string {
    const matches =
      /^(fragment|mutation|query)\s*(\w*)?([\s\S]*)/.exec(templateText);
    invariant(
      matches,
      'You supplied a GraphQL document named `%s` with invalid syntax. It ' +
      'must start with `fragment`, `mutation`, or `query`.',
      documentName
    );
    const type = matches[1];
    let name = matches[2] || documentName;
    let rest = matches[3];
    // Allow `fragment on Type {...}`.
    if (type === 'fragment' && name === 'on') {
      name = documentName;
      rest = 'on' + rest;
    }
    const definitionName = capitalize(name);
    return type + ' ' + definitionName + ' ' + rest;
  }

  /**
   * Parses the GraphQL document string into a RelayQLDocument.
   */
  processDocumentText(
    documentText: string,
    documentName: string
  ): RelayQLDefinition {
    const document = parser.parse(new Source(documentText, documentName));
    const validationErrors = this.validateDocument(document);
    if (validationErrors) {
      const error = new Error(util.format(
        'You supplied a GraphQL document named `%s` with validation errors.',
        documentName
      ));
      (error: any).validationErrors = validationErrors;
      (error: any).sourceText = documentText;
      throw error;
    }
    const definition = document.definitions[0];

    const context = {
      definitionName: capitalize(documentName),
      schema: this.schema,
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

  validateDocument(document: GraphQLDocument): ?Array<GraphQLValidationError> {
    invariant(
      document.definitions.length === 1,
      'You supplied a GraphQL document named `%s` with %d definitions, but ' +
      'it must have exactly one definition.',
      document.definitions.length
    );
    const definition = document.definitions[0];
    const isMutation =
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation';

    const rules = [
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
    if (!isMutation) {
      rules.push(
        require(
          'graphql/validation/rules/ProvidedNonNullArguments'
        ).ProvidedNonNullArguments
      );
    }
    const validationErrors = validate(this.schema, document, rules);
    if (validationErrors && validationErrors.length > 0) {
      return validationErrors.map(formatError);
    }
    return null;
  }

}

function capitalize(string: string): string {
  return string[0].toUpperCase() + string.slice(1);
}

module.exports = RelayQLTransformer;

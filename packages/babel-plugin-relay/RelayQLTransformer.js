/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const RelayQLPrinter = require('./RelayQLPrinter');

const invariant = require('./invariant');
const util = require('util');

const {
  RelayQLDefinition,
  RelayQLFragment,
  RelayQLMutation,
  RelayQLQuery,
  RelayQLSubscription,
} = require('./RelayQLAST');
const {
  formatError,
  parse,
  Source,
  validate,
  ArgumentsOfCorrectTypeRule,
  DefaultValuesOfCorrectTypeRule,
  FieldsOnCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownArgumentNamesRule,
  KnownTypeNamesRule,
  PossibleFragmentSpreadsRule,
  VariablesInAllowedPositionRule,
  ProvidedNonNullArgumentsRule,
} = require('graphql');

import type {Printable, Substitution} from './RelayQLPrinter';
import type {
  DocumentNode,
  GraphQLError,
  GraphQLFormattedError,
  GraphQLSchema,
} from 'graphql';

type TemplateLiteral = {
  type: 'TemplateElement',
  quasis: Array<TemplateElement>,
  expressions: Array<Printable>,
  range: [number, number],
  loc: Object,
};
type TemplateElement = {
  type: 'TemplateElement',
  value: {
    raw: string,
    cooked: string,
  },
  tail: boolean,
  range: [number, number],
  loc: Object,
};
export type Validator<T> = () => ({
  validate: (schema: GraphQLSchema, ast: T) => Array<GraphQLError>,
});

type TransformerOptions = {
  inputArgumentName: ?string,
  snakeCase: boolean,
  substituteVariables: boolean,
  validator: ?Validator<any>,
};
type TextTransformOptions = {
  documentName: string,
  enableValidation: boolean,
  propName: ?string,
  tagName: string,
};

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a Babel AST via RelayQLPrinter.
 */
class RelayQLTransformer {
  schema: GraphQLSchema;
  options: TransformerOptions;

  constructor(schema: GraphQLSchema, options: TransformerOptions) {
    this.schema = schema;
    this.options = options;
  }

  transform(
    t: any, // Babel
    node: TemplateLiteral,
    options: TextTransformOptions
  ): Printable {
    const {
      substitutions,
      templateText,
      variableNames,
    } = this.processTemplateLiteral(node, options.documentName);
    const documentText = this.processTemplateText(templateText, options);
    const definition = this.processDocumentText(documentText, options);

    const Printer = RelayQLPrinter(t, this.options);
    return new Printer(options.tagName, variableNames)
      .print(definition, substitutions, options.enableValidation);
  }

  /**
   * Convert TemplateLiteral into a single template string with substitution
   * names, a matching array of substituted values, and a set of substituted
   * variable names.
   */
  processTemplateLiteral(
    node: TemplateLiteral,
    documentName: string
  ): {
    substitutions: Array<Substitution>,
    templateText: string,
    variableNames: {[variableName: string]: void},
  } {
    const chunks = [];
    const variableNames = {};
    const substitutions = [];
    node.quasis.forEach((element, ii) => {
      const chunk = element.value.cooked;
      chunks.push(chunk);
      if (!element.tail) {
        const name = 'RQL_' + ii;
        const value = node.expressions[ii];
        substitutions.push({name, value});
        if (/:\s*$/.test(chunk)) {
          invariant(
            this.options.substituteVariables,
            'You supplied a GraphQL document named `%s` that uses template ' +
            'substitution for an argument value, but variable substitution ' +
            'has not been enabled.',
            documentName
          );
          chunks.push('$' + name);
          variableNames[name] = undefined;
        } else {
          chunks.push('...' + name);
        }
      }
    });
    return {substitutions, templateText: chunks.join('').trim(), variableNames};
  }

  /**
   * Converts the template string into a valid GraphQL document string.
   */
  processTemplateText(
    templateText: string,
    {documentName, propName}: TextTransformOptions
  ): string {
    const pattern = /^(fragment|mutation|query|subscription)\s*(\w*)?([\s\S]*)/;
    const matches = pattern.exec(templateText);
    invariant(
      matches,
      'You supplied a GraphQL document named `%s` with invalid syntax. It ' +
      'must start with `fragment`, `mutation`, `query`, or `subscription`.',
      documentName
    );
    const type = matches[1];
    let name = matches[2] || documentName;
    let rest = matches[3];
    // Allow `fragment on Type {...}`.
    if (type === 'fragment' && name === 'on') {
      name = documentName +
        (propName ? '_' + capitalize(propName) : '') +
        'RelayQL';
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
    {documentName, enableValidation}: TextTransformOptions
  ): RelayQLDefinition<any> {
    const document = parse(new Source(documentText, documentName));
    const validationErrors = enableValidation ?
      this.validateDocument(document, documentName) :
      null;
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
      isPattern: false,
      generateID: createIDGenerator(),
      schema: this.schema,
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

  validateDocument(
    document: DocumentNode,
    documentName: string,
  ): ?Array<GraphQLFormattedError> {
    invariant(
      document.definitions.length === 1,
      'You supplied a GraphQL document named `%s` with %d definitions, but ' +
      'it must have exactly one definition.',
      documentName,
      document.definitions.length
    );
    const definition = document.definitions[0];
    const isMutation =
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation';

    const validator = this.options.validator;
    let validationErrors;
    if (validator) {
      validationErrors = validator().validate(this.schema, document);
    } else {
      const rules = [
        ArgumentsOfCorrectTypeRule,
        DefaultValuesOfCorrectTypeRule,
        FieldsOnCorrectTypeRule,
        FragmentsOnCompositeTypesRule,
        KnownArgumentNamesRule,
        KnownTypeNamesRule,
        PossibleFragmentSpreadsRule,
        VariablesInAllowedPositionRule,
      ];
      if (!isMutation) {
        rules.push(ProvidedNonNullArgumentsRule);
      }
      validationErrors = validate(this.schema, document, rules);
    }

    if (validationErrors && validationErrors.length > 0) {
      return validationErrors.map(formatError);
    }
    return null;
  }

}

function capitalize(string: string): string {
  return string[0].toUpperCase() + string.slice(1);
}

/**
 * Utility to generate locally scoped auto-incrementing IDs.
 */
function createIDGenerator(): () => string {
  let _id = 0;
  return () => (_id++).toString(32);
}

module.exports = RelayQLTransformer;

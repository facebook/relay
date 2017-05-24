/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule printFlowTypes
 * @format
 */

'use strict';

const GraphQL = require('graphql');

const t = require('babel-types');

const {RELAY_CLASSIC_MUTATION} = require('RelayFlowParser');

import type {Fragment, LinkedField, Root, Selection} from 'RelayIR';
import type {GraphQLType} from 'graphql';
const generate = require('babel-generator').default;
const {getRawType} = require('RelaySchemaUtils');
const transformInputObjectToIR = require('transformInputObjectToIR');
const traverse = require('babel-traverse').default;

const {
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
} = GraphQL;
const FIELD_BLACKLIST = ['clientMutationId', 'client_mutation_id'];

type Annotation = Object;

/**
 * Prints a given Root or Fragment into a Flow type declaration.
 */
function printFlowTypes(node: Root | Fragment): ?string {
  if (node.kind === 'Root') {
    // for now, only fragments and mutations have flow types
    if (node.operation === 'mutation') {
      const selection = node.selections[0];
      if (selection.kind === 'LinkedField') {
        const argument = selection.args[0];
        const inputIR = transformInputObjectToIR(argument);

        let response = [];
        if (node.name !== RELAY_CLASSIC_MUTATION) {
          selection.name = `${node.name}Response`;
          response = normalize(transform(selection));
        }
        return normalize(transform(inputIR))
          .concat(response)
          .map(n => generate(n).code)
          .join('\n\n');
      }
    }
  } else if (node.kind === 'Fragment') {
    return normalize(transform(node)).map(n => generate(n).code).join('\n\n');
  }
}

/**
 * Transforms a "root" type (Fragment or LinkedField) into a Flow export type
 * statement.
 */
function transform(node: Fragment | LinkedField): Annotation {
  return t.exportNamedDeclaration(
    t.typeAlias(
      t.identifier(node.name),
      null,
      t.objectTypeAnnotation(
        node.selections
          .map(selection => transformSelection(selection))
          .reduce((prev, curr) => {
            if (!curr) {
              return prev;
            }
            return prev.concat(curr);
          }, []),
        null,
        null,
      ),
    ),
    [],
    null,
  );
}

function normalize(ast): Array<Annotation> {
  const normalizedRoots = [ast];

  const findObjectTypeProperty = {
    enter(path) {
      if (t.isObjectTypeProperty(path)) {
        // Ignore object types that are direct children of the root Flow type
        if (t.isTypeAlias(path.parent)) {
          return;
        }
        const {name} = path.node.key;
        path.traverse(findObjectTypeAnnotation, {
          name: `${this.prevName}_${name}`,
        });
      }
    },
    noScope: true,
  };
  const findObjectTypeAnnotation = {
    enter(path) {
      if (t.isObjectTypeAnnotation(path)) {
        // This has side effects on the path
        path.traverse(findObjectTypeProperty, {prevName: this.name});

        // Add the node of that transformed path to the array
        normalizedRoots.push(
          t.exportNamedDeclaration(
            t.typeAlias(t.identifier(this.name), null, path.node),
            [],
            null,
          ),
        );

        // Replace that path with a reference to the extracted type
        path.replaceWith(
          t.genericTypeAnnotation(t.identifier(this.name), null),
        );
      }
    },
    noScope: true,
  };

  traverse(
    ast,
    findObjectTypeProperty,
    {},
    {prevName: ast.declaration.id.name},
  );

  return normalizedRoots;
}

/**
 * Transforms a ScalarField or LinkedField to a Flow objectTypeProperty.
 * If `forceNull` is true, the selection will *always* be a nullable field.
 */
function transformSelection(
  node: Selection,
  forceNull: boolean = false,
): ?Array<Annotation> {
  if (node.name && FIELD_BLACKLIST.indexOf(node.name) !== -1) {
    return;
  }

  const name = node.alias || (node.name && node.name);
  let annotation;
  let body;
  switch (node.kind) {
    case 'ScalarField':
      body = wrapNullOrArray(
        node.type,
        transformScalarField(getRawType(node.type)),
      );
      if (body.type !== 'NullableTypeAnnotation' && forceNull) {
        body = t.nullableTypeAnnotation(body);
      }
      annotation = t.objectTypeProperty(t.identifier(name), body);
      break;
    case 'LinkedField':
      body = wrapNullOrArray(node.type, transformLinkedField(node));
      if (body.type !== 'NullableTypeAnnotation' && forceNull) {
        body = t.nullableTypeAnnotation(body);
      }
      annotation = t.objectTypeProperty(t.identifier(name), body);
      break;
    case 'Condition':
      annotation = node.selections
        .map(s => transformSelection(s, true))
        .reduce((prev, curr) => {
          if (!curr) {
            return prev;
          }
          return prev.concat(curr);
        }, []);
      break;
    case 'FragmentSpread':
      return; // noop
    case 'InlineFragment':
      return node.selections
        .map(s => transformSelection(s))
        .reduce((prev, curr) => {
          if (!curr) {
            return prev;
          }
          return prev.concat(curr);
        }, [])
        .map(s => {
          s.optional = true;
          return s;
        });
    default:
      throw new Error(`Unknown Selection type: ${node.kind}`);
  }

  if (Array.isArray(annotation)) {
    return annotation.map(a => {
      if (!(node.type instanceof GraphQLNonNull)) {
        a.optional = true;
      }
      return a;
    });
  }

  if (!(node.type instanceof GraphQLNonNull)) {
    annotation.optional = true;
  }
  return [annotation];
}

/**
 * Wraps the given type annotation as a Flow Array.
 */
function getArrayTypeAnnotation(typeAnnotation: Annotation): Annotation {
  return t.genericTypeAnnotation(
    t.identifier('Array'),
    t.typeParameterInstantiation([typeAnnotation]),
  );
}

/**
 * Recursively wraps the given type with Array or NonNullable nodes until it
 * reaches the root type.
 */
function wrapNullOrArray(
  type: GraphQLType,
  child: Annotation,
  nullable: boolean = true,
): Annotation {
  if (!type) {
    return child;
  }

  let annotation;
  if (type instanceof GraphQLNonNull) {
    return wrapNullOrArray(type.ofType, child, false);
  } else if (type instanceof GraphQLList) {
    annotation = getArrayTypeAnnotation(wrapNullOrArray(type.ofType, child));
  } else {
    annotation = child;
  }

  return nullable ? t.nullableTypeAnnotation(annotation) : annotation;
}

/**
 * Transforms a LinkedField into a Flow objectTypeAnnotation.
 */
function transformLinkedField(node: LinkedField): Annotation {
  const selections = node.selections
    .map(selection => {
      return transformSelection(selection);
    })
    .reduce((prev, curr) => {
      if (!curr) {
        return prev;
      }
      return prev.concat(curr);
    }, []);

  // If there are no selections, then we know the only child was a FragmentSpread
  // so we should make this field an 'any' type. (The alternative is an empty
  // object!)
  if (selections.length) {
    return t.objectTypeAnnotation(selections, null, null);
  } else {
    return t.anyTypeAnnotation();
  }
}

/**
 * Transforms a ScalarField type into its corresponding Flow AST node.
 */
function transformScalarField(type: GraphQLType): Annotation {
  if (type instanceof GraphQLScalarType) {
    switch (type.name) {
      case 'Color':
      case 'File':
      case 'ID':
      case 'String':
      case 'Url':
        return t.stringTypeAnnotation();
      case 'Float':
      case 'Int':
      case 'Time':
        return t.numberTypeAnnotation();
      case 'Boolean':
        return t.booleanTypeAnnotation();
      default:
        // Fallback to `any` for custom scalar types.
        return t.anyTypeAnnotation();
    }
  } else if (type instanceof GraphQLEnumType) {
    const stringLiterals = type.getValues().map(({value}) => {
      const literal = t.stringLiteralTypeAnnotation();
      literal.value = value;
      return literal;
    });

    return t.unionTypeAnnotation(stringLiterals);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

module.exports = printFlowTypes;

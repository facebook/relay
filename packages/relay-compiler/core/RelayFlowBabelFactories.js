/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowBabelFactories
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const t = require('babel-types');

type BabelAST = mixed;

/**
 * {|
 *   PROPS
 * |}
 */
function exactObjectTypeAnnotation(props: Array<BabelAST>) {
  const typeAnnotation = t.objectTypeAnnotation(props);
  typeAnnotation.exact = true;
  return typeAnnotation;
}

/**
 * export type NAME = TYPE
 */
function exportType(name: string, type: BabelAST) {
  return t.exportNamedDeclaration(
    t.typeAlias(t.identifier(name), null, type),
    [],
    null,
  );
}

/**
 * Create an intersection type if needed.
 *
 * TYPES[0] & TYPES[1] & ...
 */
function intersectionTypeAnnotation(types: Array<BabelAST>): BabelAST {
  invariant(
    types.length > 0,
    'RelayFlowBabelFactories: cannot create an intersection of 0 types',
  );
  return types.length === 1 ? types[0] : t.intersectionTypeAnnotation(types);
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
}

/**
 * $ReadOnlyArray<TYPE>
 */
function readOnlyArrayOfType(thing: BabelAST) {
  return t.genericTypeAnnotation(
    t.identifier('$ReadOnlyArray'),
    t.typeParameterInstantiation([thing]),
  );
}

/**
 * +KEY: VALUE
 */
function readOnlyObjectTypeProperty(key: string, value: BabelAST) {
  const prop = t.objectTypeProperty(t.identifier(key), value);
  prop.variance = 'plus';
  return prop;
}

function stringLiteralTypeAnnotation(value: string) {
  const annotation = t.stringLiteralTypeAnnotation();
  annotation.value = value;
  return annotation;
}

/**
 * Create a union type if needed.
 *
 * TYPES[0] | TYPES[1] | ...
 */
function unionTypeAnnotation(types: Array<BabelAST>): BabelAST {
  invariant(
    types.length > 0,
    'RelayFlowBabelFactories: cannot create a union of 0 types',
  );
  return types.length === 1 ? types[0] : t.unionTypeAnnotation(types);
}

module.exports = {
  exactObjectTypeAnnotation,
  exportType,
  intersectionTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
  unionTypeAnnotation,
};

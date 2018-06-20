/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const t = require('@babel/types');

type BabelAST = mixed;

/**
 * type NAME = any;
 */
function anyTypeAlias(name: string): BabelAST {
  return t.typeAlias(t.identifier(name), null, t.anyTypeAnnotation());
}

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
 * import type {NAMES[0], NAMES[1], ...} from 'MODULE';
 */
function importTypes(names: Array<string>, module: string) {
  const importDeclaration = t.importDeclaration(
    names.map(name =>
      t.importSpecifier(t.identifier(name), t.identifier(name)),
    ),
    t.stringLiteral(module),
  );
  importDeclaration.importKind = 'type';
  return importDeclaration;
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
  /* $FlowFixMe(>=0.70.0) This comment suppresses an error found when
   * Flow v0.70 was deployed. To see the error delete this comment and
   * run Flow. */
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
  prop.variance = t.variance('plus');
  return prop;
}

function stringLiteralTypeAnnotation(value: string) {
  return t.stringLiteralTypeAnnotation(value);
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
  anyTypeAlias,
  exactObjectTypeAnnotation,
  exportType,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
  unionTypeAnnotation,
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFlowBabelFactories
 * @flow
 * @format
 */

'use strict';

const t = require('babel-types');

type BabelAST = mixed;

function exactObjectTypeAnnotation(props: Array<BabelAST>) {
  const typeAnnotation = t.objectTypeAnnotation(props);
  typeAnnotation.exact = true;
  return typeAnnotation;
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
}

function readOnlyArrayOfType(thing: BabelAST) {
  return t.genericTypeAnnotation(
    t.identifier('$ReadOnlyArray'),
    t.typeParameterInstantiation([thing]),
  );
}

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

module.exports = {
  exactObjectTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
};

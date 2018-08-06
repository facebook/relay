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

const SignedSource = require('signedsource');

const {GraphQLEnumType} = require('graphql');

import type {CodegenDirectory} from 'graphql-compiler';
import type {GraphQLSchema} from 'graphql';

function writeForSchema(
  schema: GraphQLSchema,
  licenseHeader: Array<string>,
  codegenDir: CodegenDirectory,
  moduleName: string,
): void {
  const typeMap = schema.getTypeMap();
  const stableTypeNames = Object.keys(typeMap).sort();
  const types = [];
  for (const name of stableTypeNames) {
    const type = typeMap[name];
    if (type instanceof GraphQLEnumType) {
      const values = type.getValues().map(({value}) => value);
      values.sort();
      types.push(
        `export type ${name} =\n  | '` +
          values.join("'\n  | '") +
          "'\n  | '%future added value';",
      );
    }
  }

  const content =
    '/**\n' +
    licenseHeader.map(line => ` * ${line}\n`).join('') +
    ' *\n' +
    ` * ${SignedSource.getSigningToken()}\n` +
    ' * @flow\n' +
    ' */\n' +
    '\n' +
    // use Flow comment to avoid long Babel compile times
    '/*::\n' +
    types.join('\n\n') +
    '\n*/\n';

  codegenDir.writeFile(moduleName + '.js', SignedSource.signFile(content));
}

module.exports = {
  writeForSchema,
};

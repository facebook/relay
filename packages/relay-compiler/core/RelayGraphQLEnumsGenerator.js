/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayGraphQLEnumsGenerator
 * @flow
 * @format
 */

'use strict';

const SignedSource = require('signedsource');

const {GraphQLEnumType} = require('graphql');

import type CodegenDirectory from 'CodegenDirectory';
import type {GraphQLSchema} from 'graphql';

function writeForSchema(
  schema: GraphQLSchema,
  licenseHeader: Array<string>,
  codegenDir: CodegenDirectory,
  moduleName: string,
): void {
  const types = [];
  for (const [name, type] of Object.entries(schema.getTypeMap())) {
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
  types.sort();

  const content =
    '/**\n' +
    licenseHeader.map(line => ` * ${line}\n`).join('') +
    ' *\n' +
    ` * @providesModule ${moduleName}\n` +
    ` * ${SignedSource.getSigningToken()}\n` +
    ' * @flow\n' +
    ' */\n\n' +
    types.join('\n\n') +
    '\n';

  codegenDir.writeFile(moduleName + '.js', SignedSource.signFile(content));
}

module.exports = {
  writeForSchema,
};

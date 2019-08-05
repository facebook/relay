/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

import type CodegenDirectory from '../codegen/CodegenDirectory';
import type {GraphQLSchema} from 'graphql';

function writeForSchema(
  schema: GraphQLSchema,
  licenseHeader: $ReadOnlyArray<string>,
  codegenDir: CodegenDirectory,
  getModuleName: (enumName: string) => string,
  aggregateModuleNames: $ReadOnlyArray<string>,
): void {
  const header =
    '/**\n' +
    licenseHeader.map(line => ` * ${line}\n`).join('') +
    ' *\n' +
    ` * ${SignedSource.getSigningToken()}\n` +
    ' * @flow\n' +
    ' */\n' +
    '\n';

  const typeMap = schema.getTypeMap();
  const stableTypeNames = Object.keys(typeMap).sort();
  const types = [];
  for (const name of stableTypeNames) {
    const type = typeMap[name];
    if (type instanceof GraphQLEnumType) {
      types.push(`export type {${name}} from '${getModuleName(name)}';`);
      const values = type
        .getValues()
        .map(({value}) => value)
        .sort();
      const enumFileContent =
        header +
        `export type ${name} =\n  | '` +
        values.join("'\n  | '") +
        "'\n  | '%future added value';\n";
      codegenDir.writeFile(
        `${getModuleName(name)}.js`,
        SignedSource.signFile(enumFileContent),
      );
    }
  }

  const content = header + types.join('\n') + '\n';

  aggregateModuleNames.forEach(aggregateModuleName => {
    codegenDir.writeFile(
      aggregateModuleName + '.js',
      SignedSource.signFile(content),
    );
  });
}

module.exports = {
  writeForSchema,
};

#!/usr/bin/env babel-node
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'graphql/language';
import { buildASTSchema, introspectionQuery } from 'graphql/utilities';
import { graphql } from 'graphql';

try {
  const inFile = path.resolve(__dirname, 'testschema.graphql');
  const outFile = path.resolve(__dirname, 'testschema.json');

  const body = fs.readFileSync(inFile, 'utf8');
  const ast = parse(body);
  const astSchema = buildASTSchema(ast, 'Root', 'Mutation');
  graphql(astSchema, introspectionQuery).then(
    function(result) {
      const out = JSON.stringify(result, null, 2);
      fs.writeFileSync(outFile, out);
    });
} catch (error) {
  console.error(error);
  console.error(error.stack);
}

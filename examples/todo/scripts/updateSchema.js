#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs';
import path from 'path';
import { GraphQLTodoSchema } from '../data/schema';
import { graphql }  from 'graphql';
import { introspectionQuery } from 'graphql/utilities';

async () => {
  var result = await (graphql(GraphQLTodoSchema, introspectionQuery));
  if (result.errors) {
    console.error('ERROR: ', JSON.stringify(result.errors, null, 2));
  } else {
    fs.writeFileSync(
      path.join(__dirname, '../data/schema.json'),
      JSON.stringify(result, null, 2)
    );
  }
}();

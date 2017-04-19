#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs';
import path from 'path';
import { StarWarsSchema } from '../data/starWarsSchema';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

// Save JSON of full schema introspection for Babel Relay Plugin to use
async () => {
  var result = await (graphql(StarWarsSchema, introspectionQuery));
  if (result.errors) {
    console.error(
      'ERROR introspecting schema: ',
      JSON.stringify(result.errors, null, 2)
    );
  } else {
    fs.writeFileSync(
      path.join(__dirname, '../data/starWarsSchema.json'),
      JSON.stringify(result, null, 2)
    );
  }
}();

// Save user readable type system shorthand of schema
fs.writeFileSync(
  path.join(__dirname, '../data/starWarsSchema.graphql'),
  printSchema(StarWarsSchema)
);

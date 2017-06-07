import fs from 'fs';
import path from 'path';
import {
  printSchema,
  printInstrospectionSchema
  } from 'graphql/utilities/schemaPrinter.js';

import graphql from 'graphql';

import Schema from '../data/schema.es6';

async() => {
  var result = await(printSchema(Schema));

  if (result.errors) {
    console.error('ERROR: ', JSON.stringify(result.errors, null, 2));
  } else {
    console.log(result);
    fs.writeFileSync('./data/printedSchema.graphql', result);
  }
}();


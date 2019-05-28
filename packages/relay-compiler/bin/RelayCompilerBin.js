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

require('@babel/polyfill');

const {main} = require('./RelayCompilerMain');
const yargs = require('yargs');

import type {Config} from './RelayCompilerMain';

type OptionBase<T> = {|
  describe: string,
  default?: T,
|};

/**
 * Maps from a value type to a corresponding yargs option object type.
 *
 * For instance, a required array string type maps to:
 *
 *     { describe: string, default?: Array<string>, type: 'string', array: true, demandOption: true }
 *
 * Whereas an optional single string type maps to:
 *
 *     { describe: string, default?: string, type: 'string', array: false, demandOption: false }
 */
type OptionTypeMap<T> = $Call<
  | ((
      Array<string>,
    ) => {|...OptionBase<Array<string>>, array: true, type: 'string'|})
  | ((
      ?string,
    ) => {|
      ...OptionBase<string>,
      array: false,
      demandOption: false,
      type: 'string',
    |})
  | (string => {|
      ...OptionBase<string>,
      array: false,
      demandOption: true,
      type: 'string',
    |})
  | ((?boolean) => {|...OptionBase<boolean>, type: 'boolean'|})
  | (({}) => {|...OptionBase<{}>, type: 'object'|}),
  T,
>;

/**
 * Generates an object type with all keys from Config and values mapped to yargs option object types.
 */
type Options = $ObjMap<Config, <T>(T) => OptionTypeMap<T>>;

const options: Options = {
  schema: {
    describe: 'Path to schema.graphql or schema.json',
    demandOption: true,
    type: 'string',
    array: false,
  },
  src: {
    describe: 'Root directory of application code',
    demandOption: true,
    type: 'string',
    array: false,
  },
  include: {
    describe: 'Directories to include under src',
    type: 'string',
    array: true,
    default: ['**'],
  },
  exclude: {
    describe: 'Directories to ignore under src',
    type: 'string',
    array: true,
    default: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
  },
  extensions: {
    array: true,
    describe:
      'File extensions to compile (defaults to extensions provided by the ' +
      'language plugin)',
    type: 'string',
  },
  verbose: {
    describe: 'More verbose logging',
    type: 'boolean',
  },
  quiet: {
    describe: 'No output to stdout',
    type: 'boolean',
  },
  watchman: {
    describe: 'Use watchman when not in watch mode',
    type: 'boolean',
    default: true,
  },
  watch: {
    describe: 'If specified, watches files and regenerates on changes',
    type: 'boolean',
  },
  validate: {
    describe:
      'Looks for pending changes and exits with non-zero code instead of ' +
      'writing to disk',
    type: 'boolean',
    default: false,
  },
  persistOutput: {
    describe:
      'A path to a .json file where persisted query metadata should be saved',
    demandOption: false,
    type: 'string',
    array: false,
  },
  noFutureProofEnums: {
    describe:
      'This option controls whether or not a catch-all entry is added to enum type definitions ' +
      'for values that may be added in the future. Enabling this means you will have to update ' +
      'your application whenever the GraphQL server schema adds new enum values to prevent it ' +
      'from breaking.',
    type: 'boolean',
    default: false,
  },
  language: {
    describe:
      'The name of the language plugin used for input files and artifacts',
    demandOption: false,
    type: 'string',
    array: false,
    default: 'javascript',
  },
  artifactDirectory: {
    describe:
      'A specific directory to output all artifacts to. When enabling this ' +
      'the babel plugin needs `artifactDirectory` set as well.',
    demandOption: false,
    type: 'string',
    array: false,
  },
  customScalars: {
    describe:
      'Mappings from custom scalars in your schema to built-in GraphQL ' +
      'types, for type emission purposes. (Uses yargs dot-notation, e.g. ' +
      '--customScalars.URL=String)',
    type: 'object',
  },
};

// Collect args
const argv = yargs
  .usage(
    'Create Relay generated files\n\n' +
      '$0 --schema <path> --src <path> [--watch]',
  )
  .options(options).argv;

// Run script with args
// $FlowFixMe: Invalid types for yargs. Please fix this when touching this code.
main(argv).catch(error => {
  console.error(String(error.stack || error));
  process.exit(1);
});

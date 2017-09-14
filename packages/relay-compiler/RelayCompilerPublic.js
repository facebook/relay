/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayCompilerPublic
 * @format
 */

'use strict';

const RelayCompiler = require('./RelayCompiler');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayJSModuleParser = require('./core/RelayJSModuleParser');

const formatGeneratedModule = require('./codegen/formatGeneratedModule');

const {
  CodegenRunner,
  ConsoleReporter,
  MultiReporter,
} = require('./graphql-compiler/GraphQLCompilerPublic');

export type {
  CompileResult,
  ParserConfig,
  WriterConfig,
} from './graphql-compiler/GraphQLCompilerPublic';

module.exports = {
  Compiler: RelayCompiler,
  ConsoleReporter,

  /** @deprecated Use JSModuleParser. */
  FileIRParser: RelayJSModuleParser,

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  JSModuleParser: RelayJSModuleParser,
  MultiReporter,
  Runner: CodegenRunner,
  formatGeneratedModule,
};

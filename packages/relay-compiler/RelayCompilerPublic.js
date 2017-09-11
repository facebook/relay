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

const CodegenRunner = require('CodegenRunner');
const GraphQLConsoleReporter = require('GraphQLConsoleReporter');
const GraphQLMultiReporter = require('GraphQLMultiReporter');
const RelayCompiler = require('RelayCompiler');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');
const RelayJSModuleParser = require('RelayJSModuleParser');

const formatGeneratedModule = require('formatGeneratedModule');

export type {ParserConfig, WriterConfig} from 'CodegenRunner';
export type {CompileResult} from 'CodegenTypes';

module.exports = {
  Compiler: RelayCompiler,
  ConsoleReporter: GraphQLConsoleReporter,

  /** @deprecated Use JSModuleParser. */
  FileIRParser: RelayJSModuleParser,

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  JSModuleParser: RelayJSModuleParser,
  MultiReporter: GraphQLMultiReporter,
  Runner: CodegenRunner,
  formatGeneratedModule,
};

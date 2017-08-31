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

const GraphQLConsoleReporter = require('GraphQLConsoleReporter');
const GraphQLMultiReporter = require('GraphQLMultiReporter');
const RelayCodegenRunner = require('RelayCodegenRunner');
const RelayCompiler = require('RelayCompiler');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');

const formatGeneratedModule = require('formatGeneratedModule');

export type {CompileResult} from 'RelayCodegenTypes';
export type {ParserConfig, WriterConfig} from 'RelayCodegenRunner';

module.exports = {
  Compiler: RelayCompiler,
  ConsoleReporter: GraphQLConsoleReporter,
  FileIRParser: RelayFileIRParser,
  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  MultiReporter: GraphQLMultiReporter,
  Runner: RelayCodegenRunner,
  formatGeneratedModule,
};

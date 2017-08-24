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

const RelayCodegenRunner = require('RelayCodegenRunner');
const RelayCompiler = require('RelayCompiler');
const RelayConsoleReporter = require('RelayConsoleReporter');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');
const RelayMultiReporter = require('RelayMultiReporter');

const formatGeneratedModule = require('formatGeneratedModule');

export type {CompileResult} from 'RelayCodegenTypes';
export type {ParserConfig, WriterConfig} from 'RelayCodegenRunner';

module.exports = {
  Compiler: RelayCompiler,
  ConsoleReporter: RelayConsoleReporter,
  FileIRParser: RelayFileIRParser,
  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  MultiReporter: RelayMultiReporter,
  Runner: RelayCodegenRunner,
  formatGeneratedModule,
};

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
const RelayCompiler = require('RelayCompiler');
const ConsoleReporter = require('ConsoleReporter');
const RelayFileIRParser = require('RelayFileIRParser');
const RelayFileWriter = require('RelayFileWriter');
const RelayIRTransforms = require('RelayIRTransforms');
const MultiReporter = require('MultiReporter');

export type {CompileResult} from 'CodegenTypes';

module.exports = {
  Compiler: RelayCompiler,
  ConsoleReporter: ConsoleReporter,
  FileIRParser: RelayFileIRParser,
  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  MultiReporter: MultiReporter,
  Runner: CodegenRunner,
};

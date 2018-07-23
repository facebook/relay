/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayJSModuleParser = require('./core/RelayJSModuleParser');
const RelayParser = require('./core/RelayParser');

const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const formatGeneratedModule = require('./codegen/formatGeneratedModule');

const {CompilerContext: GraphQLCompilerContext} = require('graphql-compiler');
const {
  ASTConvert,
  CodegenRunner,
  ConsoleReporter,
  MultiReporter,
} = require('graphql-compiler');

export type {CompileResult, ParserConfig, WriterConfig} from 'graphql-compiler';

module.exports = {
  ConsoleReporter,
  Parser: RelayParser,
  CodeGenerator: RelayCodeGenerator,

  GraphQLCompilerContext,

  /** @deprecated Use JSModuleParser. */
  FileIRParser: RelayJSModuleParser,

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  JSModuleParser: RelayJSModuleParser,
  MultiReporter,
  Runner: CodegenRunner,
  compileRelayArtifacts,
  formatGeneratedModule,
  convertASTDocuments: ASTConvert.convertASTDocuments,
  transformASTSchema: ASTConvert.transformASTSchema,
};

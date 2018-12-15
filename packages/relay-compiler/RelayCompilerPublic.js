/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const FindGraphQLTags = require('./language/javascript/FindGraphQLTags');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayFlowGenerator = require('./language/javascript/RelayFlowGenerator');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayParser = require('./core/RelayParser');
const RelaySourceModuleParser = require('./core/RelaySourceModuleParser');
const RelayValidator = require('./core/RelayValidator');

const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const formatGeneratedModule = require('./language/javascript/formatGeneratedModule');
const writeRelayGeneratedFile = require('./codegen/writeRelayGeneratedFile');

const {
  ASTConvert,
  CodegenRunner,
  CompilerContext: GraphQLCompilerContext,
  ConsoleReporter,
  MultiReporter,
} = require('graphql-compiler');

export type {RelayCompilerTransforms} from './codegen/compileRelayArtifacts';
export type {
  FormatModule,
  TypeGenerator,
} from './language/RelayLanguagePluginInterface';
export type {CompileResult, ParserConfig, WriterConfig} from 'graphql-compiler';
const RelayJSModuleParser = RelaySourceModuleParser(FindGraphQLTags.find);

module.exports = {
  ConsoleReporter,
  Parser: RelayParser,
  Validator: RelayValidator,
  CodeGenerator: RelayCodeGenerator,
  FlowGenerator: RelayFlowGenerator,

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

  writeRelayGeneratedFile,
};

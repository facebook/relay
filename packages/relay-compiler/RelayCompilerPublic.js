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

const FindGraphQLTags = require('./language/javascript/FindGraphQLTags');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayParser = require('./core/RelayParser');
const RelaySourceModuleParser = require('./core/RelaySourceModuleParser');

const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const formatGeneratedModule = require('./language/javascript/formatGeneratedModule');

const {CompilerContext: GraphQLCompilerContext} = require('graphql-compiler');
const {
  ASTConvert,
  CodegenRunner,
  ConsoleReporter,
  MultiReporter,
} = require('graphql-compiler');

export type {CompileResult, ParserConfig, WriterConfig} from 'graphql-compiler';

const RelayJSModuleParser = RelaySourceModuleParser(FindGraphQLTags.find);

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

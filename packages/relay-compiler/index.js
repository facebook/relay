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

const ASTCache = require('./core/ASTCache');
const ASTConvert = require('./core/ASTConvert');
const CodeMarker = require('./util/CodeMarker');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const CodegenWatcher = require('./codegen/CodegenWatcher');
const DotGraphQLParser = require('./core/DotGraphQLParser');
const FindGraphQLTags = require('./language/javascript/FindGraphQLTags');
const GraphQLCompilerContext = require('./core/GraphQLCompilerContext');
const GraphQLCompilerProfiler = require('./core/GraphQLCompilerProfiler');
const GraphQLConsoleReporter = require('./reporters/GraphQLConsoleReporter');
const GraphQLIRPrinter = require('./core/GraphQLIRPrinter');
const GraphQLIRTransformer = require('./core/GraphQLIRTransformer');
const GraphQLIRVisitor = require('./core/GraphQLIRVisitor');
const GraphQLMultiReporter = require('./reporters/GraphQLMultiReporter');
const GraphQLWatchmanClient = require('./core/GraphQLWatchmanClient');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayCompilerError = require('./core/RelayCompilerError');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayFlowGenerator = require('./language/javascript/RelayFlowGenerator');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayIRValidations = require('./core/RelayIRValidations');
const RelayParser = require('./core/RelayParser');
const RelaySchema = require('./core/Schema');
const RelaySourceModuleParser = require('./core/RelaySourceModuleParser');
const Rollout = require('./util/Rollout');
const SchemaUtils = require('./core/SchemaUtils');

const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const filterContextForNode = require('./core/filterContextForNode');
const formatGeneratedModule = require('./language/javascript/formatGeneratedModule');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');
const getLiteralArgumentValues = require('./core/getLiteralArgumentValues');
const getNormalizationOperationName = require('./core/getNormalizationOperationName');
const writeRelayGeneratedFile = require('./codegen/writeRelayGeneratedFile');

const {main} = require('./bin/RelayCompilerMain');
const {SourceControlMercurial} = require('./codegen/SourceControl');
const {
  getReaderSourceDefinitionName,
  getSourceDefinitionName,
} = require('./core/GraphQLDerivedFromMetadata');

export type {Filesystem} from './codegen/CodegenDirectory';
export type {
  WriteFiles,
  WriteFilesOptions,
  ParserConfig,
  WriterConfig,
} from './codegen/CodegenRunner';
export type {CompileResult, File} from './codegen/CodegenTypes';
export type {FileFilter, WatchmanExpression} from './codegen/CodegenWatcher';
export type {SourceControl} from './codegen/SourceControl';
export type {
  RelayCompilerTransforms,
  RelayCompilerValidations,
} from './codegen/compileRelayArtifacts';
export type {IRTransform} from './core/GraphQLCompilerContext';
export type {
  Argument,
  ArgumentDefinition,
  ArgumentValue,
  Condition,
  Definition,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  GeneratedDefinition,
  Handle,
  InlineFragment,
  IR,
  Connection,
  ConnectionField,
  LinkedField,
  Literal,
  LocalArgumentDefinition,
  ModuleImport,
  Metadata,
  Node,
  Request,
  Root,
  RootArgumentDefinition,
  ScalarField,
  Selection,
  SplitOperation,
  Variable,
} from './core/GraphQLIR';
export type {Schema, TypeID, FieldID} from './core/Schema';
export type {
  FormatModule,
  TypeGenerator,
} from './language/RelayLanguagePluginInterface';
export type {GraphQLReporter as Reporter} from './reporters/GraphQLReporter';
export type {FlattenOptions} from './transforms/FlattenTransform';

const RelayJSModuleParser: $FlowFixMe = RelaySourceModuleParser(
  FindGraphQLTags.find,
);

module.exports = {
  relayCompiler: main,

  ASTConvert,
  CodegenDirectory,
  CodegenRunner,
  CodegenWatcher,
  CodeMarker,
  CompilerContext: GraphQLCompilerContext,
  CompilerError: RelayCompilerError,
  ConsoleReporter: GraphQLConsoleReporter,
  DotGraphQLParser,
  ASTCache,
  IRTransformer: GraphQLIRTransformer,
  IRVisitor: GraphQLIRVisitor,
  Printer: GraphQLIRPrinter,
  Profiler: GraphQLCompilerProfiler,
  Rollout,
  SchemaUtils: SchemaUtils,
  SourceControlMercurial,
  WatchmanClient: GraphQLWatchmanClient,

  filterContextForNode,
  getIdentifierForArgumentValue,
  getNormalizationOperationName,
  getLiteralArgumentValues,

  Parser: RelayParser,
  Schema: RelaySchema,
  CodeGenerator: RelayCodeGenerator,
  FlowGenerator: RelayFlowGenerator,

  GraphQLCompilerContext,

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  IRValidations: RelayIRValidations,
  JSModuleParser: RelayJSModuleParser,
  MultiReporter: GraphQLMultiReporter,
  Runner: CodegenRunner,
  compileRelayArtifacts: compileRelayArtifacts,
  formatGeneratedModule,
  convertASTDocuments: ASTConvert.convertASTDocuments,
  transformASTSchema: ASTConvert.transformASTSchema,

  getReaderSourceDefinitionName,
  getSourceDefinitionName,

  writeRelayGeneratedFile,
};

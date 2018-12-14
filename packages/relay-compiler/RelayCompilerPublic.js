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
const ASTConvert = require('./core/ASTConvert');
const ASTCache = require('./core/ASTCache');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const CodegenWatcher = require('./codegen/CodegenWatcher');
const DotGraphQLParser = require('./core/DotGraphQLParser');
const FilterDirectivesTransform = require('./transforms/FilterDirectivesTransform');
const FlattenTransform = require('./transforms/FlattenTransform');
const GraphQLCompilerContext = require('./core/GraphQLCompilerContext');
const GraphQLCompilerProfiler = require('./core/GraphQLCompilerProfiler');
const GraphQLConsoleReporter = require('./reporters/GraphQLConsoleReporter');
const GraphQLIRPrinter = require('./core/GraphQLIRPrinter');
const GraphQLIRSplitNaming = require('./core/GraphQLIRSplitNaming');
const GraphQLIRTransformer = require('./core/GraphQLIRTransformer');
const GraphQLIRVisitor = require('./core/GraphQLIRVisitor');
const GraphQLMultiReporter = require('./reporters/GraphQLMultiReporter');
const GraphQLParser = require('./core/GraphQLParser');
const GraphQLSchemaUtils = require('./core/GraphQLSchemaUtils');
const GraphQLValidator = require('./core/GraphQLValidator');
const GraphQLWatchmanClient = require('./core/GraphQLWatchmanClient');
const InlineFragmentsTransform = require('./transforms/InlineFragmentsTransform');
const SkipClientFieldTransform = require('./transforms/SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('./transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('./transforms/SkipUnreachableNodeTransform');
const StripUnusedVariablesTransform = require('./transforms/StripUnusedVariablesTransform');

const defaultGetFieldDefinition = require('./core/defaultGetFieldDefinition');
const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');
const getLiteralArgumentValues = require('./core/getLiteralArgumentValues');
const isEquivalentType = require('./core/isEquivalentType');
const nullthrows = require('./util/nullthrowsOSS');
const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const formatGeneratedModule = require('./language/javascript/formatGeneratedModule');
const writeRelayGeneratedFile = require('./codegen/writeRelayGeneratedFile');

const {SourceControlMercurial} = require('./codegen/SourceControl');

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
export type {IRTransform} from './core/GraphQLCompilerContext';
export type {
  Argument,
  ArgumentDefinition,
  ArgumentValue,
  Condition,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  Handle,
  InlineFragment,
  IR,
  LinkedField,
  ListValue,
  Literal,
  LocalArgumentDefinition,
  MatchBranch,
  MatchField,
  Metadata,
  Node,
  ObjectFieldValue,
  ObjectValue,
  Request,
  Root,
  RootArgumentDefinition,
  ScalarField,
  ScalarFieldType,
  Selection,
  SplitOperation,
  Variable,
} from './core/GraphQLIR';
export type {GraphQLReporter as Reporter} from './reporters/GraphQLReporter';
export type {FlattenOptions} from './transforms/FlattenTransform';

export type {RelayCompilerTransforms} from './codegen/compileRelayArtifacts';
export type {
  FormatModule,
  TypeGenerator,
} from './language/RelayLanguagePluginInterface';

const RelayJSModuleParser = RelaySourceModuleParser(FindGraphQLTags.find);

module.exports = {
  ASTConvert,
  CodegenDirectory,
  CodegenRunner,
  CodegenWatcher,
  CompilerContext: GraphQLCompilerContext,
  ConsoleReporter: GraphQLConsoleReporter,
  DotGraphQLParser,
  ASTCache,
  IRTransformer: GraphQLIRTransformer,
  IRVisitor: GraphQLIRVisitor,
  MultiReporter: GraphQLMultiReporter,
  Parser: GraphQLParser,
  Printer: GraphQLIRPrinter,
  Profiler: GraphQLCompilerProfiler,
  SchemaUtils: GraphQLSchemaUtils,
  SourceControlMercurial,
  SplitNaming: GraphQLIRSplitNaming,
  Validator: GraphQLValidator,
  WatchmanClient: GraphQLWatchmanClient,
  defaultGetFieldDefinition,
  filterContextForNode,
  getIdentifierForArgumentValue,
  getLiteralArgumentValues,
  isEquivalentType,
  nullthrows,

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

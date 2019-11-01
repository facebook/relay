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
const Artifacts = require('./runner/Artifacts');
const BufferedFilesystem = require('./runner/BufferedFilesystem');
const CodeMarker = require('./util/CodeMarker');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const CodegenWatcher = require('./codegen/CodegenWatcher');
const CompilerContext = require('./core/CompilerContext');
const CompilerError = require('./core/CompilerError');
const ConsoleReporter = require('./reporters/ConsoleReporter');
const DotGraphQLParser = require('./core/DotGraphQLParser');
const GraphQLASTNodeGroup = require('./runner/GraphQLASTNodeGroup');
const GraphQLASTUtils = require('./runner/GraphQLASTUtils');
const GraphQLCompilerProfiler = require('./core/GraphQLCompilerProfiler');
const GraphQLNodeMap = require('./runner/GraphQLNodeMap');
const GraphQLWatchmanClient = require('./core/GraphQLWatchmanClient');
const IRPrinter = require('./core/IRPrinter');
const IRTransformer = require('./core/IRTransformer');
const IRVisitor = require('./core/IRVisitor');
const JSModuleParser = require('./core/JSModuleParser');
const MultiReporter = require('./reporters/MultiReporter');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayFlowGenerator = require('./language/javascript/RelayFlowGenerator');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayParser = require('./core/RelayParser');
const RelaySchema = require('./core/Schema');
const Rollout = require('./util/Rollout');
const SchemaUtils = require('./core/SchemaUtils');
const Sources = require('./runner/Sources');
const StrictMap_ = require('./runner/StrictMap');

const compileArtifacts = require('./runner/compileArtifacts');
const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const extractAST = require('./runner/extractAST');
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
export type {RelayCompilerTransforms} from './codegen/compileRelayArtifacts';
export type {IRTransform} from './core/CompilerContext';
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
} from './core/IR';
export type {Schema, TypeID, FieldID} from './core/Schema';
export type {
  FormatModule,
  TypeGenerator,
} from './language/RelayLanguagePluginInterface';
export type {Reporter} from './reporters/Reporter';
export type {
  ArtifactMap,
  ArtifactState,
  SerializedArtifactState,
} from './runner/Artifacts';
export type {NodeGroup} from './runner/GraphQLASTNodeGroup';
export type {SourceChanges} from './runner/Sources';
export type {ExtractFn} from './runner/extractAST';
export type {SavedStateCollection, WatchmanFile} from './runner/types';
export type {FlattenOptions} from './transforms/FlattenTransform';

export type StrictMap<K, V> = StrictMap_<K, V>;

module.exports = {
  relayCompiler: main,

  ASTConvert,
  CodegenDirectory,
  CodegenRunner,
  CodegenWatcher,
  CodeMarker,
  CompilerContext,
  CompilerError,
  ConsoleReporter,
  DotGraphQLParser,
  ASTCache,
  IRTransformer,
  IRVisitor,
  Printer: IRPrinter,
  Profiler: GraphQLCompilerProfiler,
  Rollout,
  SchemaUtils,
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

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  JSModuleParser,
  MultiReporter,
  Runner: CodegenRunner,
  compileRelayArtifacts,
  formatGeneratedModule,
  convertASTDocuments: ASTConvert.convertASTDocuments,
  transformASTSchema: ASTConvert.transformASTSchema,

  getReaderSourceDefinitionName,
  getSourceDefinitionName,

  writeRelayGeneratedFile,

  Sources,
  __internal: {
    Artifacts,
    BufferedFilesystem,
    GraphQLASTNodeGroup,
    GraphQLASTUtils,
    GraphQLNodeMap,
    StrictMap: StrictMap_,
    compileArtifacts,
    extractFromJS: extractAST.extractFromJS,
    parseExecutableNode: extractAST.parseExecutableNode,
    toASTRecord: extractAST.toASTRecord,
  },
};

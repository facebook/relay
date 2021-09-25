/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {main} = require('./bin/RelayCompilerMain');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const CodegenWatcher = require('./codegen/CodegenWatcher');
const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const {SourceControlMercurial} = require('./codegen/SourceControl');
const writeRelayGeneratedFile = require('./codegen/writeRelayGeneratedFile');
const ASTCache = require('./core/ASTCache');
const ASTConvert = require('./core/ASTConvert');
const CompilerContext = require('./core/CompilerContext');
const CompilerError = require('./core/CompilerError');
const DotGraphQLParser = require('./core/DotGraphQLParser');
const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');
const getLiteralArgumentValues = require('./core/getLiteralArgumentValues');
const getNormalizationOperationName = require('./core/getNormalizationOperationName');
const GraphQLCompilerProfiler = require('./core/GraphQLCompilerProfiler');
const {
  getReaderSourceDefinitionName,
} = require('./core/GraphQLDerivedFromMetadata');
const GraphQLWatchmanClient = require('./core/GraphQLWatchmanClient');
const IRPrinter = require('./core/IRPrinter');
const IRTransformer = require('./core/IRTransformer');
const IRVisitor = require('./core/IRVisitor');
const JSModuleParser = require('./core/JSModuleParser');
const RelayFindGraphQLTags = require('./core/RelayFindGraphQLTags');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelayParser = require('./core/RelayParser');
const RelaySchema = require('./core/Schema');
const SchemaUtils = require('./core/SchemaUtils');
const FindGraphQLTags = require('./language/javascript/FindGraphQLTags');
const {
  formatGeneratedCommonjsModule: formatGeneratedModule,
} = require('./language/javascript/formatGeneratedModule');
const RelayFlowGenerator = require('./language/javascript/RelayFlowGenerator');
const ConsoleReporter = require('./reporters/ConsoleReporter');
const MultiReporter = require('./reporters/MultiReporter');
const Artifacts = require('./runner/Artifacts');
const BufferedFilesystem = require('./runner/BufferedFilesystem');
const compileArtifacts = require('./runner/compileArtifacts');
const extractAST = require('./runner/extractAST');
const getChangedNodeNames = require('./runner/getChangedNodeNames');
const getSchemaInstance = require('./runner/getSchemaInstance');
const GraphQLASTNodeGroup = require('./runner/GraphQLASTNodeGroup');
const GraphQLASTUtils = require('./runner/GraphQLASTUtils');
const GraphQLNodeMap = require('./runner/GraphQLNodeMap');
const Sources = require('./runner/Sources');
const StrictMap = require('./runner/StrictMap');
const CodeMarker = require('./util/CodeMarker');
const getDefinitionNodeHash = require('./util/getDefinitionNodeHash');
const md5 = require('./util/md5');
const Rollout = require('./util/Rollout');
const TimeReporter = require('./util/TimeReporter');

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
  LinkedField,
  ListValue,
  Literal,
  LocalArgumentDefinition,
  ModuleImport,
  Metadata,
  Node,
  ObjectFieldValue,
  ObjectValue,
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
export type {StrictMap} from './runner/StrictMap';
export type {ExtractFn} from './runner/extractAST';
export type {SavedStateCollection, WatchmanFile} from './runner/types';
export type {FlattenOptions} from './transforms/FlattenTransform';

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
  TimeReporter,
  compileRelayArtifacts,
  formatGeneratedModule,
  convertASTDocuments: ASTConvert.convertASTDocuments,
  transformASTSchema: ASTConvert.transformASTSchema,

  getReaderSourceDefinitionName,

  writeRelayGeneratedFile,

  Sources,
  __internal: {
    Artifacts,
    BufferedFilesystem,
    GraphQLASTNodeGroup,
    GraphQLASTUtils,
    GraphQLNodeMap,
    FindGraphQLTags,
    StrictMap,
    RelayFindGraphQLTags,
    compileArtifacts,
    extractFromJS: extractAST.extractFromJS,
    getChangedNodeNames,
    getDefinitionNodeHash,
    getSchemaInstance,
    md5,
    parseExecutableNode: extractAST.parseExecutableNode,
    toASTRecord: extractAST.toASTRecord,
  },
};

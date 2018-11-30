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

const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');
const getLiteralArgumentValues = require('./core/getLiteralArgumentValues');
const isEquivalentType = require('./core/isEquivalentType');
const nullthrows = require('./util/nullthrowsOSS');

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
  IR,
  InlineFragment,
  LinkedField,
  ListValue,
  Literal,
  LocalArgumentDefinition,
  MatchField,
  MatchBranch,
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
  filterContextForNode,
  getIdentifierForArgumentValue,
  getLiteralArgumentValues,
  isEquivalentType,
  nullthrows,

  FilterDirectivesTransform,
  FlattenTransform,
  InlineFragmentsTransform,
  SkipClientFieldTransform,
  SkipRedundantNodesTransform,
  SkipUnreachableNodeTransform,
  StripUnusedVariablesTransform,
};

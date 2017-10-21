/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule GraphQLCompilerPublic
 * @format
 */

'use strict';

const ASTCache = require('./core/ASTCache');
const ASTConvert = require('./core/ASTConvert');
const AutoAliasTransform = require('./transforms/AutoAliasTransform');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const DotGraphQLParser = require('./core/DotGraphQLParser');
const FilterDirectivesTransform = require('./transforms/FilterDirectivesTransform');
const FlattenTransform = require('./transforms/FlattenTransform');
const GraphQLCompiler = require('./core/GraphQLCompiler');
const GraphQLCompilerContext = require('./core/GraphQLCompilerContext');
const GraphQLConsoleReporter = require('./reporters/GraphQLConsoleReporter');
const GraphQLIRPrinter = require('./core/GraphQLIRPrinter');
const GraphQLIRTransformer = require('./core/GraphQLIRTransformer');
const GraphQLIRTransforms = require('./core/GraphQLIRTransforms');
const GraphQLIRVisitor = require('./core/GraphQLIRVisitor');
const GraphQLMultiReporter = require('./reporters/GraphQLMultiReporter');
const GraphQLParser = require('./core/GraphQLParser');
const GraphQLSchemaUtils = require('./core/GraphQLSchemaUtils');
const GraphQLValidator = require('./core/GraphQLValidator');
const GraphQLWatchmanClient = require('./core/GraphQLWatchmanClient');
const SkipClientFieldTransform = require('./transforms/SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('./transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('./transforms/SkipUnreachableNodeTransform');
const StripUnusedVariablesTransform = require('./transforms/StripUnusedVariablesTransform');

const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');
const getLiteralArgumentValues = require('./core/getLiteralArgumentValues');

export type {ParserConfig, WriterConfig} from './codegen/CodegenRunner';
export type {
  CompileResult,
  File,
  FileWriterInterface,
} from './codegen/CodegenTypes';
export type {FileFilter, WatchmanExpression} from './codegen/CodegenWatcher';
export type {
  CompiledDocumentMap,
  CompiledNode,
  CompilerTransforms,
} from './core/GraphQLCompiler';
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
  Node,
  ObjectFieldValue,
  ObjectValue,
  Root,
  RootArgumentDefinition,
  ScalarField,
  ScalarFieldType,
  Selection,
  Variable,
} from './core/GraphQLIR';
export type {IRTransform} from './core/GraphQLIRTransforms';
export type {FlattenOptions} from './transforms/FlattenTransform';

module.exports = {
  ASTConvert,
  CodegenDirectory,
  CodegenRunner,
  Compiler: GraphQLCompiler,
  CompilerContext: GraphQLCompilerContext,
  ConsoleReporter: GraphQLConsoleReporter,
  DotGraphQLParser,
  ASTCache,
  IRTransformer: GraphQLIRTransformer,
  IRTransforms: GraphQLIRTransforms,
  IRVisitor: GraphQLIRVisitor,
  MultiReporter: GraphQLMultiReporter,
  Parser: GraphQLParser,
  Printer: GraphQLIRPrinter,
  SchemaUtils: GraphQLSchemaUtils,
  Validator: GraphQLValidator,
  WatchmanClient: GraphQLWatchmanClient,
  filterContextForNode,
  getIdentifierForArgumentValue,
  getLiteralArgumentValues,

  AutoAliasTransform,
  FilterDirectivesTransform,
  FlattenTransform,
  SkipClientFieldTransform,
  SkipRedundantNodesTransform,
  SkipUnreachableNodeTransform,
  StripUnusedVariablesTransform,
};

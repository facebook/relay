/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule GraphQLCompilerPublic
 * @format
 */

'use strict';

const ASTConvert = require('./core/ASTConvert');
const AutoAliasTransform = require('./transforms/AutoAliasTransform');
const CodegenDirectory = require('./codegen/CodegenDirectory');
const CodegenRunner = require('./codegen/CodegenRunner');
const FileParser = require('./core/FileParser');
const FilterDirectivesTransform = require('./transforms/FilterDirectivesTransform');
const GraphQLCompiler = require('./core/GraphQLCompiler');
const GraphQLCompilerContext = require('./core/GraphQLCompilerContext');
const GraphQLConsoleReporter = require('./reporters/GraphQLConsoleReporter');
const GraphQLFileParser = require('./core/GraphQLFileParser');
const GraphQLIRPrinter = require('./core/GraphQLIRPrinter');
const GraphQLIRTransformer = require('./core/GraphQLIRTransformer');
const GraphQLIRTransforms = require('./core/GraphQLIRTransforms');
const GraphQLIRVisitor = require('./core/GraphQLIRVisitor');
const GraphQLMultiReporter = require('./reporters/GraphQLMultiReporter');
const GraphQLParser = require('./core/GraphQLParser');
const GraphQLSchemaUtils = require('./core/GraphQLSchemaUtils');
const GraphQLTextParser = require('./core/GraphQLTextParser');
const GraphQLValidator = require('./core/GraphQLValidator');
const RelayFlattenTransform = require('./transforms/RelayFlattenTransform');
const SkipClientFieldTransform = require('./transforms/SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('./transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('./transforms/SkipUnreachableNodeTransform');
const StripUnusedVariablesTransform = require('./transforms/StripUnusedVariablesTransform');

const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForArgumentValue = require('./core/getIdentifierForArgumentValue');

export type {
  File,
  FileWriterInterface,
  CompileResult,
} from './codegen/CodegenTypes';
export type {FileFilter, WatchmanExpression} from './codegen/CodegenWatcher';
export type {
  CompiledNode,
  CompiledDocumentMap,
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
  IR,
  RootArgumentDefinition,
  InlineFragment,
  Handle,
  LinkedField,
  ListValue,
  Literal,
  LocalArgumentDefinition,
  Node,
  ObjectFieldValue,
  ObjectValue,
  Root,
  ScalarFieldType,
  ScalarField,
  Selection,
  Variable,
} from './core/GraphQLIR';
export type {IRTransform} from './core/GraphQLIRTransforms';
export type {FlattenOptions} from './transforms/RelayFlattenTransform';

module.exports = {
  ASTConvert: ASTConvert,
  CodegenDirectory: CodegenDirectory,
  CodegenRunner: CodegenRunner,
  Compiler: GraphQLCompiler,
  CompilerContext: GraphQLCompilerContext,
  ConsoleReporter: GraphQLConsoleReporter,
  FileParser: FileParser,
  filterContextForNode: filterContextForNode,
  GraphQLFileParser: GraphQLFileParser,
  GraphQLIRTransforms: GraphQLIRTransforms,
  getIdentifierForArgumentValue: getIdentifierForArgumentValue,
  GraphQLSchemaUtils: GraphQLSchemaUtils,
  GraphQLTextParser: GraphQLTextParser,
  GraphQLValidator: GraphQLValidator,
  IRTransformer: GraphQLIRTransformer,
  IRVisitor: GraphQLIRVisitor,
  MultiReporter: GraphQLMultiReporter,
  GraphQLParser,
  Printer: GraphQLIRPrinter,

  AutoAliasTransform: AutoAliasTransform,
  FilterDirectivesTransform: FilterDirectivesTransform,
  FlattenTransform: RelayFlattenTransform,
  SkipClientFieldTransform: SkipClientFieldTransform,
  SkipRedundantNodesTransform: SkipRedundantNodesTransform,
  SkipUnreachableNodeTransform: SkipUnreachableNodeTransform,
  StripUnusedVariablesTransform: StripUnusedVariablesTransform,
};

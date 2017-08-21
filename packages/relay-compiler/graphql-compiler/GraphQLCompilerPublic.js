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
const CodegenRunner = require('./codegen/RelayCodegenRunner');
const FileParser = require('./core/FileParser');
const FilterDirectivesTransform = require('./transforms/FilterDirectivesTransform');
const GraphQLFileParser = require('./core/GraphQLFileParser');
const GraphQLIRTransforms = require('./core/GraphQLIRTransforms');
const GraphQLSchemaUtils = require('./core/GraphQLSchemaUtils');
const GraphQLTextParser = require('./core/GraphQLTextParser');
const GraphQLValidator = require('./core/GraphQLValidator');
const RelayCompiler = require('./core/RelayCompiler');
const RelayCompilerContext = require('./core/RelayCompilerContext');
const RelayConsoleReporter = require('./reporters/RelayConsoleReporter');
const RelayFlattenTransform = require('./transforms/RelayFlattenTransform');
const RelayIRTransformer = require('./core/RelayIRTransformer');
const RelayIRVisitor = require('./core/RelayIRVisitor');
const RelayMultiReporter = require('./reporters/RelayMultiReporter');
const RelayParser = require('./core/RelayParser');
const RelayPrinter = require('./core/RelayPrinter');
const SkipClientFieldTransform = require('./transforms/SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('./transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('./transforms/SkipUnreachableNodeTransform');
const StripUnusedVariablesTransform = require('./transforms/StripUnusedVariablesTransform');

const filterContextForNode = require('./core/filterContextForNode');
const getIdentifierForRelayArgumentValue = require('./core/getIdentifierForRelayArgumentValue');

export type {
  CompiledNode,
  CompiledDocumentMap,
  CompilerTransforms,
} from './core/RelayCompiler';
export type {
  File,
  FileWriterInterface,
  CompileResult,
} from './codegen/RelayCodegenTypes';
export type {
  FileFilter,
  WatchmanExpression,
} from './codegen/RelayCodegenWatcher';
export type {IRTransform} from './core/GraphQLIRTransforms';
export type {FlattenOptions} from './transforms/RelayFlattenTransform';
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
} from './core/RelayIR';

module.exports = {
  ASTConvert: ASTConvert,
  CodegenDirectory: CodegenDirectory,
  CodegenRunner: CodegenRunner,
  Compiler: RelayCompiler,
  CompilerContext: RelayCompilerContext,
  ConsoleReporter: RelayConsoleReporter,
  FileParser: FileParser,
  filterContextForNode: filterContextForNode,
  GraphQLFileParser: GraphQLFileParser,
  GraphQLIRTransforms: GraphQLIRTransforms,
  getIdentifierForRelayArgumentValue: getIdentifierForRelayArgumentValue,
  GraphQLSchemaUtils: GraphQLSchemaUtils,
  GraphQLTextParser: GraphQLTextParser,
  GraphQLValidator: GraphQLValidator,
  IRTransformer: RelayIRTransformer,
  IRVisitor: RelayIRVisitor,
  MultiReporter: RelayMultiReporter,
  RelayParser: RelayParser,
  Printer: RelayPrinter,

  AutoAliasTransform: AutoAliasTransform,
  FilterDirectivesTransform: FilterDirectivesTransform,
  FlattenTransform: RelayFlattenTransform,
  SkipClientFieldTransform: SkipClientFieldTransform,
  SkipRedundantNodesTransform: SkipRedundantNodesTransform,
  SkipUnreachableNodeTransform: SkipUnreachableNodeTransform,
  StripUnusedVariablesTransform: StripUnusedVariablesTransform,
};

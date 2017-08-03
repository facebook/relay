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

const ASTConvert = require('ASTConvert');
const AutoAliasTransform = require('AutoAliasTransform');
const CodegenDirectory = require('CodegenDirectory');
const CodegenRunner = require('RelayCodegenRunner');
const FileParser = require('FileParser');
const FilterDirectivesTransform = require('FilterDirectivesTransform');
const GraphQLFileParser = require('GraphQLFileParser');
const GraphQLIRTransforms = require('GraphQLIRTransforms');
const GraphQLTextParser = require('GraphQLTextParser');
const GraphQLValidator = require('GraphQLValidator');
const RelayCompiler = require('RelayCompiler');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayConsoleReporter = require('RelayConsoleReporter');
const RelayFlattenTransform = require('RelayFlattenTransform');
const RelayIRTransformer = require('RelayIRTransformer');
const RelayIRVisitor = require('RelayIRVisitor');
const RelayMultiReporter = require('RelayMultiReporter');
const RelayParser = require('RelayParser');
const RelayPrinter = require('RelayPrinter');
const SkipClientFieldTransform = require('SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('SkipUnreachableNodeTransform');
const StripUnusedVariablesTransform = require('StripUnusedVariablesTransform');

const filterContextForNode = require('filterContextForNode');
const getIdentifierForRelayArgumentValue = require('getIdentifierForRelayArgumentValue');

export type {
  CompiledNode,
  CompiledDocumentMap,
  CompilerTransforms,
} from 'RelayCompiler';
export type {File, FileWriterInterface, CompileResult} from 'RelayCodegenTypes';
export type {FileFilter, WatchmanExpression} from 'RelayCodegenWatcher';
export type {IRTransform} from 'GraphQLIRTransforms';
export type {FlattenOptions} from 'RelayFlattenTransform';
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
} from 'RelayIR';

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

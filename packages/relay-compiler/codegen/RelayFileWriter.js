/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayFlowGenerator = require('../core/RelayFlowGenerator');
const RelayParser = require('../core/RelayParser');
const RelayValidator = require('../core/RelayValidator');

const compileRelayArtifacts = require('./compileRelayArtifacts');
const crypto = require('crypto');
const graphql = require('graphql');
const invariant = require('invariant');
const path = require('path');
const writeRelayGeneratedFile = require('./writeRelayGeneratedFile');

const {
  ASTConvert,
  CodegenDirectory,
  CompilerContext,
  Profiler,
  SchemaUtils,
} = require('graphql-compiler');
const {Map: ImmutableMap} = require('immutable');

import type {ScalarTypeMapping} from '../core/RelayFlowTypeTransformers';
import type {RelayCompilerTransforms} from './compileRelayArtifacts';
import type {FormatModule} from './writeRelayGeneratedFile';
import type {
  FileWriterInterface,
  Reporter,
  SourceControl,
} from 'graphql-compiler';
import type {DocumentNode, GraphQLSchema, ValidationContext} from 'graphql';

const {isExecutableDefinitionAST} = SchemaUtils;

export type GenerateExtraFiles = (
  getOutputDirectory: (path?: string) => CodegenDirectory,
  compilerContext: CompilerContext,
  getGeneratedDirectory: (definitionName: string) => CodegenDirectory,
) => void;

export type ValidationRule = (context: ValidationContext) => any;

export type WriterConfig = {
  baseDir: string,
  compilerTransforms: RelayCompilerTransforms,
  customScalars: ScalarTypeMapping,
  formatModule: FormatModule,
  generateExtraFiles?: GenerateExtraFiles,
  inputFieldWhiteListForFlow: Array<string>,
  outputDir?: string,
  generatedDirectories?: Array<string>,
  persistQuery?: (text: string) => Promise<string>,
  platform?: string,
  relayRuntimeModule?: string,
  schemaExtensions: Array<string>,
  noFutureProofEnums: boolean,
  useHaste: boolean,
  // Haste style module that exports flow types for GraphQL enums.
  // TODO(T22422153) support non-haste environments
  enumsHasteModule?: string,
  validationRules?: {
    GLOBAL_RULES?: Array<ValidationRule>,
    LOCAL_RULES?: Array<ValidationRule>,
  },
};

class RelayFileWriter implements FileWriterInterface {
  _onlyValidate: boolean;
  _config: WriterConfig;
  _baseSchema: GraphQLSchema;
  _baseDocuments: ImmutableMap<string, DocumentNode>;
  _documents: ImmutableMap<string, DocumentNode>;
  _reporter: Reporter;
  _sourceControl: ?SourceControl;

  constructor({
    config,
    onlyValidate,
    baseDocuments,
    documents,
    schema,
    reporter,
    sourceControl,
  }: {|
    config: WriterConfig,
    onlyValidate: boolean,
    baseDocuments: ImmutableMap<string, DocumentNode>,
    documents: ImmutableMap<string, DocumentNode>,
    schema: GraphQLSchema,
    reporter: Reporter,
    sourceControl: ?SourceControl,
  |}) {
    this._baseDocuments = baseDocuments || ImmutableMap();
    this._baseSchema = schema;
    this._config = config;
    this._documents = documents;
    this._onlyValidate = onlyValidate;
    this._reporter = reporter;
    this._sourceControl = sourceControl;

    validateConfig(this._config);
  }

  writeAll(): Promise<Map<string, CodegenDirectory>> {
    return Profiler.asyncContext('RelayFileWriter.writeAll', async () => {
      // Can't convert to IR unless the schema already has Relay-local extensions
      const transformedSchema = ASTConvert.transformASTSchema(
        this._baseSchema,
        this._config.schemaExtensions,
      );
      const extendedSchema = ASTConvert.extendASTSchema(
        transformedSchema,
        this._baseDocuments
          .merge(this._documents)
          .valueSeq()
          .toArray(),
      );

      // Build a context from all the documents
      const baseDefinitionNames = new Set();
      this._baseDocuments.forEach(doc => {
        doc.definitions.forEach(def => {
          if (isExecutableDefinitionAST(def) && def.name) {
            baseDefinitionNames.add(def.name.value);
          }
        });
      });
      const definitionsMeta = new Map();
      const getDefinitionMeta = (definitionName: string) => {
        const definitionMeta = definitionsMeta.get(definitionName);
        invariant(
          definitionMeta,
          'RelayFileWriter: Could not determine source for definition: `%s`.',
          definitionName,
        );
        return definitionMeta;
      };
      const allOutputDirectories: Map<string, CodegenDirectory> = new Map();
      const addCodegenDir = dirPath => {
        const codegenDir = new CodegenDirectory(dirPath, {
          onlyValidate: this._onlyValidate,
        });
        allOutputDirectories.set(dirPath, codegenDir);
        return codegenDir;
      };

      for (const existingDirectory of this._config.generatedDirectories || []) {
        addCodegenDir(existingDirectory);
      }

      let configOutputDirectory;
      if (this._config.outputDir) {
        configOutputDirectory = addCodegenDir(this._config.outputDir);
      }

      this._documents.forEach((doc, filePath) => {
        doc.definitions.forEach(def => {
          if (def.name) {
            definitionsMeta.set(def.name.value, {
              dir: path.join(this._config.baseDir, path.dirname(filePath)),
              ast: def,
            });
          }
        });
      });

      // Verify using local and global rules, can run global verifications here
      // because all files are processed together
      let validationRules = [
        ...RelayValidator.LOCAL_RULES,
        ...RelayValidator.GLOBAL_RULES,
      ];
      const customizedValidationRules = this._config.validationRules;
      if (customizedValidationRules) {
        validationRules = [
          ...validationRules,
          ...(customizedValidationRules.LOCAL_RULES || []),
          ...(customizedValidationRules.GLOBAL_RULES || []),
        ];
      }

      const definitions = ASTConvert.convertASTDocumentsWithBase(
        extendedSchema,
        this._baseDocuments.valueSeq().toArray(),
        this._documents.valueSeq().toArray(),
        validationRules,
        RelayParser.transform.bind(RelayParser),
      );

      const compilerContext = new CompilerContext(
        this._baseSchema,
        extendedSchema,
      ).addAll(definitions);

      const getGeneratedDirectory = definitionName => {
        if (configOutputDirectory) {
          return configOutputDirectory;
        }
        const generatedPath = path.join(
          getDefinitionMeta(definitionName).dir,
          '__generated__',
        );
        let cachedDir = allOutputDirectories.get(generatedPath);
        if (!cachedDir) {
          cachedDir = addCodegenDir(generatedPath);
        }
        return cachedDir;
      };

      const transformedFlowContext = compilerContext.applyTransforms(
        RelayFlowGenerator.flowTransforms,
        this._reporter,
      );
      const transformedQueryContext = compilerContext.applyTransforms(
        [
          ...this._config.compilerTransforms.commonTransforms,
          ...this._config.compilerTransforms.queryTransforms,
        ],
        this._reporter,
      );
      const artifacts = compileRelayArtifacts(
        compilerContext,
        this._config.compilerTransforms,
        this._reporter,
      );

      const existingFragmentNames = new Set(
        definitions.map(definition => definition.name),
      );

      // TODO(T22651734): improve this to correctly account for fragments that
      // have generated flow types.
      baseDefinitionNames.forEach(baseDefinitionName => {
        existingFragmentNames.delete(baseDefinitionName);
      });

      const formatModule = Profiler.instrument(
        this._config.formatModule,
        'RelayFileWriter:formatModule',
      );

      const persistQuery = this._config.persistQuery
        ? Profiler.instrumentWait(
            this._config.persistQuery,
            'RelayFileWriter:persistQuery',
          )
        : null;

      try {
        await Promise.all(
          artifacts.map(async node => {
            if (baseDefinitionNames.has(node.name)) {
              // don't add definitions that were part of base context
              return;
            }
            if (node.metadata && node.metadata.deferred) {
              // don't write deferred operations, the batch request is
              // responsible for them
              return;
            }
            const relayRuntimeModule =
              this._config.relayRuntimeModule || 'relay-runtime';

            const flowNode = transformedFlowContext.get(node.name);
            invariant(
              flowNode,
              'RelayFileWriter: did not compile flow types for: %s',
              node.name,
            );

            const flowTypes = RelayFlowGenerator.generate(flowNode, {
              customScalars: this._config.customScalars,
              enumsHasteModule: this._config.enumsHasteModule,
              existingFragmentNames,
              inputFieldWhiteList: this._config.inputFieldWhiteListForFlow,
              relayRuntimeModule,
              useHaste: this._config.useHaste,
              noFutureProofEnums: this._config.noFutureProofEnums,
            });

            const sourceHash = Profiler.run('hashGraphQL', () =>
              md5(graphql.print(getDefinitionMeta(node.name).ast)),
            );

            await writeRelayGeneratedFile(
              getGeneratedDirectory(node.name),
              node,
              formatModule,
              flowTypes,
              persistQuery,
              this._config.platform,
              relayRuntimeModule,
              sourceHash,
            );
          }),
        );

        const generateExtraFiles = this._config.generateExtraFiles;
        if (generateExtraFiles) {
          Profiler.run('RelayFileWriter:generateExtraFiles', () => {
            const configDirectory = this._config.outputDir;
            generateExtraFiles(
              dir => {
                const outputDirectory = dir || configDirectory;
                invariant(
                  outputDirectory,
                  'RelayFileWriter: cannot generate extra files without specifying ' +
                    'an outputDir in the config or passing it in.',
                );
                let outputDir = allOutputDirectories.get(outputDirectory);
                if (!outputDir) {
                  outputDir = addCodegenDir(outputDirectory);
                }
                return outputDir;
              },
              transformedQueryContext,
              getGeneratedDirectory,
            );
          });
        }

        // clean output directories
        allOutputDirectories.forEach(dir => {
          dir.deleteExtraFiles();
        });
        if (this._sourceControl && !this._onlyValidate) {
          await CodegenDirectory.sourceControlAddRemove(
            this._sourceControl,
            Array.from(allOutputDirectories.values()),
          );
        }
      } catch (error) {
        let details;
        try {
          details = JSON.parse(error.message);
        } catch (_) {}
        if (
          details &&
          details.name === 'GraphQL2Exception' &&
          details.message
        ) {
          throw new Error('GraphQL error writing modules:\n' + details.message);
        }
        throw new Error(
          'Error writing modules:\n' + String(error.stack || error),
        );
      }

      return allOutputDirectories;
    });
  }
}

function md5(x: string): string {
  return crypto
    .createHash('md5')
    .update(x, 'utf8')
    .digest('hex');
}

function validateConfig(config: Object): void {
  if (config.buildCommand) {
    process.stderr.write(
      'WARNING: RelayFileWriter: For RelayFileWriter to work you must ' +
        'replace config.buildCommand with config.formatModule.\n',
    );
  }
}

module.exports = RelayFileWriter;

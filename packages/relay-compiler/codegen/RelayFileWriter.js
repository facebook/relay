/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFileWriter
 * @flow
 * @format
 */

'use strict';

const ASTConvert = require('ASTConvert');
const CodegenDirectory = require('CodegenDirectory');
const RelayCompiler = require('RelayCompiler');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayFlowGenerator = require('RelayFlowGenerator');
const RelayValidator = require('RelayValidator');

const invariant = require('invariant');
const path = require('path');
const printFlowTypes = require('printFlowTypes');
const writeLegacyFlowFile = require('./writeLegacyFlowFile');
const writeRelayGeneratedFile = require('./writeRelayGeneratedFile');

const {isOperationDefinitionAST} = require('RelaySchemaUtils');
const {Map: ImmutableMap} = require('immutable');

import type {CompilerTransforms} from 'RelayCompiler';
import type {DocumentNode, GraphQLSchema} from 'graphql';
import type {FormatModule} from 'writeRelayGeneratedFile';

type GenerateExtraFiles = (
  getOutputDirectory: (path?: string) => CodegenDirectory,
  compilerContext: RelayCompilerContext,
) => void;

export type WriterConfig = {
  baseDir: string,
  formatModule: FormatModule,
  compilerTransforms: CompilerTransforms,
  generateExtraFiles?: GenerateExtraFiles,
  outputDir?: string,
  persistQuery?: (text: string) => Promise<string>,
  platform?: string,
  fragmentsWithLegacyFlowTypes?: Set<string>,
  schemaExtensions: Array<string>,
  relayRuntimeModule?: string,
  inputFieldWhiteListForFlow?: Array<string>,
};

/* eslint-disable no-console-disallow */

class RelayFileWriter {
  _onlyValidate: boolean;
  _config: WriterConfig;
  _baseSchema: GraphQLSchema;
  _baseDocuments: ImmutableMap<string, DocumentNode>;
  _documents: ImmutableMap<string, DocumentNode>;

  constructor(options: {
    config: WriterConfig,
    onlyValidate: boolean,
    baseDocuments: ImmutableMap<string, DocumentNode>,
    documents: ImmutableMap<string, DocumentNode>,
    schema: GraphQLSchema,
  }) {
    const {config, onlyValidate, baseDocuments, documents, schema} = options;
    this._baseDocuments = baseDocuments || ImmutableMap();
    this._baseSchema = schema;
    this._config = config;
    this._documents = documents;
    this._onlyValidate = onlyValidate;
  }

  async writeAll(): Promise<Map<string, CodegenDirectory>> {
    const tStart = Date.now();

    // Can't convert to IR unless the schema already has Relay-local extensions
    const transformedSchema = ASTConvert.transformASTSchema(
      this._baseSchema,
      this._config.schemaExtensions,
    );
    const extendedSchema = ASTConvert.extendASTSchema(
      transformedSchema,
      this._baseDocuments.merge(this._documents).valueSeq().toArray(),
    );

    // Build a context from all the documents
    const baseDefinitionNames = new Set();
    this._baseDocuments.forEach(doc => {
      doc.definitions.forEach(def => {
        if (isOperationDefinitionAST(def) && def.name) {
          baseDefinitionNames.add(def.name.value);
        }
      });
    });
    const definitionDirectories = new Map();
    const allOutputDirectories: Map<string, CodegenDirectory> = new Map();
    const addCodegenDir = dirPath => {
      const codegenDir = new CodegenDirectory(dirPath, {
        onlyValidate: this._onlyValidate,
      });
      allOutputDirectories.set(dirPath, codegenDir);
      return codegenDir;
    };

    let configOutputDirectory;
    if (this._config.outputDir) {
      configOutputDirectory = addCodegenDir(this._config.outputDir);
    } else {
      this._documents.forEach((doc, filePath) => {
        doc.definitions.forEach(def => {
          if (isOperationDefinitionAST(def) && def.name) {
            definitionDirectories.set(
              def.name.value,
              path.join(this._config.baseDir, path.dirname(filePath)),
            );
          }
        });
      });
    }

    const definitions = ASTConvert.convertASTDocumentsWithBase(
      extendedSchema,
      this._baseDocuments.valueSeq().toArray(),
      this._documents.valueSeq().toArray(),
      // Verify using local and global rules, can run global verifications here
      // because all files are processed together
      [...RelayValidator.LOCAL_RULES, ...RelayValidator.GLOBAL_RULES],
    );

    const compilerContext = new RelayCompilerContext(extendedSchema);
    const compiler = new RelayCompiler(
      this._baseSchema,
      compilerContext,
      this._config.compilerTransforms,
    );

    const getGeneratedDirectory = definitionName => {
      if (configOutputDirectory) {
        return configOutputDirectory;
      }
      const definitionDir = definitionDirectories.get(definitionName);
      invariant(
        definitionDir,
        'RelayFileWriter: Could not determine source directory for definition: %s',
        definitionName,
      );
      const generatedPath = path.join(definitionDir, '__generated__');
      let cachedDir = allOutputDirectories.get(generatedPath);
      if (!cachedDir) {
        cachedDir = addCodegenDir(generatedPath);
      }
      return cachedDir;
    };

    const nodes = compiler.addDefinitions(definitions);

    const transformedQueryContext = compiler.transformedQueryContext();
    const compiledDocumentMap = compiler.compile();

    const tCompiled = Date.now();

    let tGenerated;
    try {
      await Promise.all(
        nodes.map(async node => {
          if (baseDefinitionNames.has(node.name)) {
            // don't add definitions that were part of base context
            return;
          }
          if (
            this._config.fragmentsWithLegacyFlowTypes &&
            this._config.fragmentsWithLegacyFlowTypes.has(node.name)
          ) {
            const legacyFlowTypes = printFlowTypes(node);
            if (legacyFlowTypes) {
              writeLegacyFlowFile(
                getGeneratedDirectory(node.name),
                node.name,
                legacyFlowTypes,
                this._config.platform,
              );
            }
          }

          const flowTypes = RelayFlowGenerator.generate(
            node,
            this._config.inputFieldWhiteListForFlow,
          );
          const compiledNode = compiledDocumentMap.get(node.name);
          invariant(
            compiledNode,
            'RelayCompiler: did not compile definition: %s',
            node.name,
          );
          await writeRelayGeneratedFile(
            getGeneratedDirectory(compiledNode.name),
            compiledNode,
            this._config.formatModule,
            flowTypes,
            this.skipPersist ? null : this._config.persistQuery,
            this._config.platform,
            this._config.relayRuntimeModule || 'relay-runtime',
          );
        }),
      );
      tGenerated = Date.now();

      if (this._config.generateExtraFiles) {
        const configDirectory = this._config.outputDir;
        invariant(
          configDirectory,
          'RelayFileWriter: cannot generate extra files without specifying ' +
            ' an outputDir in the config.',
        );

        this._config.generateExtraFiles(dir => {
          const outputDirectory = dir || configDirectory;
          let outputDir = allOutputDirectories.get(outputDirectory);
          if (!outputDir) {
            outputDir = addCodegenDir(outputDirectory);
          }
          return outputDir;
        }, transformedQueryContext);
      }

      // clean output directories
      allOutputDirectories.forEach(dir => {
        dir.deleteExtraFiles();
      });
    } catch (error) {
      tGenerated = Date.now();
      let details;
      try {
        details = JSON.parse(error.message);
      } catch (_) {}
      if (details && details.name === 'GraphQL2Exception' && details.message) {
        console.log('ERROR writing modules:\n' + details.message);
      } else {
        console.log('Error writing modules:\n' + error.toString());
      }
      return allOutputDirectories;
    }

    const tExtra = Date.now();
    console.log(
      'Writer time: %s [%s compiling, %s generating, %s extra]',
      toSeconds(tStart, tExtra),
      toSeconds(tStart, tCompiled),
      toSeconds(tCompiled, tGenerated),
      toSeconds(tGenerated, tExtra),
    );
    return allOutputDirectories;
  }
}

function toSeconds(t0, t1) {
  return ((t1 - t0) / 1000).toFixed(2) + 's';
}

module.exports = RelayFileWriter;

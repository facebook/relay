/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const ASTConvert = require('../core/ASTConvert');
const CodegenDirectory = require('../codegen/CodegenDirectory');
const CompilerContext = require('../core/GraphQLCompilerContext');
const Profiler = require('../core/GraphQLCompilerProfiler');
const RelayParser = require('../core/RelayParser');
const RelayValidator = require('../core/RelayValidator');
const SchemaUtils = require('../core/GraphQLSchemaUtils');
const SplitNaming = require('../core/GraphQLIRSplitNaming');

const compileRelayArtifacts = require('./compileRelayArtifacts');
const crypto = require('crypto');
const graphql = require('graphql');
const invariant = require('invariant');
const path = require('path');
const writeRelayGeneratedFile = require('./writeRelayGeneratedFile');

const {Map: ImmutableMap} = require('immutable');

import type {
  FormatModule,
  TypeGenerator,
} from '../language/RelayLanguagePluginInterface';
import type {ScalarTypeMapping} from '../language/javascript/RelayFlowTypeTransformers';
import type {GraphQLReporter as Reporter} from '../reporters/GraphQLReporter';
import type {SourceControl} from './SourceControl';
import type {RelayCompilerTransforms} from './compileRelayArtifacts';
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
  optionalInputFieldsForFlow: Array<string>,
  outputDir?: ?string,
  generatedDirectories?: Array<string>,
  persistQuery?: ?(text: string, id: string) => Promise<string>,
  platform?: string,
  schemaExtensions: Array<string>,
  noFutureProofEnums: boolean,
  useHaste: boolean,
  extension: string,
  typeGenerator: TypeGenerator,
  // Haste style module that exports flow types for GraphQL enums.
  // TODO(T22422153) support non-haste environments
  enumsHasteModule?: string,
  validationRules?: {
    GLOBAL_RULES?: Array<ValidationRule>,
    LOCAL_RULES?: Array<ValidationRule>,
  },
  printModuleDependency?: string => string,
  // EXPERIMENTAL: skips deleting extra files in the generated directories
  experimental_noDeleteExtraFiles?: boolean,
  // EXPERIMENTAL: skips deleting extra files with the supplied pattern in
  // the generated directories.
  // TODO (T35012551): Remove this when no longer necessary with a better
  // directory structure.
  experimental_extraFilesPatternToKeep?: RegExp,
};

function compileAll({
  baseDir,
  baseDocuments,
  baseSchema,
  compilerTransforms,
  documents,
  extraValidationRules,
  reporter,
  schemaExtensions,
  typeGenerator,
}: {|
  baseDir: string,
  baseDocuments: $ReadOnlyArray<DocumentNode>,
  baseSchema: GraphQLSchema,
  compilerTransforms: RelayCompilerTransforms,
  documents: $ReadOnlyArray<DocumentNode>,
  extraValidationRules?: {
    GLOBAL_RULES?: Array<ValidationRule>,
    LOCAL_RULES?: Array<ValidationRule>,
  },
  reporter: Reporter,
  schemaExtensions: Array<string>,
  typeGenerator: TypeGenerator,
|}) {
  // Can't convert to IR unless the schema already has Relay-local extensions
  const transformedSchema = ASTConvert.transformASTSchema(
    baseSchema,
    schemaExtensions,
  );
  const extendedSchema = ASTConvert.extendASTSchema(transformedSchema, [
    ...baseDocuments,
    ...documents,
  ]);

  // Verify using local and global rules, can run global verifications here
  // because all files are processed together
  let validationRules = [
    ...RelayValidator.LOCAL_RULES,
    ...RelayValidator.GLOBAL_RULES,
  ];
  if (extraValidationRules) {
    validationRules = [
      ...validationRules,
      ...(extraValidationRules.LOCAL_RULES || []),
      ...(extraValidationRules.GLOBAL_RULES || []),
    ];
  }

  const definitions = ASTConvert.convertASTDocumentsWithBase(
    extendedSchema,
    baseDocuments,
    documents,
    validationRules,
    RelayParser.transform,
  );

  const compilerContext = new CompilerContext(
    baseSchema,
    extendedSchema,
  ).addAll(definitions);

  const transformedTypeContext = compilerContext.applyTransforms(
    typeGenerator.transforms,
    reporter,
  );
  const transformedQueryContext = compilerContext.applyTransforms(
    [
      ...compilerTransforms.commonTransforms,
      ...compilerTransforms.queryTransforms,
    ],
    reporter,
  );
  const artifacts = compileRelayArtifacts(
    compilerContext,
    compilerTransforms,
    reporter,
  );

  return {
    artifacts,
    definitions,
    transformedQueryContext,
    transformedTypeContext,
  };
}

function writeAll({
  config: writerConfig,
  onlyValidate,
  baseDocuments,
  documents,
  schema: baseSchema,
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
|}): Promise<Map<string, CodegenDirectory>> {
  return Profiler.asyncContext('RelayFileWriter.writeAll', async () => {
    const {
      artifacts,
      definitions,
      transformedTypeContext,
      transformedQueryContext,
    } = compileAll({
      baseDir: writerConfig.baseDir,
      baseDocuments: baseDocuments.valueSeq().toArray(),
      baseSchema,
      compilerTransforms: writerConfig.compilerTransforms,
      documents: documents.valueSeq().toArray(),
      extraValidationRules: writerConfig.validationRules,
      reporter,
      schemaExtensions: writerConfig.schemaExtensions,
      typeGenerator: writerConfig.typeGenerator,
    });

    const existingFragmentNames = new Set(
      definitions.map(definition => definition.name),
    );

    // Build a context from all the documents
    const baseDefinitionNames = new Set();
    baseDocuments.forEach(doc => {
      doc.definitions.forEach(def => {
        if (isExecutableDefinitionAST(def) && def.name) {
          baseDefinitionNames.add(def.name.value);
        }
      });
    });
    const definitionsMeta = new Map();
    const getDefinitionMeta = (definitionName: string) => {
      const definitionMeta = definitionsMeta.get(
        SplitNaming.getOriginalName(definitionName),
      );
      invariant(
        definitionMeta,
        'RelayFileWriter: Could not determine source for definition: `%s`.',
        definitionName,
      );
      return definitionMeta;
    };
    documents.forEach((doc, filePath) => {
      doc.definitions.forEach(def => {
        if (def.name) {
          definitionsMeta.set(def.name.value, {
            dir: path.join(writerConfig.baseDir, path.dirname(filePath)),
            ast: def,
          });
        }
      });
    });

    // TODO(T22651734): improve this to correctly account for fragments that
    // have generated flow types.
    baseDefinitionNames.forEach(baseDefinitionName => {
      existingFragmentNames.delete(baseDefinitionName);
    });

    const allOutputDirectories: Map<string, CodegenDirectory> = new Map();
    const addCodegenDir = dirPath => {
      const codegenDir = new CodegenDirectory(dirPath, {
        onlyValidate: onlyValidate,
      });
      allOutputDirectories.set(dirPath, codegenDir);
      return codegenDir;
    };

    for (const existingDirectory of writerConfig.generatedDirectories || []) {
      addCodegenDir(existingDirectory);
    }

    let configOutputDirectory;
    if (writerConfig.outputDir) {
      configOutputDirectory = addCodegenDir(writerConfig.outputDir);
    }

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

    const formatModule = Profiler.instrument(
      writerConfig.formatModule,
      'RelayFileWriter:formatModule',
    );

    const persistQuery = writerConfig.persistQuery
      ? Profiler.instrumentWait(
          writerConfig.persistQuery,
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

          const typeNode = transformedTypeContext.get(node.name);
          const typeText = typeNode
            ? writerConfig.typeGenerator.generate(typeNode, {
                customScalars: writerConfig.customScalars,
                enumsHasteModule: writerConfig.enumsHasteModule,
                existingFragmentNames,
                optionalInputFields: writerConfig.optionalInputFieldsForFlow,
                useHaste: writerConfig.useHaste,
                useSingleArtifactDirectory: !!writerConfig.outputDir,
                noFutureProofEnums: writerConfig.noFutureProofEnums,
              })
            : '';

          const sourceHash = Profiler.run('hashGraphQL', () =>
            md5(graphql.print(getDefinitionMeta(node.name).ast)),
          );

          await writeRelayGeneratedFile(
            getGeneratedDirectory(node.name),
            node,
            formatModule,
            typeText,
            persistQuery,
            writerConfig.platform,
            sourceHash,
            writerConfig.extension,
            writerConfig.printModuleDependency,
          );
        }),
      );

      const generateExtraFiles = writerConfig.generateExtraFiles;
      if (generateExtraFiles) {
        Profiler.run('RelayFileWriter:generateExtraFiles', () => {
          const configDirectory = writerConfig.outputDir;
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
      if (writerConfig.experimental_noDeleteExtraFiles !== true) {
        allOutputDirectories.forEach(dir => {
          dir.deleteExtraFiles(
            writerConfig.experimental_extraFilesPatternToKeep,
          );
        });
      }
      if (sourceControl && !onlyValidate) {
        await CodegenDirectory.sourceControlAddRemove(
          sourceControl,
          Array.from(allOutputDirectories.values()),
        );
      }
    } catch (error) {
      let details;
      try {
        details = JSON.parse(error.message);
      } catch (_) {} // eslint-disable-line lint/no-unused-catch-bindings
      if (details && details.name === 'GraphQL2Exception' && details.message) {
        throw new Error('GraphQL error writing modules:\n' + details.message);
      }
      throw new Error(
        'Error writing modules:\n' + String(error.stack || error),
      );
    }

    return allOutputDirectories;
  });
}

function md5(x: string): string {
  return crypto
    .createHash('md5')
    .update(x, 'utf8')
    .digest('hex');
}

module.exports = {
  writeAll,
};

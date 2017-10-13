/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule CodegenRunner
 * @flow
 * @format
 */

'use strict';

const CodegenDirectory = require('./CodegenDirectory');
const CodegenWatcher = require('./CodegenWatcher');
const GraphQLWatchmanClient = require('../core/GraphQLWatchmanClient');

const invariant = require('invariant');
const path = require('path');

const {Map: ImmutableMap} = require('immutable');

import type ASTCache from '../core/ASTCache';
import type {GraphQLReporter} from '../reporters/GraphQLReporter';
import type {CompileResult, File, FileWriterInterface} from './CodegenTypes';
import type {FileFilter, WatchmanExpression} from './CodegenWatcher';
import type {DocumentNode, GraphQLSchema} from 'graphql';

export type ParserConfig = {|
  baseDir: string,
  getFileFilter?: (baseDir: string) => FileFilter,
  getParser: (baseDir: string) => ASTCache,
  getSchema: () => GraphQLSchema,
  watchmanExpression?: ?WatchmanExpression,
  filepaths?: ?Array<string>,
|};

type ParserConfigs = {
  [parser: string]: ParserConfig,
};
type Parsers = {
  [parser: string]: ASTCache,
};

export type WriterConfig = {
  parser: string,
  baseParsers?: Array<string>,
  isGeneratedFile: (filePath: string) => boolean,
  getWriter: GetWriter,
};

type WriterConfigs = {
  [writer: string]: WriterConfig,
};

export type GetWriter = (
  onlyValidate: boolean,
  schema: GraphQLSchema,
  documents: ImmutableMap<string, DocumentNode>,
  baseDocuments: ImmutableMap<string, DocumentNode>,
) => FileWriterInterface;

class CodegenRunner {
  parserConfigs: ParserConfigs;
  writerConfigs: WriterConfigs;
  onlyValidate: boolean;
  parsers: Parsers = {};
  // parser => writers that are affected by it
  parserWriters: {[parser: string]: Set<string>};
  _reporter: GraphQLReporter;

  constructor(options: {
    parserConfigs: ParserConfigs,
    writerConfigs: WriterConfigs,
    onlyValidate: boolean,
    reporter: GraphQLReporter,
  }) {
    this.parserConfigs = options.parserConfigs;
    this.writerConfigs = options.writerConfigs;
    this.onlyValidate = options.onlyValidate;
    this._reporter = options.reporter;

    this.parserWriters = {};
    for (const parser in options.parserConfigs) {
      this.parserWriters[parser] = new Set();
    }

    for (const writer in options.writerConfigs) {
      const config = options.writerConfigs[writer];
      config.baseParsers &&
        config.baseParsers.forEach(parser =>
          this.parserWriters[parser].add(writer),
        );
      this.parserWriters[config.parser].add(writer);
    }
  }

  async compileAll(): Promise<CompileResult> {
    // reset the parsers
    this.parsers = {};
    for (const parserName in this.parserConfigs) {
      try {
        await this.parseEverything(parserName);
      } catch (e) {
        this._reporter.reportError('CodegenRunner.compileAll', e);
        return 'ERROR';
      }
    }

    let hasChanges = false;
    for (const writerName in this.writerConfigs) {
      const result = await this.write(writerName);
      if (result === 'ERROR') {
        return 'ERROR';
      }
      if (result === 'HAS_CHANGES') {
        hasChanges = true;
      }
    }
    return hasChanges ? 'HAS_CHANGES' : 'NO_CHANGES';
  }

  async compile(writerName: string): Promise<CompileResult> {
    const writerConfig = this.writerConfigs[writerName];

    const parsers = [writerConfig.parser];
    if (writerConfig.baseParsers) {
      writerConfig.baseParsers.forEach(parser => parsers.push(parser));
    }
    // Don't bother resetting the parsers
    await Promise.all(parsers.map(parser => this.parseEverything(parser)));

    return await this.write(writerName);
  }

  async getDirtyWriters(filePaths: Array<string>): Promise<Set<string>> {
    const dirtyWriters = new Set();

    // Check if any files are in the output
    for (const configName in this.writerConfigs) {
      const config = this.writerConfigs[configName];
      for (const filePath of filePaths) {
        if (config.isGeneratedFile(filePath)) {
          dirtyWriters.add(configName);
        }
      }
    }

    const client = new GraphQLWatchmanClient();

    // Check for files in the input
    await Promise.all(
      Object.keys(this.parserConfigs).map(async parserConfigName => {
        const config = this.parserConfigs[parserConfigName];
        const dirs = await client.watchProject(config.baseDir);

        const relativeFilePaths = filePaths.map(filePath =>
          path.relative(config.baseDir, filePath),
        );

        const query = {
          expression: [
            'allof',
            config.watchmanExpression,
            ['name', relativeFilePaths, 'wholename'],
          ],
          fields: ['exists'],
          relative_root: dirs.relativePath,
        };

        const result = await client.command('query', dirs.root, query);
        if (result.files.length > 0) {
          this.parserWriters[parserConfigName].forEach(writerName =>
            dirtyWriters.add(writerName),
          );
        }
      }),
    );

    client.end();
    return dirtyWriters;
  }

  async parseEverything(parserName: string): Promise<void> {
    if (this.parsers[parserName]) {
      // no need to parse
      return;
    }

    const parserConfig = this.parserConfigs[parserName];
    this.parsers[parserName] = parserConfig.getParser(parserConfig.baseDir);
    const filter = parserConfig.getFileFilter
      ? parserConfig.getFileFilter(parserConfig.baseDir)
      : anyFileFilter;

    if (parserConfig.filepaths && parserConfig.watchmanExpression) {
      throw new Error(
        'Provide either `watchmanExpression` or `filepaths` but not both.',
      );
    }

    let files;
    if (parserConfig.watchmanExpression) {
      files = await CodegenWatcher.queryFiles(
        parserConfig.baseDir,
        parserConfig.watchmanExpression,
        filter,
      );
    } else if (parserConfig.filepaths) {
      files = await CodegenWatcher.queryFilepaths(
        parserConfig.baseDir,
        parserConfig.filepaths,
        filter,
      );
    } else {
      throw new Error(
        'Either `watchmanExpression` or `filepaths` is required to query files',
      );
    }
    this.parseFileChanges(parserName, files);
  }

  parseFileChanges(parserName: string, files: Set<File>): void {
    const tStart = Date.now();
    const parser = this.parsers[parserName];
    // this maybe should be await parser.parseFiles(files);
    parser.parseFiles(files);
    const tEnd = Date.now();
    // eslint-disable-next-line no-console
    console.log('Parsed %s in %s', parserName, toSeconds(tStart, tEnd));
  }

  // We cannot do incremental writes right now.
  // When we can, this could be writeChanges(writerName, parserName, parsedDefinitions)
  async write(writerName: string): Promise<CompileResult> {
    try {
      // eslint-disable-next-line no-console
      console.log('\nWriting %s', writerName);
      const tStart = Date.now();
      const {
        getWriter,
        parser,
        baseParsers,
        isGeneratedFile,
      } = this.writerConfigs[writerName];

      let baseDocuments = ImmutableMap();
      if (baseParsers) {
        baseParsers.forEach(baseParserName => {
          baseDocuments = baseDocuments.merge(
            this.parsers[baseParserName].documents(),
          );
        });
      }

      // always create a new writer: we have to write everything anyways
      const documents = this.parsers[parser].documents();
      const schema = this.parserConfigs[parser].getSchema();
      const writer = getWriter(
        this.onlyValidate,
        schema,
        documents,
        baseDocuments,
      );

      const outputDirectories = await writer.writeAll();

      const tWritten = Date.now();

      for (const dir of outputDirectories.values()) {
        const all = [
          ...dir.changes.created,
          ...dir.changes.updated,
          ...dir.changes.deleted,
          ...dir.changes.unchanged,
        ];
        for (const filename of all) {
          const filePath = dir.getPath(filename);
          invariant(
            isGeneratedFile(filePath),
            'CodegenRunner: %s returned false for isGeneratedFile, ' +
              'but was in generated directory',
            filePath,
          );
        }
      }

      const combinedChanges = CodegenDirectory.combineChanges(
        Array.from(outputDirectories.values()),
      );
      CodegenDirectory.printChanges(combinedChanges, {
        onlyValidate: this.onlyValidate,
      });
      // eslint-disable-next-line no-console
      console.log('Written %s in %s', writerName, toSeconds(tStart, tWritten));
      return CodegenDirectory.hasChanges(combinedChanges)
        ? 'HAS_CHANGES'
        : 'NO_CHANGES';
    } catch (e) {
      this._reporter.reportError('CodegenRunner.write', e);
      return 'ERROR';
    }
  }

  async watchAll(): Promise<void> {
    // get everything set up for watching
    await this.compileAll();

    for (const parserName in this.parserConfigs) {
      await this.watch(parserName);
    }
  }

  async watch(parserName: string): Promise<void> {
    const parserConfig = this.parserConfigs[parserName];

    if (!parserConfig.watchmanExpression) {
      throw new Error('`watchmanExpression` is required to watch files');
    }

    // watchCompile starts with a full set of files as the changes
    // But as we need to set everything up due to potential parser dependencies,
    // we should prevent the first watch callback from doing anything.
    let firstChange = true;

    await CodegenWatcher.watchCompile(
      parserConfig.baseDir,
      parserConfig.watchmanExpression,
      parserConfig.getFileFilter
        ? parserConfig.getFileFilter(parserConfig.baseDir)
        : anyFileFilter,
      async files => {
        invariant(
          this.parsers[parserName],
          'Trying to watch an uncompiled parser config: %s',
          parserName,
        );
        if (firstChange) {
          firstChange = false;
          return;
        }
        const dependentWriters = [];
        this.parserWriters[parserName].forEach(writer =>
          dependentWriters.push(writer),
        );

        try {
          if (!this.parsers[parserName]) {
            // have to load the parser and make sure all of its dependents are set
            await this.parseEverything(parserName);
          } else {
            this.parseFileChanges(parserName, files);
          }
          await Promise.all(dependentWriters.map(writer => this.write(writer)));
        } catch (error) {
          this._reporter.reportError('CodegenRunner.watch', error);
        }
        // eslint-disable-next-line no-console
        console.log('Watching for changes to %s...', parserName);
      },
    );
    // eslint-disable-next-line no-console
    console.log('Watching for changes to %s...', parserName);
  }
}

function anyFileFilter(file: File): boolean {
  return true;
}

function toSeconds(t0, t1) {
  return ((t1 - t0) / 1000).toFixed(2) + 's';
}

module.exports = CodegenRunner;

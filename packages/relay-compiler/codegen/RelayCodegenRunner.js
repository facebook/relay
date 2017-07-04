/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCodegenRunner
 * @flow
 * @format
 */

'use strict';

const RelayCodegenWatcher = require('RelayCodegenWatcher');

const invariant = require('invariant');

const {Map: ImmutableMap} = require('immutable');

import type CodegenDirectory from 'CodegenDirectory';
import type FileParser from 'FileParser';
import type {CompileResult} from 'RelayCodegenTypes';
import type {File} from 'RelayCodegenTypes';
import type {FileFilter, WatchmanExpression} from 'RelayCodegenWatcher';
import type {RelayReporter} from 'RelayReporter';
import type {DocumentNode, GraphQLSchema} from 'graphql';

/* eslint-disable no-console-disallow */

interface FileWriter {
  writeAll(): Promise<Map<string, CodegenDirectory>>,
}

export type ParserConfig = {|
  baseDir: string,
  getFileFilter?: (baseDir: string) => FileFilter,
  getParser: (baseDir: string) => FileParser,
  getSchema: () => GraphQLSchema,
  watchmanExpression: WatchmanExpression,
|};

type ParserConfigs = {
  [parser: string]: ParserConfig,
};
type Parsers = {
  [parser: string]: FileParser,
};

export type WriterConfig = {
  parser: string,
  baseParsers?: Array<string>,
  getWriter: (
    onlyValidate: boolean,
    schema: GraphQLSchema,
    documents: ImmutableMap<string, DocumentNode>,
    baseDocuments: ImmutableMap<string, DocumentNode>,
  ) => FileWriter,
};

type WriterConfigs = {
  [writer: string]: WriterConfig,
};

class RelayCodegenRunner {
  parserConfigs: ParserConfigs;
  writerConfigs: WriterConfigs;
  onlyValidate: boolean;
  skipPersist: boolean;
  parsers: Parsers = {};
  // parser => writers that are affected by it
  parserWriters: {[parser: string]: Set<string>};
  _reporter: RelayReporter;

  constructor(options: {
    parserConfigs: ParserConfigs,
    writerConfigs: WriterConfigs,
    onlyValidate: boolean,
    reporter: RelayReporter,
    skipPersist: boolean,
  }) {
    this.parserConfigs = options.parserConfigs;
    this.writerConfigs = options.writerConfigs;
    this.onlyValidate = options.onlyValidate;
    this.skipPersist = options.skipPersist;
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
        this._reporter.reportError('RelayCodegenRunner.compileAll', e);
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

  async parseEverything(parserName: string): Promise<void> {
    if (this.parsers[parserName]) {
      // no need to parse
      return;
    }

    const parserConfig = this.parserConfigs[parserName];
    this.parsers[parserName] = parserConfig.getParser(parserConfig.baseDir);

    const files = await RelayCodegenWatcher.queryFiles(
      parserConfig.baseDir,
      parserConfig.watchmanExpression,
      parserConfig.getFileFilter
        ? parserConfig.getFileFilter(parserConfig.baseDir)
        : anyFileFilter,
    );
    this.parseFileChanges(parserName, files);
  }

  parseFileChanges(parserName: string, files: Set<File>): void {
    const tStart = Date.now();
    const parser = this.parsers[parserName];
    // this maybe should be await parser.parseFiles(files);
    parser.parseFiles(files);
    const tEnd = Date.now();
    console.log('Parsed %s in %s', parserName, toSeconds(tStart, tEnd));
  }

  // We cannot do incremental writes right now.
  // When we can, this could be writeChanges(writerName, parserName, parsedDefinitions)
  async write(writerName: string): Promise<CompileResult> {
    try {
      console.log('\nWriting %s', writerName);
      const tStart = Date.now();
      const {getWriter, parser, baseParsers} = this.writerConfigs[writerName];

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

      function combineChanges(accessor) {
        const combined = [];
        invariant(
          outputDirectories,
          'RelayCodegenRunner: Expected outputDirectories to be set',
        );
        for (const dir of outputDirectories.values()) {
          combined.push(...accessor(dir.changes));
        }
        return combined;
      }
      const created = combineChanges(_ => _.created);
      const updated = combineChanges(_ => _.updated);
      const deleted = combineChanges(_ => _.deleted);
      const unchanged = combineChanges(_ => _.unchanged);

      if (this.onlyValidate) {
        printFiles('Missing', created);
        printFiles('Out of date', updated);
        printFiles('Extra', deleted);
      } else {
        printFiles('Created', created);
        printFiles('Updated', updated);
        printFiles('Deleted', deleted);
        console.log('Unchanged: %s files', unchanged.length);
      }

      console.log('Written %s in %s', writerName, toSeconds(tStart, tWritten));

      return created.length + updated.length + deleted.length > 0
        ? 'HAS_CHANGES'
        : 'NO_CHANGES';
    } catch (e) {
      this._reporter.reportError('RelayCodegenRunner.write', e);
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

    // watchCompile starts with a full set of files as the changes
    // But as we need to set everything up due to potential parser dependencies,
    // we should prevent the first watch callback from doing anything.
    let firstChange = true;

    await RelayCodegenWatcher.watchCompile(
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
          this._reporter.reportError('RelayCodegenRunner.watch', error);
        }
        console.log('Watching for changes to %s...', parserName);
      },
    );
    console.log('Watching for changes to %s...', parserName);
  }
}

function anyFileFilter(file: File): boolean {
  return true;
}

function toSeconds(t0, t1) {
  return ((t1 - t0) / 1000).toFixed(2) + 's';
}

function printFiles(label, files) {
  if (files.length > 0) {
    console.log(label + ':');
    files.forEach(file => {
      console.log(' - ' + file);
    });
  }
}

module.exports = RelayCodegenRunner;

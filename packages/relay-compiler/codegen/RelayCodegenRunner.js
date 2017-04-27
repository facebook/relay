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
 */

'use strict';

const RelayCodegenWatcher = require('RelayCodegenWatcher');

const invariant = require('invariant');

const {Map: ImmutableMap} = require('immutable');

import type CodegenDirectory from 'CodegenDirectory';
import type FileParser from 'FileParser';
import type {FileFilter, WatchmanExpression} from 'RelayCodegenWatcher';
import type {DocumentNode, GraphQLSchema} from 'graphql';

/* eslint-disable no-console-disallow */

interface FileWriter {
  writeAll(): Promise<Map<string, CodegenDirectory>>
}

type ParserConfig = {|
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
}

type WriterConfig = {
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

  constructor(options: {
    parserConfigs: ParserConfigs,
    writerConfigs: WriterConfigs,
    onlyValidate: boolean,
    skipPersist: boolean,
  }) {
    this.parserConfigs = options.parserConfigs;
    this.writerConfigs = options.writerConfigs;
    this.onlyValidate = options.onlyValidate;
    this.skipPersist = options.skipPersist;

    this.parserWriters = {};
    for (const parser in options.parserConfigs) {
      this.parserWriters[parser] = new Set();
    }

    for (const writer in options.writerConfigs) {
      const config = options.writerConfigs[writer];
      config.baseParsers && config.baseParsers.forEach(
        parser => this.parserWriters[parser].add(writer)
      );
      this.parserWriters[config.parser].add(writer);
    }
  }

  async compileAll(): Promise<boolean> {
    let hasChanges = false;

    // reset the parsers
    this.parsers = {};
    for (const parserName in this.parserConfigs) {
      await this.parseEverything(parserName);
    }

    for (const writerName in this.writerConfigs) {
      const writerChanges = await this.write(writerName);
      hasChanges = writerChanges || hasChanges;
    }

    return hasChanges;
  }

  async compile(writerName: string): Promise<boolean> {
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

  parseFileChanges(parserName: string, files: Set<string>): void {
    const tStart = Date.now();
    const parser = this.parsers[parserName];
    // this maybe should be await parser.parseFiles(files);
    parser.parseFiles(files);
    const tEnd = Date.now();
    console.log(
      'Parsed %s in %s',
      parserName,
      toSeconds(tStart, tEnd),
    );
  }

  // We cannot do incremental writes right now.
  // When we can, this could be writeChanges(writerName, parserName, parsedDefinitions)
  async write(writerName: string): Promise<boolean> {
    console.log('\nWriting %s', writerName);
    const tStart = Date.now();
    const {getWriter, parser, baseParsers} = this.writerConfigs[writerName];


    let baseDocuments = ImmutableMap();
    if (baseParsers) {
      baseParsers.forEach(baseParserName => {
        baseDocuments = baseDocuments.merge(this.parsers[baseParserName].documents());
      });
    }

    // always create a new writer: we have to write everything anyways
    const documents = this.parsers[parser].documents();
    const schema = this.parserConfigs[parser].getSchema();
    const writer = getWriter(this.onlyValidate, schema, documents, baseDocuments);
    const outputDirectories = await writer.writeAll();
    const tWritten = Date.now();

    function combineChanges(accessor) {
      const combined = [];
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

    console.log(
      'Written %s in %s',
      writerName,
      toSeconds(tStart, tWritten),
    );

    const hasChanges = (created.length + updated.length + deleted.length) > 0;
    return hasChanges;
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
      async (files) => {
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
        this.parserWriters[parserName].forEach(writer => dependentWriters.push(writer));
        if (!this.parsers[parserName]) {
          // have to load the parser and make sure all of its dependents are set
          await this.parseEverything(parserName);
        } else {
          this.parseFileChanges(parserName, files);
        }

        await Promise.all(dependentWriters.map((writer) => this.write(writer)));
      }
    );
    console.log('Watching for changes to %s...', parserName);
  }
}

function anyFileFilter(filename: string): boolean {
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

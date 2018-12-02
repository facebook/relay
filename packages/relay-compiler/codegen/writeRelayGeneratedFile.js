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

const CodeMarker = require('../util/CodeMarker');

const crypto = require('crypto');
const dedupeJSONStringify = require('../util/dedupeJSONStringify');
const deepMergeAssignments = require('./deepMergeAssignments');
const nullthrows = require('nullthrows');

const {Profiler} = require('graphql-compiler');
const {RelayConcreteNode} = require('relay-runtime');

import type {FormatModule} from '../language/RelayLanguagePluginInterface';
import type {CodegenDirectory} from 'graphql-compiler';
import type {GeneratedNode} from 'relay-runtime';

function printRequireModuleDependency(moduleName: string): string {
  return `require('${moduleName}')`;
}

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  generatedNode: GeneratedNode,
  formatModule: FormatModule,
  typeText: string,
  _persistQuery: ?(text: string) => Promise<string>,
  platform: ?string,
  sourceHash: string,
  extension: string,
  printModuleDependency: (
    moduleName: string,
  ) => string = printRequireModuleDependency,
): Promise<?GeneratedNode> {
  // Copy to const so Flow can refine.
  const persistQuery = _persistQuery;
  const moduleName = generatedNode.name + '.graphql';
  const platformName = platform ? moduleName + '.' + platform : moduleName;
  const filename = platformName + '.' + extension;
  const typeName =
    generatedNode.kind === RelayConcreteNode.FRAGMENT
      ? 'ConcreteFragment'
      : generatedNode.kind === RelayConcreteNode.REQUEST
        ? 'ConcreteRequest'
        : generatedNode.kind === RelayConcreteNode.SPLIT_OPERATION
          ? 'ConcreteSplitOperation'
          : null;
  const devOnlyProperties = {};

  let docText;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    docText = generatedNode.text;
  }

  let hash = null;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    const oldHash = Profiler.run('RelayFileWriter:compareHash', () => {
      const oldContent = codegenDir.read(filename);
      // Hash the concrete node including the query text.
      const hasher = crypto.createHash('md5');
      hasher.update('cache-breaker-7');
      hasher.update(JSON.stringify(generatedNode));
      hasher.update(sourceHash);
      if (typeText) {
        hasher.update(typeText);
      }
      if (persistQuery) {
        hasher.update('persisted');
      }
      hash = hasher.digest('hex');
      return extractHash(oldContent);
    });
    if (hash === oldHash) {
      codegenDir.markUnchanged(filename);
      return null;
    }
    if (codegenDir.onlyValidate) {
      codegenDir.markUpdated(filename);
      return null;
    }
    if (persistQuery) {
      switch (generatedNode.kind) {
        case RelayConcreteNode.REQUEST:
          devOnlyProperties.text = generatedNode.text;
          generatedNode = {
            ...generatedNode,
            text: null,
            id: await persistQuery(nullthrows(generatedNode.text)),
          };
          break;
        case RelayConcreteNode.FRAGMENT:
          // Do not persist fragments.
          break;
        default:
          (generatedNode.kind: empty);
      }
    }
  }

  const devOnlyAssignments = deepMergeAssignments('node', devOnlyProperties);

  const moduleText = formatModule({
    moduleName,
    documentType: typeName,
    kind: generatedNode.kind,
    docText,
    typeText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: CodeMarker.postProcess(
      dedupeJSONStringify(generatedNode),
      printModuleDependency,
    ),
    devOnlyAssignments,
    sourceHash,
  });

  codegenDir.writeFile(filename, moduleText);
  return generatedNode;
}

function extractHash(text: ?string): ?string {
  if (!text) {
    return null;
  }
  if (/<<<<<|>>>>>/.test(text)) {
    // looks like a merge conflict
    return null;
  }
  const match = text.match(/@relayHash (\w{32})\b/m);
  return match && match[1];
}

module.exports = writeRelayGeneratedFile;

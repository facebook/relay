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

const crypto = require('crypto');
const dedupeJSONStringify = require('../util/dedupeJSONStringify');
const deepMergeAssignments = require('./deepMergeAssignments');
const nullthrows = require('nullthrows');

const {Profiler} = require('graphql-compiler');
const {RelayConcreteNode} = require('relay-runtime');

import type {FormatModule} from '../language/RelayLanguagePluginInterface';
import type {CodegenDirectory} from 'graphql-compiler';
import type {GeneratedNode} from 'relay-runtime';

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  generatedNode: GeneratedNode,
  formatModule: FormatModule,
  typeText: string,
  persistQuery: ?(text: string) => Promise<string>,
  platform: ?string,
  sourceHash: string,
  extension: string,
): Promise<?GeneratedNode> {
  // Copy to const so Flow can refine.
  const _persistQuery = persistQuery;
  const moduleName = generatedNode.name + '.graphql';
  const platformName = platform ? moduleName + '.' + platform : moduleName;
  const filename = platformName + '.' + extension;
  const queryMapFilename = `${generatedNode.name}.queryMap.json`;
  const typeName =
    generatedNode.kind === RelayConcreteNode.FRAGMENT
      ? 'ConcreteFragment'
      : generatedNode.kind === RelayConcreteNode.REQUEST
        ? 'ConcreteRequest'
        : null;
  const devOnlyProperties = {};

  let docText;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    docText = generatedNode.text;
  }

  let hash = null;
  let queryMap = null;

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
      if (_persistQuery) {
        hasher.update('persisted');
      }
      hash = hasher.digest('hex');
      return extractHash(oldContent);
    });
    if (hash === oldHash) {
      codegenDir.markUnchanged(filename);

      if (_persistQuery) {
        codegenDir.markUnchanged(queryMapFilename);
      }
      return null;
    }
    if (codegenDir.onlyValidate) {
      codegenDir.markUpdated(filename);

      if (_persistQuery) {
        codegenDir.markUpdated(queryMapFilename);
      }
      return null;
    }
    if (_persistQuery) {
      switch (generatedNode.kind) {
        case RelayConcreteNode.REQUEST:
          const operationText = generatedNode.text;
          devOnlyProperties.text = operationText;
          const documentId = await _persistQuery(nullthrows(operationText));
          queryMap = {};
          queryMap[documentId] = operationText;
          generatedNode = {
            ...generatedNode,
            text: null,
            id: documentId,
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
    docText,
    typeText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: dedupeJSONStringify(generatedNode),
    devOnlyAssignments,
    sourceHash,
  });

  codegenDir.writeFile(filename, moduleText);
  if (_persistQuery && queryMap) {
    codegenDir.writeFile(queryMapFilename, JSON.stringify(queryMap, null, 2));
  }

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

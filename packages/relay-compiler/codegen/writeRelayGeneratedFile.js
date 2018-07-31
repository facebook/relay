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

const crypto = require('crypto');
const dedupeJSONStringify = require('../util/dedupeJSONStringify');
const deepMergeAssignments = require('./deepMergeAssignments');
const nullthrows = require('nullthrows');

const {Profiler} = require('graphql-compiler');
const {RelayConcreteNode} = require('relay-runtime');

import type {CodegenDirectory} from 'graphql-compiler';
import type {GeneratedNode} from 'relay-runtime';

/**
 * Generate a module for the given document name/text.
 */
export type FormatModule = ({|
  moduleName: string,
  documentType:
    | typeof RelayConcreteNode.FRAGMENT
    | typeof RelayConcreteNode.REQUEST
    | typeof RelayConcreteNode.BATCH_REQUEST,
  docText: ?string,
  concreteText: string,
  flowText: string,
  hash: ?string,
  devOnlyAssignments: ?string,
  relayRuntimeModule: string,
  sourceHash: string,
|}) => string;

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  generatedNode: GeneratedNode,
  formatModule: FormatModule,
  flowText: string,
  _persistQuery: ?(text: string) => Promise<string>,
  platform: ?string,
  relayRuntimeModule: string,
  sourceHash: string,
): Promise<?GeneratedNode> {
  // Copy to const so Flow can refine.
  const persistQuery = _persistQuery;
  const moduleName = generatedNode.name + '.graphql';
  const platformName = platform ? moduleName + '.' + platform : moduleName;
  const filename = platformName + '.js';
  const flowTypeName =
    generatedNode.kind === RelayConcreteNode.FRAGMENT
      ? 'ConcreteFragment'
      : generatedNode.kind === RelayConcreteNode.REQUEST
        ? 'ConcreteRequest'
        : generatedNode.kind === RelayConcreteNode.BATCH_REQUEST
          ? 'ConcreteBatchRequest'
          : 'empty';
  const devOnlyProperties = {};

  let docText;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    docText = generatedNode.text;
  } else if (generatedNode.kind === RelayConcreteNode.BATCH_REQUEST) {
    docText = generatedNode.requests.map(request => request.text).join('\n\n');
  }

  let hash = null;
  if (
    generatedNode.kind === RelayConcreteNode.REQUEST ||
    generatedNode.kind === RelayConcreteNode.BATCH_REQUEST
  ) {
    const oldHash = Profiler.run('RelayFileWriter:compareHash', () => {
      const oldContent = codegenDir.read(filename);
      // Hash the concrete node including the query text.
      const hasher = crypto.createHash('md5');
      hasher.update('cache-breaker-7');
      hasher.update(JSON.stringify(generatedNode));
      hasher.update(sourceHash);
      if (flowText) {
        hasher.update(flowText);
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
        case RelayConcreteNode.BATCH_REQUEST:
          devOnlyProperties.requests = generatedNode.requests.map(request => ({
            text: request.text,
          }));
          generatedNode = {
            ...generatedNode,
            requests: await Promise.all(
              generatedNode.requests.map(async request => ({
                ...request,
                text: null,
                id: await persistQuery(nullthrows(request.text)),
              })),
            ),
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
    documentType: flowTypeName,
    docText,
    flowText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: dedupeJSONStringify(generatedNode),
    devOnlyAssignments,
    relayRuntimeModule,
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

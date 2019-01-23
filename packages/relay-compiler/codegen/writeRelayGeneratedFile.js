/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const CodeMarker = require('../util/CodeMarker');
const Profiler = require('../core/GraphQLCompilerProfiler');

const crypto = require('crypto');
const dedupeJSONStringify = require('../util/dedupeJSONStringify');
const deepMergeAssignments = require('./deepMergeAssignments');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {RelayConcreteNode} = require('relay-runtime');

import type {FormatModule} from '../language/RelayLanguagePluginInterface';
import type CodegenDirectory from './CodegenDirectory';
import type {GeneratedNode} from 'relay-runtime';

function printRequireModuleDependency(moduleName: string): string {
  return `require('${moduleName}')`;
}

function getConcreteType(node: GeneratedNode): string {
  switch (node.kind) {
    case RelayConcreteNode.FRAGMENT:
      return 'ReaderFragment';
    case RelayConcreteNode.REQUEST:
      return 'ConcreteRequest';
    case RelayConcreteNode.SPLIT_OPERATION:
      return 'NormalizationSplitOperation';
    default:
      (node: empty);
      invariant(false, 'Unexpected GeneratedNode kind: `%s`.', node.kind);
  }
}

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  _generatedNode: GeneratedNode,
  formatModule: FormatModule,
  typeText: string,
  _persistQuery: ?(text: string, id: string) => Promise<string>,
  platform: ?string,
  sourceHash: string,
  extension: string,
  printModuleDependency: (
    moduleName: string,
  ) => string = printRequireModuleDependency,
): Promise<?GeneratedNode> {
  let generatedNode = _generatedNode;
  // Copy to const so Flow can refine.
  const persistQuery = _persistQuery;
  const moduleName =
    (generatedNode.kind === 'Request'
      ? generatedNode.params.name
      : generatedNode.name) + '.graphql';
  const platformName =
    platform != null && platform.length > 0
      ? moduleName + '.' + platform
      : moduleName;
  const filename = platformName + '.' + extension;
  const typeName = getConcreteType(generatedNode);

  const devOnlyProperties = {};

  let docText;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    docText = generatedNode.params.text;
  }

  let hash = null;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    const oldHash = Profiler.run('RelayFileWriter:compareHash', () => {
      const oldContent = codegenDir.read(filename);
      // Hash the concrete node including the query text.
      const hasher = crypto.createHash('md5');
      hasher.update('cache-breaker-9');
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
          const text = nullthrows(generatedNode.params.text);
          devOnlyProperties.params = {text};
          generatedNode = {
            ...generatedNode,
            params: {
              ...generatedNode.params,
              text: null,
              id: await persistQuery(text, sourceHash),
            },
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

  const devOnlyAssignments = deepMergeAssignments(
    '(node/*: any*/)',
    devOnlyProperties,
  );

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
  if (text == null || text.length === 0) {
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

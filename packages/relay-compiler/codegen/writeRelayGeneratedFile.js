/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule writeRelayGeneratedFile
 * @flow
 * @format
 */

'use strict';

// TODO T21875029 ../../relay-runtime/util/RelayConcreteNode
const RelayConcreteNode = require('RelayConcreteNode');

const crypto = require('crypto');
const dedupeJSONStringify = require('dedupeJSONStringify');
const invariant = require('invariant');

const {Profiler} = require('graphql-compiler');

// TODO T21875029 ../../relay-runtime/util/RelayConcreteNode
import type {GeneratedNode} from 'RelayConcreteNode';
import type {CodegenDirectory} from 'graphql-compiler';

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
  devOnlyQueryText: ?string,
  relayRuntimeModule: string,
  sourceHash: string,
|}) => string;

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  generatedNode: GeneratedNode,
  formatModule: FormatModule,
  flowText: string,
  persistQuery: ?(text: string) => Promise<string>,
  platform: ?string,
  relayRuntimeModule: string,
  sourceHash: string,
): Promise<?GeneratedNode> {
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
  let devOnlyQueryText = null;

  let text = null;
  let hash = null;
  if (generatedNode.kind === RelayConcreteNode.BATCH_REQUEST) {
    throw new Error(
      'writeRelayGeneratedFile: Batch request not yet implemented (T22987143)',
    );
  }
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    text = generatedNode.text;
    invariant(
      text,
      'codegen-runner: Expected query to have text before persisting.',
    );
    const oldHash = Profiler.run('RelayFileWriter:compareHash', () => {
      const oldContent = codegenDir.read(filename);
      // Hash the concrete node including the query text.
      const hasher = crypto.createHash('md5');
      hasher.update('cache-breaker-6');
      hasher.update(JSON.stringify(generatedNode));
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
      generatedNode = {
        ...generatedNode,
        text: null,
        id: await persistQuery(text),
      };

      devOnlyQueryText = text;
    }
  }

  const moduleText = formatModule({
    moduleName,
    documentType: flowTypeName,
    docText: text,
    flowText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: dedupeJSONStringify(generatedNode),
    devOnlyQueryText,
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

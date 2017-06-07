/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayGeneratedFile
 * @flow
 * @format
 */

'use strict';

const crypto = require('crypto');
const invariant = require('invariant');
const prettyStringify = require('prettyStringify');

import type CodegenDirectory from 'CodegenDirectory';
import type {GeneratedNode} from 'RelayConcreteNode';

/**
 * Generate a module for the given document name/text.
 */
export type FormatModule = ({|
  moduleName: string,
  documentType: 'ConcreteBatch' | 'ConcreteFragment',
  docText: ?string,
  concreteText: string,
  flowText: ?string,
  hash: ?string,
  relayRuntimeModule: string,
|}) => string;

async function writeRelayGeneratedFile(
  codegenDir: CodegenDirectory,
  generatedNode: GeneratedNode,
  formatModule: FormatModule,
  flowText: ?string,
  persistQuery: ?(text: string) => Promise<string>,
  platform: ?string,
  relayRuntimeModule: string,
): Promise<?GeneratedNode> {
  const moduleName = generatedNode.name + '.graphql';
  const platformName = platform ? moduleName + '.' + platform : moduleName;
  const filename = platformName + '.js';
  const flowTypeName = generatedNode.kind === 'Batch'
    ? 'ConcreteBatch'
    : 'ConcreteFragment';

  let text = null;
  let hash = null;
  if (generatedNode.kind === 'Batch') {
    text = generatedNode.text;
    invariant(
      text,
      'codegen-runner: Expected query to have text before persisting.',
    );
    const oldContent = codegenDir.read(filename);
    // Hash the concrete node including the query text.
    hash = md5(
      JSON.stringify(generatedNode) +
        (persistQuery ? 'persisted' : '') +
        'cache-breaker-5',
    );
    if (hash === extractHash(oldContent)) {
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
    }
  }

  const moduleText = formatModule({
    moduleName,
    documentType: flowTypeName,
    docText: text,
    flowText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: prettyStringify(generatedNode),
    relayRuntimeModule,
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

function md5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = writeRelayGeneratedFile;

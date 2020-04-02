/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const CodeMarker = require('../util/CodeMarker');
const Profiler = require('../core/GraphQLCompilerProfiler');
const Rollout = require('../util/Rollout');

const createPrintRequireModuleDependency = require('./createPrintRequireModuleDependency');
const crypto = require('crypto');
const dedupeJSONStringify = require('../util/dedupeJSONStringify');
const invariant = require('invariant');

const {RelayConcreteNode} = require('relay-runtime');

import type {GeneratedDefinition} from '../core/IR';
import type {Schema} from '../core/Schema';
import type {
  FormatModule,
  PluginInterface,
} from '../language/RelayLanguagePluginInterface';
import type CodegenDirectory from './CodegenDirectory';
import type {GeneratedNode, RequestParameters} from 'relay-runtime';

function getConcreteType(node: GeneratedNode): string {
  switch (node.kind) {
    case RelayConcreteNode.FRAGMENT:
      return 'ReaderFragment';
    case RelayConcreteNode.REQUEST:
      return 'ConcreteRequest';
    case RelayConcreteNode.SPLIT_OPERATION:
      return 'NormalizationSplitOperation';
    case RelayConcreteNode.INLINE_DATA_FRAGMENT:
      return 'ReaderInlineDataFragment';
    default:
      (node: empty);
      invariant(false, 'Unexpected GeneratedNode kind: `%s`.', node.kind);
  }
}

async function writeRelayGeneratedFile(
  schema: Schema,
  codegenDir: CodegenDirectory,
  definition: GeneratedDefinition,
  _generatedNode: GeneratedNode,
  formatModule: FormatModule,
  typeText: string,
  _persistQuery: ?(text: string) => Promise<string>,
  sourceHash: string,
  extension: string,
  printModuleDependency: (
    moduleName: string,
  ) => string = createPrintRequireModuleDependency(extension),
  shouldRepersist: boolean,
  writeQueryParameters: (
    dir: CodegenDirectory,
    filename: string,
    moduleName: string,
    params: RequestParameters,
  ) => void,
  languagePlugin: ?PluginInterface,
): Promise<?GeneratedNode> {
  let generatedNode = _generatedNode;
  // Copy to const so Flow can refine.
  const persistQuery = _persistQuery;
  const operationName =
    generatedNode.kind === 'Request'
      ? generatedNode.params.name
      : generatedNode.name;
  const moduleName = languagePlugin?.getModuleName
    ? languagePlugin.getModuleName(operationName)
    : operationName + '.graphql';

  const filename = moduleName + '.' + extension;
  const queryParametersFilename =
    generatedNode.kind === 'Request'
      ? `${generatedNode.params.name}$Parameters.${extension}`
      : null;

  const typeName = getConcreteType(generatedNode);

  let docText;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    docText = generatedNode.params.text;
  }

  let hash = null;
  if (generatedNode.kind === RelayConcreteNode.REQUEST) {
    let oldContent;
    const oldHash = Profiler.run('RelayFileWriter:compareHash', () => {
      oldContent = codegenDir.read(filename);
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
    const oldRequestParameters = extractRelayRequestParams(oldContent);

    if (!shouldRepersist && hash === oldHash) {
      codegenDir.markUnchanged(filename);
      if (
        writeQueryParameters &&
        oldRequestParameters &&
        queryParametersFilename != null &&
        generatedNode.kind === RelayConcreteNode.REQUEST &&
        generatedNode.params.operationKind === 'query'
      ) {
        writeQueryParameters(
          codegenDir,
          queryParametersFilename,
          moduleName,
          oldRequestParameters,
        );
      }
      return oldRequestParameters
        ? {
            ...generatedNode,
            params: oldRequestParameters,
          }
        : null;
    }
    if (codegenDir.onlyValidate) {
      codegenDir.markUpdated(filename);
      return null;
    }
    if (persistQuery) {
      switch (generatedNode.kind) {
        case RelayConcreteNode.REQUEST:
          const {text} = generatedNode.params;
          invariant(
            text != null,
            'writeRelayGeneratedFile: Expected `text` in order to persist query',
          );
          generatedNode = {
            ...generatedNode,
            params: {
              id: await persistQuery(text),
              metadata: generatedNode.params.metadata,
              name: generatedNode.params.name,
              operationKind: generatedNode.params.operationKind,
              text: null,
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

  const moduleText = formatModule({
    moduleName,
    documentType: typeName,
    definition,
    kind: generatedNode.kind,
    docText,
    typeText,
    hash: hash ? `@relayHash ${hash}` : null,
    concreteText: CodeMarker.postProcess(
      dedupeJSONStringify(generatedNode),
      printModuleDependency,
    ),
    sourceHash,
    node: generatedNode,
    schema,
  });
  codegenDir.writeFile(filename, moduleText, shouldRepersist);
  if (
    writeQueryParameters &&
    queryParametersFilename != null &&
    generatedNode.kind === RelayConcreteNode.REQUEST &&
    generatedNode.params.operationKind === 'query'
  ) {
    writeQueryParameters(
      codegenDir,
      queryParametersFilename,
      moduleName,
      generatedNode.params,
    );
  }
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

function extractRelayRequestParams(text: ?string): ?RequestParameters {
  if (text == null || text.length === 0) {
    return null;
  }
  if (/<<<<<|>>>>>/.test(text)) {
    // looks like a merge conflict
    return null;
  }
  const match = text.match(/@relayRequestParams (.+)/);
  let requestParams;
  try {
    requestParams = JSON.parse(match?.[1] ?? '');
  } catch {}
  return requestParams;
}

module.exports = writeRelayGeneratedFile;

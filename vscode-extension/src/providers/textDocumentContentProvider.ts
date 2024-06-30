/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TextDocumentContentProvider, Event, Uri, ProviderResult} from 'vscode';
import {execSync} from 'child_process';
import * as path from 'path';
import {RelayExtensionContext} from '../context';

const RELAY_CONFIG_SCHEMA_PATH = 'relay-config-schema';
const PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH =
  'package-json-relay-config-schema';

export class RelayTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  constructor(private context: RelayExtensionContext) {}

  static readonly scheme: string = 'relay';

  cachedJsonSchema: string | undefined;

  onDidChange?: Event<Uri> | undefined;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    if (uri.authority === PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH) {
      return `{"properties": { "relay": { "$ref": "${RelayTextDocumentContentProvider.scheme}://${RELAY_CONFIG_SCHEMA_PATH}", "description": "Relay.js configuration" }}}`;
    }

    if (uri.authority === RELAY_CONFIG_SCHEMA_PATH) {
      this.cachedJsonSchema ||= this.loadConfigJsonSchema();

      return this.cachedJsonSchema;
    }

    return undefined;
  }

  loadConfigJsonSchema(): string | undefined {
    const relayCompilerBinPath = path.resolve(
      this.context.relayBinaryExecutionOptions.rootPath,
      this.context.relayBinaryExecutionOptions.binaryPath,
    );

    try {
      return execSync(`${relayCompilerBinPath} config-json-schema`, {
        cwd: this.context.relayBinaryExecutionOptions.rootPath,
        encoding: 'utf-8',
      });
    } catch {
      return undefined;
    }
  }
}

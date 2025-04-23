/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TextDocumentContentProvider, Event, Uri, ProviderResult} from 'vscode';
import {execSync} from 'child_process';
import * as path from 'path';
import * as semver from 'semver';
import {RelayExtensionContext} from '../context';

const RELAY_CONFIG_SCHEMA_PATH = 'relay-config-schema';
const PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH =
  'package-json-relay-config-schema';

export class RelayTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  private isConfigJsonSchemaCompilerCommandAvailable: boolean = true;

  constructor(private context: RelayExtensionContext) {
    const {binaryVersion} = this.context.relayBinaryExecutionOptions;

    if (binaryVersion) {
      this.isConfigJsonSchemaCompilerCommandAvailable =
        semver.satisfies(binaryVersion, '>17.0') ||
        semver.prerelease(binaryVersion) != null;
    }
  }

  static readonly scheme: string = 'relay';

  cachedJsonSchema: string | undefined;

  onDidChange?: Event<Uri> | undefined;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    if (uri.authority === PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH) {
      return `{"properties": { "relay": { "$ref": "${RelayTextDocumentContentProvider.scheme}://${RELAY_CONFIG_SCHEMA_PATH}", "description": "Relay.js configuration" }}}`;
    }

    if (uri.authority === RELAY_CONFIG_SCHEMA_PATH) {
      this.cachedJsonSchema ||= this.loadConfigJsonSchema();

      if (!this.cachedJsonSchema) {
        // We return an empty JSON schema instead of undefined to prevent
        // a warning being shown in the user's IDE.
        return '{}';
      }

      return this.cachedJsonSchema;
    }

    return undefined;
  }

  loadConfigJsonSchema(): string | undefined {
    if (!this.isConfigJsonSchemaCompilerCommandAvailable) {
      return undefined;
    }

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

export class NoopTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    if (
      uri.authority === PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH ||
      uri.authority === RELAY_CONFIG_SCHEMA_PATH
    ) {
      // We return an empty JSON schema instead of undefined to prevent
      // a warning being shown in the user's IDE.
      return '{}';
    }
    return undefined;
  }
}

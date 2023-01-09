/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as fs from 'fs';
import {TextDocumentContentProvider, Event, Uri, ProviderResult} from 'vscode';

const EMPTY_JSON_SCHEMA = '{}';
const RELAY_CONFIG_SCHEMA_PATH = 'relay-config-schema';
const PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH =
  'package-json-relay-config-schema';

export class RelayTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  constructor(private readonly configJsonSchemaPath: string) {}

  static readonly scheme: string = 'relay';

  onDidChange?: Event<Uri> | undefined;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    if (uri.authority === PACKAGE_JSON_RELAY_CONFIG_SCHEMA_PATH) {
      return `{"properties": { "relay": { "$ref": "${RelayTextDocumentContentProvider.scheme}://${RELAY_CONFIG_SCHEMA_PATH}", "description": "Relay.js configuration" }}}`;
    }

    if (uri.authority === RELAY_CONFIG_SCHEMA_PATH) {
      try {
        return fs.readFileSync(this.configJsonSchemaPath, {encoding: 'utf-8'});
      } catch {
        return EMPTY_JSON_SCHEMA;
      }
    }

    return EMPTY_JSON_SCHEMA;
  }
}

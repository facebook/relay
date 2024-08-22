/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as semver from 'semver';
import {window, env} from 'vscode';
import {RequestType, TextDocumentPositionParams} from 'vscode-languageclient';
import {RelayExtensionContext} from '../context';

export function handleCopyOperation(context: RelayExtensionContext): void {
  const {binaryVersion} = context.relayBinaryExecutionOptions;

  if (binaryVersion) {
    const isSupportedCompilerVersion =
      semver.satisfies(binaryVersion, '>17.0') ||
      semver.prerelease(binaryVersion) != null;

    if (!isSupportedCompilerVersion) {
      return;
    }
  }

  if (!context.client || !context.client.isRunning()) {
    return;
  }

  const activeEditor = window.activeTextEditor;

  if (!activeEditor) {
    return;
  }

  const request = new RequestType<
    TextDocumentPositionParams,
    PrintOperationResponse,
    void
  >('relay/printOperation');

  const params: TextDocumentPositionParams = {
    textDocument: {uri: activeEditor.document.uri.toString()},
    position: activeEditor.selection.active,
  };

  context.client.sendRequest(request, params).then(response => {
    env.clipboard.writeText(response.operationText).then(() => {
      const message = response.operationName
        ? `Copied operation "${response.operationName}" to clipboard`
        : 'Copied operation to clipboard';

      window.showInformationMessage(message);
    });
  });
}

type PrintOperationResponse = {
  operationName: string;
  operationText: string;
};

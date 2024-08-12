/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {workspace} from 'vscode';
import {RelayExtensionContext} from '../context';
import {RelayTextDocumentContentProvider} from './textDocumentContentProvider';

export function registerProviders(context: RelayExtensionContext) {
  context.extensionContext.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      RelayTextDocumentContentProvider.scheme,
      new RelayTextDocumentContentProvider(context),
    ),
  );
}

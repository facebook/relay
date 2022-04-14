/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {StatusBarAlignment, StatusBarItem, window} from 'vscode';

import {RelayExtensionContext} from './context';

export function createStatusBar(): StatusBarItem {
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBar.command = 'relay.showOutput';

  return statusBar;
}

export function intializeStatusBar(context: RelayExtensionContext) {
  context.statusBar.text = '$(info) Starting...';
}

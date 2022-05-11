/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

import { RelayExtensionContext } from './context';

const SHOW_OUTPUT_COMMAND = 'relay.showOutput';

export function createStatusBarItem(): StatusBarItem {
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBar.command = SHOW_OUTPUT_COMMAND;

  return statusBar;
}

export function intializeStatusBarItem(context: RelayExtensionContext) {
  context.statusBar.text = '$(info) Starting...';
}

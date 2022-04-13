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

export function updateStatusBar(context: RelayExtensionContext) {
  context.statusBar.text = '';
}

export function initializeStatusBar(context: RelayExtensionContext) {
  updateStatusBar(context);
}

// the following type definitions are one to one mappings of the types defined
// by the lsp_types package in this rust crate.
// https://github.com/gluon-lang/lsp-types/blob/master/src/window.rs#L15
enum ShowStatusMessageType {
  /// An error message.
  Error = 1,
  /// A warning message.
  Warning = 2,
  /// An information message.
  Info = 3,
  /// A log message.
  Log = 4,
}

type ShowStatusProgress = {
  numerator: number;
  denominator?: number;
};

type ShowStatusMessageActionItem = {
  title: string;
  properties: Record<
    string,
    string | boolean | number | Record<string, unknown>
  >;
};

export type ShowStatusParams = {
  type: ShowStatusMessageType;
  progress?: ShowStatusProgress;
  uri?: string;
  message?: string;
  shortMessage?: string;
  actions?: ShowStatusMessageActionItem[];
};

function getStatusBarText(params: ShowStatusParams): string | undefined {
  if (params.shortMessage) {
    return params.shortMessage;
  }

  if (params.message) {
    if (params.message.length > 16) {
      return `${params.message.slice(0, 15)}...`;
    }
    return params.message;
  }

  return undefined;
}

function getStatusBarTooltip(params: ShowStatusParams): string | undefined {
  return params.message;
}

// All possible icons can be found here https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
function getStatusBarIcon(params: ShowStatusParams): string {
  if (params.type === ShowStatusMessageType.Log) {
    return 'info';
  }

  if (params.type === ShowStatusMessageType.Info) {
    return 'run';
  }

  if (params.type === ShowStatusMessageType.Error) {
    return 'error';
  }

  if (params.type === ShowStatusMessageType.Warning) {
    return 'warning';
  }

  return 'extensions-info-message';
}

// A lot of the data from the window/showStatus command is ignored.
// On the LSP Server, we only make use of the following properties
//
// - type
// - message
// - shortMessage
//
// The source of truth is currently marked here
// https://github.com/facebook/relay/blob/main/compiler/crates/relay-lsp/src/status_updater.rs#L82
export function handleShowStatusMethod(
  context: RelayExtensionContext,
  params: ShowStatusParams,
): void {
  const icon = getStatusBarIcon(params);
  const text = getStatusBarText(params);
  const tooltipText = getStatusBarTooltip(params);

  if (text) {
    const textWithIcon = `$(${icon}) ${text}`;

    context.statusBar.text = textWithIcon;
    context.statusBar.tooltip = tooltipText;

    context.statusBar.show();
  }
}

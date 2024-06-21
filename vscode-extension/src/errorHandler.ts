/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {window} from 'vscode';
import {CloseAction, ErrorAction, ErrorHandler} from 'vscode-languageclient';
import {RelayExtensionContext} from './context';

export function createErrorHandler(
  context: RelayExtensionContext,
): ErrorHandler {
  return {
    // This happens when the LSP server stops running.
    // e.g. Could not find relay config.
    // e.g. watchman was not installed.
    //
    // TODO: Figure out the best way to handle this `closed` event
    //
    // Some of these messages are worth surfacing and others are not
    // e.g. "Watchman is not installed" is important to surface to the user
    // but "No relay config found" is not relevant since the user is likely
    // just in a workspace where they don't have a relay config.
    //
    // We already bail early if there is no relay binary found.
    // So maybe we should just show all of these messages since it would
    // be weird if you had a relay binary in your node modules but no relay
    // config could be found. 🤷 for now.
    closed() {
      window
        .showWarningMessage(
          'Relay LSP client connection got closed unexpectedly.',
          'Go to output',
          'Ignore',
        )
        .then(selected => {
          if (selected === 'Go to output') {
            context.primaryOutputChannel.show();
          }
        });

      return {
        action: CloseAction.DoNotRestart,
      };
    },
    // This `error` callback should probably never happen. 🙏
    error() {
      window
        .showWarningMessage(
          'An error occurred while writing/reading to/from the relay lsp connection',
          'Go to output',
          'Ignore',
        )
        .then(selected => {
          if (selected === 'Go to output') {
            context.primaryOutputChannel.show();
          }
        });

      return {
        action: ErrorAction.Continue,
      };
    },
  };
}

import {OutputChannel} from 'vscode';
import {LanguageClient} from 'vscode-languageclient/node';

// Mutable object to pass around to command handlers so they
// can reference the current state of the extension
//
// Things like configuration should not be stored in this context
// as they should be resolved contextually (workspace, file, etc).
// This state is global to the entire extension.
// At some point, we'll most likely have a map of Workspace => LSP Client
// for downstream callers to use.
//
// We're not using the VSCode's API for this since that state must be serializable
// as it's persisted to disk.
// https://code.visualstudio.com/api/extension-capabilities/common-capabilities#data-storage
export type RelayExtensionContext = {
  client: LanguageClient | null;
  outputChannel: OutputChannel;
};

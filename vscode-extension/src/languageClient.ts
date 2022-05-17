/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { window, workspace } from 'vscode';
import path = require('path');
import {
  LanguageClientOptions,
  RevealOutputChannelOn,
} from 'vscode-languageclient';
import { ServerOptions, LanguageClient } from 'vscode-languageclient/node';
import { spawn } from 'child_process';
import { RelayExtensionContext } from './context';
import { createErrorHandler } from './errorHandler';
import { LSPStatusBarFeature } from './lspStatusBarFeature';
import { findRelayCompilerBinary } from './utils';
import { getConfig } from './config';

export async function createAndStartClient(context: RelayExtensionContext) {
  const config = getConfig();

  context.primaryOutputChannel.appendLine(
    'Starting the Relay GraphQL extension...',
  );

  let rootPath = workspace.rootPath || process.cwd();
  if (config.rootDirectory) {
    rootPath = path.join(rootPath, config.rootDirectory);
  }

  context.primaryOutputChannel.appendLine(
    `Searching for the relay-compiler starting at: ${rootPath}`,
  );
  const relayBinaryResult = await findRelayCompilerBinary(rootPath);

  let relayBinary: string | undefined;
  if (config.pathToRelay) {
    context.primaryOutputChannel.appendLine(
      "You've manually specified 'relay.pathToBinary'. We cannot confirm this version of the Relay Compiler is supported by this version of the extension. I hope you know what you're doing.",
    );

    relayBinary = config.pathToRelay;
  } else if (relayBinaryResult.kind === 'versionDidNotMatch') {
    window.showErrorMessage(
      // Array syntax so it's easier to read this message in the source code.
      [
        `The installed version of the Relay Compiler is version: '${relayBinaryResult.version}'.`,
        `We found this version in the package.json at the following path: ${relayBinaryResult.path}`,
        `This version of the extension supports the following semver range: '${relayBinaryResult.expectedRange}'.`,
        'Please update your extension / relay-compiler to accommodate the version requirements.',
      ].join(' '),
      'Okay',
    );

    return;
  } else if (relayBinaryResult.kind === 'packageNotFound') {
    context.primaryOutputChannel.appendLine(
      "Could not find the 'relay-compiler' package in your node_modules. Maybe you're not inside of a project with relay installed.",
    );

    return;
  } else if (relayBinaryResult.kind === 'architectureNotSupported') {
    context.primaryOutputChannel.appendLine(
      `The 'relay-compiler' does not ship a binary for the architecture: ${process.arch}`,
    );

    return;
  } else if (relayBinaryResult.kind === 'prereleaseCompilerFound') {
    context.primaryOutputChannel.appendLine(
      [
        'You have a pre-release version of the relay-compiler package installed.',
        'We are unable to confirm if this version is compatible with the Relay',
        'VSCode Extension. Proceeding on the assumption that you know what you are',
        'doing.',
      ].join(' '),
    );

    relayBinary = relayBinaryResult.path;
  } else if (relayBinaryResult.kind === 'compilerFound') {
    relayBinary = relayBinaryResult.path;
  }

  if (!relayBinary) {
    context.primaryOutputChannel.appendLine(
      'Stopping execution of the Relay VSCode extension since we could not find a valid compiler binary.',
    );

    return;
  }

  context.primaryOutputChannel.appendLine(`Using relay binary: ${relayBinary}`);

  startLspClient({ rootPath, relayBinary, context });

  if (config.startCompiler) {
    startCompiler({ rootPath, relayBinary, context });
  } else {
    context.primaryOutputChannel.appendLine(
      [
        'Not starting the Relay Compiler.',
        'Please enable relay.startCompiler in your settings if you want the compiler to start when you open your project.',
      ].join(' '),
    );
  }
}

type StartCompilerArgs = {
  rootPath: string;
  relayBinary: string;
  context: RelayExtensionContext;
};

function startCompiler({ rootPath, relayBinary, context }: StartCompilerArgs) {
  const config = getConfig();

  const args: string[] = ['--watch', `--output=${config.compilerOutpuLevel}`];

  if (config.pathToConfig) {
    args.push(config.pathToConfig);
  }

  context.primaryOutputChannel.appendLine(
    [
      'Starting the Relay Compiler with the following command:',
      `${relayBinary} ${args.join(' ')}`,
    ].join(' '),
  );

  const process = spawn(relayBinary, args, { cwd: rootPath });

  process.stdout.on('data', (data) => {
    context.primaryOutputChannel.append(`${data}`);
  });

  process.stderr.on('data', (data) => {
    context.primaryOutputChannel.append(`${data}`);
  });

  context.compilerProcess = process;
}

type StartLspClientArgs = {
  rootPath: string;
  relayBinary: string;
  context: RelayExtensionContext;
};

function startLspClient({
  rootPath,
  relayBinary,
  context,
}: StartLspClientArgs) {
  const config = getConfig();

  const args = ['lsp', `--output=${config.lspOutputLevel}`];

  if (config.pathToConfig) {
    args.push(config.pathToConfig);
  }

  const serverOptions: ServerOptions = {
    options: {
      cwd: rootPath,
    },
    command: relayBinary,
    args,
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    markdown: {
      isTrusted: true,
    },
    documentSelector: [
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascriptreact' },
    ],

    outputChannel: context.lspOutputChannel,

    // Since we use stderr for debug logs, the "Something went wrong" popup
    // in VSCode shows up a lot. This tells vscode not to show it in any case.
    revealOutputChannelOn: RevealOutputChannelOn.Never,

    initializationFailedHandler: (error) => {
      context?.primaryOutputChannel.appendLine(
        `initializationFailedHandler ${error}`,
      );

      return true;
    },

    errorHandler: createErrorHandler(context),
  };

  // Create the language client and start the client.
  const client = new LanguageClient(
    'RelayLanguageClient',
    'Relay Language Client',
    serverOptions,
    clientOptions,
  );

  client.registerFeature(new LSPStatusBarFeature(context));

  context.primaryOutputChannel.appendLine(
    `Starting the Relay Langauge Server with these options: ${JSON.stringify(
      serverOptions,
    )}`,
  );
  // Start the client. This will also launch the server
  client.start();
  context.client = client;
}

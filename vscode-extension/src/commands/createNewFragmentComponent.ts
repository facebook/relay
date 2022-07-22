/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as vscode from 'vscode';
import {basename} from 'path';
import {RelayExtensionContext} from '../context';

export async function createNewFragmentComponent(
  _: RelayExtensionContext,
  fsLocationClicked?: vscode.Uri,
) {
  //    context.primaryOutputChannel.show();
  let target = fsLocationClicked;
  if (!target) {
    const files = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      canSelectFiles: false,
      title: 'Select a folder for your new fragment component',
    });

    target = files && files[0];
  }

  if (!target) {
    vscode.window.showErrorMessage(
      'No folder selected for creating a new fragment component',
    );
    return;
  }

  const wsedit = new vscode.WorkspaceEdit();
  const newFileName = await vscode.window.showInputBox({
    title: '',
    prompt: 'Name of your fragment component',
    value: 'SomethingView',
    valueSelection: [0, 9],
    ignoreFocusOut: true,
  });

  // NOOP (you may have left the input box empty)
  if (!newFileName) {
    return;
  }

  const isFolder = target.path.endsWith('/');

  // TODO: Ideally we have an extension wide way to know if we should be writing a flow
  // or TypeScript component. A cheap check right now is that if there is a .js file inside
  // the folder we assume it is a flow component.

  let isJS = target.path.endsWith('.js');
  if (isFolder) {
    const files = await vscode.workspace.fs.readDirectory(target);
    isJS = files.some(f => f[0].endsWith('.js'));
  }

  const fileType = isJS ? 'js' : 'tsx';

  const newPathString = isFolder
    ? `${basename(target.fsPath)}/${newFileName}.${fileType}`
    : `${target.fsPath}/${newFileName}.${fileType}`;

  const newFilePath = vscode.Uri.file(newPathString);

  const content = `import React from 'react';
import { graphql } from 'react-relay';

const GameFrag = graphql\`
  fragment ${newFileName}Fragment on [Fill] {
    
  }
\`

type Props = { 
    [fill]: ${newFileName}$key
}

export const ${newFileName} = () => {
    return <></>
}
`;

  wsedit.createFile(newFilePath);
  wsedit.set(newFilePath, [
    vscode.TextEdit.insert(new vscode.Position(0, 0), content),
  ]);

  vscode.workspace.applyEdit(wsedit);

  vscode.commands.executeCommand('vscode.open', newFilePath);
  vscode.window.showInformationMessage(
    `Created new fragment component: ${basename(newFilePath.fsPath)}`,
  );
}

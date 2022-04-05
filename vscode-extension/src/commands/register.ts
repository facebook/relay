import {commands} from 'vscode';
import {RelayExtensionContext} from '../context';
import {handleRestartLanguageServerCommand} from './restartLanguageServer';

export function registerCommands(context: RelayExtensionContext) {
  context.extensionContext.subscriptions.push(
    commands.registerCommand(
      'relay.restartLanguageServer',
      handleRestartLanguageServerCommand.bind(null, context),
    ),
  );
}

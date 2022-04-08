import {RelayExtensionContext} from '../context';

export function handleShowOutputCommand(context: RelayExtensionContext): void {
  context.outputChannel.show();
}

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

function getStatusBarIcon(params: ShowStatusParams): string {
  if (params.type === ShowStatusMessageType.Log) {
    return 'info';
  }

  if (params.type === ShowStatusMessageType.Info) {
    return 'info';
  }

  if (params.type === ShowStatusMessageType.Error) {
    return 'error';
  }

  if (params.type === ShowStatusMessageType.Warning) {
    return 'warning';
  }

  return 'extensions-info-message';
}

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

export abstract class TaskBase {
  abstract message: string;

  abstract isEnabled(): boolean;

  abstract run(): Promise<void>;

  updateMessage(message: string) {
    if (this.onUpdateMessage) {
      this.onUpdateMessage(message);
    }
  }

  skip(reason?: string): void {
    throw new TaskSkippedError(reason);
  }

  onUpdateMessage?(message: string): void;
}

export class TaskSkippedError extends Error {
  constructor(reason?: string) {
    super("Task skipped: " + (reason ?? "Reason not specified"));

    this.reason = reason;
  }

  reason?: string;
}

import { EOL } from "os";
import { ProjectContext } from "../misc/ProjectContext.js";
import { bold } from "../utils/cli.js";
import { TaskBase } from "./TaskBase.js";

export class ConfigureEolOfArtifactsTask extends TaskBase {
  message: string = "Configure Relay artifact EOL";

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return true;
  }

  async run(): Promise<void> {
    const gitAttributesPath = this.context.gitAttributesFile;

    this.updateMessage(this.message + " in " + bold(gitAttributesPath.rel));

    const gitAttributesExpression = `*${this.context.artifactExtension} auto eol=lf`;

    if (!this.context.fs.exists(gitAttributesPath.abs)) {
      // .gitattributes does not exist - we create it.

      this.context.fs.writeToFile(gitAttributesPath.abs, gitAttributesExpression + EOL);
    } else {
      // .gitattributes exist - we check if our expression exists.
      const gitAttributesContent = await this.context.fs.readFromFile(gitAttributesPath.abs);

      if (gitAttributesContent.includes(gitAttributesExpression)) {
        this.skip("Already configured");
        return;
      }

      // The expression is not part of the file - we add it.

      await this.context.fs.appendToFile(gitAttributesPath.abs, EOL + gitAttributesExpression + EOL);
    }
  }
}

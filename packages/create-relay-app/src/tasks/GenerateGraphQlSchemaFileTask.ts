import { TaskBase } from "./TaskBase.js";
import { bold } from "../utils/index.js";
import { ProjectContext } from "../misc/ProjectContext.js";

const schemaGraphQLContent = `# Replace this with your own GraphQL schema file!
type Query {
  field: String
}`;

export class GenerateGraphQlSchemaFileTask extends TaskBase {
  message: string = "Generate GraphQL schema file";

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return true;
  }

  async run(): Promise<void> {
    this.updateMessage(this.message + " " + bold(this.context.schemaPath.rel));

    if (this.context.fs.exists(this.context.schemaPath.abs)) {
      this.skip("File exists");
      return;
    }

    await this.context.fs.createDirectory(this.context.schemaPath.parentDirectory);

    await this.context.fs.writeToFile(this.context.schemaPath.abs, schemaGraphQLContent);
  }
}

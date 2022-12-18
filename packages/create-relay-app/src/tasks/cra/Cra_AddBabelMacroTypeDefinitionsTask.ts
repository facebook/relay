import { TaskBase } from "../TaskBase.js";
import { bold } from "../../utils/index.js";
import { EOL } from "os";
import { BABEL_RELAY_MACRO } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import path from "path";

const babelMacroTypeDef = `${EOL}
declare module "babel-plugin-relay/macro" {
  export { graphql as default } from "react-relay";
}`;

export class Cra_AddBabelMacroTypeDefinitionsTask extends TaskBase {
  message: string = `Add ${bold(BABEL_RELAY_MACRO)} type definitions`;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("cra") && this.context.args.typescript;
  }

  async run(): Promise<void> {
    const reactTypeDefFilepath = this.context.env.rel(path.join("src", "react-app-env.d.ts"));

    this.updateMessage(this.message + " to " + bold(reactTypeDefFilepath.rel));

    if (!this.context.fs.exists(reactTypeDefFilepath.abs)) {
      throw new Error(`Could not find ${bold(reactTypeDefFilepath.rel)}`);
    }

    const typeDefContent = await this.context.fs.readFromFile(reactTypeDefFilepath.abs);

    if (typeDefContent.includes('declare module "babel-plugin-relay/macro"')) {
      this.skip("Already exists");
      return;
    }

    try {
      await this.context.fs.appendToFile(reactTypeDefFilepath.abs, babelMacroTypeDef);
    } catch (error) {
      throw new Error(`Could not append ${BABEL_RELAY_MACRO} to ${bold(reactTypeDefFilepath.rel)}`, {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}

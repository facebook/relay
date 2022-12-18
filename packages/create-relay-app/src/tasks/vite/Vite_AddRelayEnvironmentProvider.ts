import path from "path";
import { RELAY_ENV_PROVIDER } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { parseAst, printAst } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase } from "../TaskBase.js";
import { configureRelayProviderInReactDomRender } from "../cra/Cra_AddRelayEnvironmentProvider.js";

export class Vite_AddRelayEnvironmentProvider extends TaskBase {
  message: string = "Add " + RELAY_ENV_PROVIDER;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("vite");
  }

  async run(): Promise<void> {
    const mainFilename = "main" + (this.context.args.typescript ? ".tsx" : ".jsx");

    const mainFile = this.context.env.rel(path.join("src", mainFilename));

    this.updateMessage(this.message + " in " + bold(mainFile.rel));

    const code = await this.context.fs.readFromFile(mainFile.abs);

    const ast = parseAst(code);

    configureRelayProviderInReactDomRender(ast, mainFile, this.context.relayEnvFile);

    const updatedCode = printAst(ast, code);

    await this.context.fs.writeToFile(mainFile.abs, updatedCode);
  }
}

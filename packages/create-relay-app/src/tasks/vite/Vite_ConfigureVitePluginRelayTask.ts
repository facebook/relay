import traverse from "@babel/traverse";
import t from "@babel/types";
import { VITE_RELAY_PACKAGE } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { parseAst, insertDefaultImport, printAst } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase } from "../TaskBase.js";

export class Vite_ConfigureVitePluginRelayTask extends TaskBase {
  message: string = `Configure ${bold(VITE_RELAY_PACKAGE)}`;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("vite");
  }

  async run(): Promise<void> {
    const configFilename = "vite.config" + (this.context.args.typescript ? ".ts" : ".js");

    const configFile = this.context.env.rel(configFilename);

    this.updateMessage(this.message + " in " + bold(configFile.rel));

    const configCode = await this.context.fs.readFromFile(configFile.abs);

    const ast = parseAst(configCode);

    traverse.default(ast, {
      ExportDefaultDeclaration: (path) => {
        const relayImportId = insertDefaultImport(path, "relay", VITE_RELAY_PACKAGE);

        const node = path.node;

        // Find export default defineConfig(???)
        if (
          !t.isCallExpression(node.declaration) ||
          node.declaration.arguments.length < 1 ||
          !t.isIdentifier(node.declaration.callee) ||
          node.declaration.callee.name !== "defineConfig"
        ) {
          throw new Error("Expected `export default defineConfig()`");
        }

        const arg = node.declaration.arguments[0];

        if (!t.isObjectExpression(arg)) {
          throw new Error("Expected first argument of `defineConfig` to be an object");
        }

        // We are creating or getting the 'plugins' property.
        let pluginsProperty = arg.properties.find(
          (p) => t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === "plugins"
        ) as t.ObjectProperty;

        if (!pluginsProperty) {
          pluginsProperty = t.objectProperty(t.identifier("plugins"), t.arrayExpression([]));

          arg.properties.push(pluginsProperty);
        }

        if (!t.isArrayExpression(pluginsProperty.value)) {
          throw new Error("Expected the `plugins` property in the object passed to `defineConfig()` to be an array");
        }

        const vitePlugins = pluginsProperty.value.elements;

        if (vitePlugins.some((p) => t.isIdentifier(p) && p.name === relayImportId.name)) {
          this.skip("Already configured");
          return;
        }

        // Add the "relay" import to the beginning of "plugins".
        vitePlugins.splice(0, 0, relayImportId);
      },
    });

    const updatedConfigCode = printAst(ast, configCode);

    await this.context.fs.writeToFile(configFile.abs, updatedConfigCode);
  }
}

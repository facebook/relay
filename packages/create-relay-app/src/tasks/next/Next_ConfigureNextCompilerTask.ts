import traverse from "@babel/traverse";
import t from "@babel/types";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { parseAst, printAst, mergeProperties } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase } from "../TaskBase.js";

export class Next_ConfigureNextCompilerTask extends TaskBase {
  message: string = `Configure Next.js compiler`;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("next");
  }

  async run(): Promise<void> {
    const configFilename = "next.config.js";

    const configFile = this.context.env.rel(configFilename);

    this.updateMessage(this.message + " in " + bold(configFile.rel));

    const configCode = await this.context.fs.readFromFile(configFile.abs);

    const ast = parseAst(configCode);

    let configured = false;

    traverse.default(ast, {
      AssignmentExpression: (path) => {
        if (configured) {
          return;
        }

        const node = path.node;

        // We are looking for module.exports = ???.
        if (
          node.operator !== "=" ||
          !t.isMemberExpression(node.left) ||
          !t.isIdentifier(node.left.object) ||
          !t.isIdentifier(node.left.property) ||
          node.left.object.name !== "module" ||
          node.left.property.name !== "exports"
        ) {
          return;
        }

        let objExp: t.ObjectExpression;

        // We are looking for the object expression
        // that was assigned to module.exports.
        if (t.isIdentifier(node.right)) {
          // The export is linked to a variable,
          // so we need to resolve the variable declaration.
          const binding = path.scope.getBinding(node.right.name);

          if (!binding || !t.isVariableDeclarator(binding.path.node) || !t.isObjectExpression(binding.path.node.init)) {
            throw new Error("`module.exports` references a variable, but the variable is not an object.");
          }

          objExp = binding.path.node.init;
        } else if (t.isObjectExpression(node.right)) {
          objExp = node.right;
        } else {
          throw new Error("Expected to find an object initializer or variable assigned to `module.exports`.");
        }

        // We are creating or getting the 'compiler' property.
        let compiler_Prop = objExp.properties.find(
          (p) => t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === "compiler"
        ) as t.ObjectProperty;

        if (!compiler_Prop) {
          compiler_Prop = t.objectProperty(t.identifier("compiler"), t.objectExpression([]));

          objExp.properties.push(compiler_Prop);
        }

        if (!t.isObjectExpression(compiler_Prop.value)) {
          throw new Error("Expected the `compiler` property to be an object.");
        }

        let relay_ObjProps: t.ObjectProperty[] = [
          t.objectProperty(t.identifier("src"), t.stringLiteral(this.context.srcPath.rel)),
          t.objectProperty(t.identifier("language"), t.stringLiteral(this.context.compilerLanguage)),
        ];

        if (this.context.artifactPath) {
          relay_ObjProps.push(
            t.objectProperty(t.identifier("artifactDirectory"), t.stringLiteral(this.context.artifactPath.rel))
          );
        }

        const compiler_relayProp = compiler_Prop.value.properties.find(
          (p) => t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === "relay"
        ) as t.ObjectProperty;

        if (compiler_relayProp && t.isObjectExpression(compiler_relayProp.value)) {
          // We already have a "relay" property, so we merge its properties,
          // with the new ones.
          compiler_relayProp.value = t.objectExpression(
            mergeProperties(compiler_relayProp.value.properties, relay_ObjProps)
          );
        } else {
          // We do not yet have a "relay" propery, so we add it.
          compiler_Prop.value.properties.push(
            t.objectProperty(t.identifier("relay"), t.objectExpression(relay_ObjProps))
          );
        }

        path.skip();
      },
    });

    const updatedConfigCode = printAst(ast, configCode);

    await this.context.fs.writeToFile(configFile.abs, updatedConfigCode);
  }
}

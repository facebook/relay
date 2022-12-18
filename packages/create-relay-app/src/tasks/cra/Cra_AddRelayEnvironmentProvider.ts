import traverse, { NodePath } from "@babel/traverse";
import path from "path";
import { REACT_RELAY_PACKAGE, RELAY_ENV, RELAY_ENV_PROVIDER } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { RelativePath } from "../../misc/RelativePath.js";
import { insertNamedImport, insertNamedImports, parseAst, printAst } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase, TaskSkippedError } from "../TaskBase.js";
import t from "@babel/types";
import { ParseResult } from "@babel/parser";

export class Cra_AddRelayEnvironmentProvider extends TaskBase {
  message: string = "Add " + RELAY_ENV_PROVIDER;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("cra");
  }

  async run(): Promise<void> {
    const mainFilename = "index" + (this.context.args.typescript ? ".tsx" : ".js");

    const mainFile = this.context.env.rel(path.join("src", mainFilename));

    this.updateMessage(this.message + " in " + bold(mainFile.rel));

    const code = await this.context.fs.readFromFile(mainFile.abs);

    const ast = parseAst(code);

    configureRelayProviderInReactDomRender(ast, mainFile, this.context.relayEnvFile);

    const updatedCode = printAst(ast, code);

    await this.context.fs.writeToFile(mainFile.abs, updatedCode);
  }
}

export function hasRelayProvider(jsxPath: NodePath<t.JSXElement>): boolean {
  let isProviderConfigured = false;

  jsxPath.traverse({
    JSXOpeningElement: (path) => {
      if (isProviderConfigured) {
        return;
      }

      if (t.isJSXIdentifier(path.node.name) && path.node.name.name === RELAY_ENV_PROVIDER) {
        isProviderConfigured = true;
        path.skip();
        return;
      }
    },
  });

  return isProviderConfigured;
}

export function configureRelayProviderInReactDomRender(
  ast: ParseResult<t.File>,
  currentFile: RelativePath,
  relayEnvFile: RelativePath
) {
  let providerWrapped = false;

  traverse.default(ast, {
    JSXElement: (path) => {
      if (providerWrapped) {
        return;
      }

      const parent = path.parentPath.node;

      // Check if it's the top JSX in ReactDOM.render(...)
      if (
        !t.isCallExpression(parent) ||
        !t.isMemberExpression(parent.callee) ||
        !t.isIdentifier(parent.callee.property) ||
        parent.callee.property.name !== "render"
      ) {
        return;
      }

      const isProviderConfigured = hasRelayProvider(path);

      if (isProviderConfigured) {
        throw new TaskSkippedError("Already added");
      }

      const relativeRelayImport = new RelativePath(currentFile.parentDirectory, removeExtension(relayEnvFile.abs));

      const envId = insertNamedImport(path, RELAY_ENV, relativeRelayImport.rel);

      const envProviderId = t.jsxIdentifier(insertNamedImport(path, RELAY_ENV_PROVIDER, REACT_RELAY_PACKAGE).name);

      wrapJsxInRelayProvider(path, envProviderId, envId);

      providerWrapped = true;

      path.skip();
    },
  });

  if (!providerWrapped) {
    throw new Error("Could not find JSX being passed to ReactDOM.render");
  }
}

export function wrapJsxInRelayProvider(
  jsxPath: NodePath<t.JSXElement>,
  envProviderId: t.JSXIdentifier,
  envId: t.Identifier
) {
  // Wrap JSX into RelayEnvironmentProvider.
  jsxPath.replaceWith(
    t.jsxElement(
      t.jsxOpeningElement(envProviderId, [
        t.jsxAttribute(t.jsxIdentifier("environment"), t.jsxExpressionContainer(envId)),
      ]),
      t.jsxClosingElement(envProviderId),
      [jsxPath.node]
    )
  );
}

export function removeExtension(filename: string): string {
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

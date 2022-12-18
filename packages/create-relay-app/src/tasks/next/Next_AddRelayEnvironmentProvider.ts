import traverse from "@babel/traverse";
import path from "path";
import { REACT_RELAY_PACKAGE, RELAY_ENV_PROVIDER, RELAY_RUNTIME_PACKAGE } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { RelativePath } from "../../misc/RelativePath.js";
import { astToString, insertNamedImport, insertNamedImports, parseAst, prettifyCode } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase, TaskSkippedError } from "../TaskBase.js";
import t from "@babel/types";
import { removeExtension, hasRelayProvider, wrapJsxInRelayProvider } from "../cra/Cra_AddRelayEnvironmentProvider.js";
import { Next_AddTypeHelpers } from "./Next_AddTypeHelpers.js";

// todo: test this
const envCreationAndHydration = `
const environment = useMemo(initRelayEnvironment, []);

useEffect(() => {
  const store = environment.getStore();

  // Hydrate the store.
  store.publish(new RecordSource(pageProps.initialRecords));

  // Notify any existing subscribers.
  store.notify();
}, [environment, pageProps.initialRecords])

`;

const APP_PROPS = "AppProps";
const RELAY_PAGE_PROPS = "RelayPageProps";

export class Next_AddRelayEnvironmentProvider extends TaskBase {
  message: string = "Add " + RELAY_ENV_PROVIDER;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("next");
  }

  async run(): Promise<void> {
    const mainFilename = "_app" + (this.context.args.typescript ? ".tsx" : ".js");

    const mainFile = this.context.env.rel(path.join("pages", mainFilename));

    this.updateMessage(this.message + " in " + bold(mainFile.rel));

    const code = await this.context.fs.readFromFile(mainFile.abs);

    const ast = parseAst(code);

    let providerWrapped = false;

    traverse.default(ast, {
      JSXElement: (path) => {
        // Find first JSX being returned *somewhere*.
        if (providerWrapped || !path.parentPath.isReturnStatement()) {
          return;
        }

        const functionReturn = path.parentPath;

        const isProviderConfigured = hasRelayProvider(path);

        if (isProviderConfigured) {
          throw new TaskSkippedError("Already added");
        }

        // We need to modify the type of the _app arguments,
        // starting with Next 12.3.
        if (this.context.args.typescript) {
          // Import RelayPageProps.
          const relayTypesPath = Next_AddTypeHelpers.getRelayTypesPath(this.context);
          const relayTypesImportPath = new RelativePath(mainFile.parentDirectory, removeExtension(relayTypesPath.abs));

          insertNamedImport(path, RELAY_PAGE_PROPS, relayTypesImportPath.rel);

          // Change argument of type AppProps to AppProps<RelayPageProps>.
          const functionBodyPath = functionReturn.parentPath;
          if (!functionBodyPath.isBlockStatement()) {
            throw new Error("Expected parentPath to be a block statement.");
          }

          const functionPath = functionBodyPath.parentPath;
          if (!functionPath.isFunctionDeclaration() || !t.isFunctionDeclaration(functionPath.node)) {
            throw new Error("Expected parentPath to be a function declaration.");
          }

          const appPropsArg = functionPath.node.params[0];

          if (!appPropsArg) {
            throw new Error("Expected function to have one argument.");
          }

          const genericAppProps = t.genericTypeAnnotation(
            t.identifier(APP_PROPS),
            t.typeParameterInstantiation([t.genericTypeAnnotation(t.identifier(RELAY_PAGE_PROPS))])
          );

          appPropsArg.typeAnnotation = t.typeAnnotation(genericAppProps);
        }

        insertNamedImports(path, ["useMemo", "useEffect"], "react");
        insertNamedImport(path, "RecordSource", RELAY_RUNTIME_PACKAGE);

        const relayEnvImportPath = new RelativePath(
          mainFile.parentDirectory,
          removeExtension(this.context.relayEnvFile.abs)
        );

        insertNamedImport(path, "initRelayEnvironment", relayEnvImportPath.rel);

        functionReturn.addComment("leading", "--MARKER", true);

        const envProviderId = t.jsxIdentifier(insertNamedImport(path, RELAY_ENV_PROVIDER, REACT_RELAY_PACKAGE).name);

        wrapJsxInRelayProvider(path, envProviderId, t.identifier("environment"));

        providerWrapped = true;

        path.skip();
      },
    });

    if (!providerWrapped) {
      throw new Error("Could not find JSX");
    }

    let updatedCode = astToString(ast, code);

    updatedCode = updatedCode.replace("//--MARKER", envCreationAndHydration);
    updatedCode = prettifyCode(updatedCode);

    await this.context.fs.writeToFile(mainFile.abs, updatedCode);
  }
}

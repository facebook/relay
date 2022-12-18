import { TaskBase } from "./TaskBase.js";
import { PACKAGE_FILE } from "../consts.js";
import { bold } from "../utils/cli.js";
import { ProjectContext } from "../misc/ProjectContext.js";

const validateRelayArtifactsScript = "relay-compiler --validate";

export class ConfigureRelayCompilerTask extends TaskBase {
  message: string = `Configure ${bold("relay-compiler")} in ${bold(PACKAGE_FILE)}`;

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return true;
  }

  async run(): Promise<void> {
    const packageJson = await this.context.env.packageJson.parse();

    const scriptsSection: Record<string, string> = packageJson["scripts"] ?? {};

    if (!scriptsSection["relay"]) {
      // Add "relay" script
      scriptsSection["relay"] = "relay-compiler";
    }

    const buildScript = scriptsSection["build"];

    if (buildScript && typeof buildScript === "string" && !buildScript.includes(validateRelayArtifactsScript)) {
      // There is an existing build script.
      scriptsSection["build"] = validateRelayArtifactsScript + " && " + buildScript;
    }

    const relaySection = (packageJson["relay"] ?? {}) as Record<string, string | string[] | boolean>;

    relaySection["src"] = this.context.srcPath.rel;
    relaySection["language"] = this.context.compilerLanguage;
    relaySection["schema"] = this.context.schemaPath.rel;
    relaySection["exclude"] = ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"];

    if (this.context.is("vite")) {
      // When generating without eagerEsModules artifacts contain
      // module.exports, which Vite can not handle correctly.
      // eagerEsModules will output export default.
      relaySection["eagerEsModules"] = true;
    }

    if (this.context.artifactPath) {
      relaySection["artifactDirectory"] = this.context.artifactPath.rel;
    }

    packageJson["relay"] = relaySection;

    this.context.env.packageJson.persist(packageJson);
  }
}

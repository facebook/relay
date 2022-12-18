import { TaskBase } from "./TaskBase.js";
import { BABEL_RELAY_PACKAGE, VITE_RELAY_PACKAGE } from "../consts.js";
import { bold } from "../utils/cli.js";
import { ProjectContext } from "../misc/ProjectContext.js";

export class InstallNpmDevDependenciesTask extends TaskBase {
  message = "Add Relay devDependencies";

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return true;
  }

  async run(): Promise<void> {
    if (this.context.args.skipInstall) {
      this.skip();
      return;
    }

    const packages = this.getPackages();

    this.updateMessage(this.message + " " + packages.map((p) => bold(p)).join(" "));

    const latestPackages = packages.map((p) => (p.substring(1).includes("@") ? p : p + "@latest"));

    await this.context.manager.addDevDependency(latestPackages);
  }

  private getPackages() {
    const relayDevDep = ["relay-compiler"];

    if (this.context.args.typescript) {
      relayDevDep.push("@types/react-relay");
      relayDevDep.push("@types/relay-runtime");
    }

    if (this.context.is("cra") || this.context.is("vite")) {
      relayDevDep.push(BABEL_RELAY_PACKAGE);
    }

    if (this.context.is("vite")) {
      relayDevDep.push(VITE_RELAY_PACKAGE);
    }

    return relayDevDep;
  }
}

import { TaskBase } from "./TaskBase.js";
import { GRAPHQL_WS_PACKAGE, REACT_RELAY_PACKAGE } from "../consts.js";
import { bold } from "../utils/cli.js";
import { ProjectContext } from "../misc/ProjectContext.js";

export class InstallNpmDependenciesTask extends TaskBase {
  message = "Add Relay dependencies";

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

    const packages = [REACT_RELAY_PACKAGE];

    if (this.context.args.subscriptions) {
      packages.push(GRAPHQL_WS_PACKAGE, "graphql@15.x");
    }

    this.updateMessage(this.message + " " + packages.map((p) => bold(p)).join(" "));

    const latestPackages = packages.map((p) => (p.substring(1).includes("@") ? p : p + "@latest"));

    await this.context.manager.addDependency(latestPackages);
  }
}

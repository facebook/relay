import { TaskBase } from "./TaskBase.js";
import { bold, prettifyCode } from "../utils/index.js";
import { ProjectContext } from "../misc/ProjectContext.js";
import { EOL } from "os";

export const HTTP_ENDPOINT = "HTTP_ENDPOINT";
export const WEBSOCKET_ENDPOINT = "WEBSOCKET_ENDPOINT";

export class GenerateRelayEnvironmentTask extends TaskBase {
  message: string = "Generate Relay environment";

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return true;
  }

  async run(): Promise<void> {
    await this.addRelayEnvironmentFile();
  }

  // todo: this could maybe be simplified by also using the AST.
  //       this would also enable us to update an existing configuration.
  private async addRelayEnvironmentFile() {
    this.updateMessage(this.message + " " + bold(this.context.relayEnvFile.rel));

    if (this.context.fs.exists(this.context.relayEnvFile.abs)) {
      this.skip("File exists");
      return;
    }

    const b = new CodeBuilder();

    // Add imports
    const relayRuntimeImports: string[] = ["Environment", "Network", "RecordSource", "Store"];

    if (this.context.args.subscriptions) {
      relayRuntimeImports.push("Observable");
    }

    if (this.context.args.typescript) {
      relayRuntimeImports.push("FetchFunction");

      if (this.context.args.subscriptions) {
        relayRuntimeImports.push("SubscribeFunction");
      }
    }

    // prettier-ignore
    b.addLine(`import { ${relayRuntimeImports.join(", ")} } from "relay-runtime";`)

    if (this.context.args.subscriptions) {
      b.addLine(`import { createClient } from "graphql-ws";`);
    }

    b.addLine();

    // Add configurations
    b.addLine(`const ${HTTP_ENDPOINT} = "http://localhost:5000/graphql";`);

    if (this.context.args.subscriptions) {
      b.addLine(`const ${WEBSOCKET_ENDPOINT} = "ws://localhost:5000/graphql";`);
    }

    b.addLine();

    // Add fetchFn
    let fetchFn = `const fetchFn: FetchFunction = async (request, variables) => {
      const resp = await fetch(${HTTP_ENDPOINT}, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // <-- Additional headers like 'Authorization' would go here
        },
        body: JSON.stringify({
          query: request.text, // <-- The GraphQL document composed by Relay
          variables,
        }),
      });

      return await resp.json();
    };`;

    if (!this.context.args.typescript) {
      // Remove TypeScript type
      fetchFn = fetchFn.replace("fetchFn: FetchFunction", "fetchFn");
    }

    b.addLine(fetchFn);

    b.addLine();

    // Add subscribeFn
    if (this.context.args.subscriptions) {
      if (this.context.args.typescript) {
        b.addLine(`let subscribeFn: SubscribeFunction;

          if (typeof window !== "undefined") {
            // We only want to setup subscriptions if we are on the client.
            const subscriptionsClient = createClient({
              url: WEBSOCKET_ENDPOINT,
            });

            subscribeFn = (request, variables) => {
              // To understand why we return Observable<any>,
              // please see: https://github.com/enisdenjo/graphql-ws/issues/316#issuecomment-1047605774
              return Observable.create<any>((sink) => {
                if (!request.text) {
                  return sink.error(new Error("Operation text cannot be empty"));
                }

                return subscriptionsClient.subscribe(
                  {
                    operationName: request.name,
                    query: request.text,
                    variables,
                  },
                  sink
                );
              });
            };
          }`);
      } else {
        b.addLine(`let subscribeFn;

          if (typeof window !== "undefined") {
            // We only want to setup subscriptions if we are on the client.
            const subscriptionsClient = createClient({
              url: WEBSOCKET_ENDPOINT,
            });

            subscribeFn = (request, variables) => {
              return Observable.create((sink) => {
                if (!request.text) {
                  return sink.error(new Error("Operation text cannot be empty"));
                }

                return subscriptionsClient.subscribe(
                  {
                    operationName: request.name,
                    query: request.text,
                    variables,
                  },
                  sink
                );
              });
            };
          }`);
      }
    }

    b.addLine();

    // Create environment
    let createEnv = `function createRelayEnvironment() {
      return new Environment({
        network: Network.create(fetchFn),
        store: new Store(new RecordSource()),
      });
    }`;

    if (this.context.args.subscriptions) {
      createEnv = createEnv.replace("fetchFn", "fetchFn, subscribeFn");
    }

    b.addLine(createEnv);

    b.addLine();

    // Export environment
    if (this.context.is("next")) {
      let initEnv = `let relayEnvironment: Environment | undefined;

        export function initRelayEnvironment() {
          const environment = relayEnvironment ?? createRelayEnvironment();

          // For SSG and SSR always create a new Relay environment.
          if (typeof window === "undefined") {
            return environment;
          }

          // Create the Relay environment once in the client
          // and then reuse it.
          if (!relayEnvironment) {
            relayEnvironment = environment;
          }

          return relayEnvironment;
        }`;

      if (!this.context.args.typescript) {
        initEnv = initEnv.replace(": Environment | undefined", "");
      }

      b.addLine(initEnv);
    } else {
      b.addLine(`export const RelayEnvironment = createRelayEnvironment();`);
    }

    const prettifiedCode = prettifyCode(b.code);

    await this.context.fs.createDirectory(this.context.relayEnvFile.parentDirectory);

    await this.context.fs.writeToFile(this.context.relayEnvFile.abs, prettifiedCode);
  }
}

class CodeBuilder {
  private _code: string = "";

  get code() {
    return this._code;
  }

  addLine(line?: string) {
    this._code += (line || "") + EOL;
  }
}

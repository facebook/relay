#!/usr/bin/env node

import path, { dirname } from "path";
import { exit } from "process";
import { fileURLToPath } from "url";
import { InvalidArgError } from "./arguments/ArgumentBase.js";
import {
  ArgumentHandler,
  ArtifactDirectoryArgument,
  PackageManagerArgument,
  SchemaFileArgument,
  SrcArgument,
  ToolchainArgument,
  TypeScriptArgument,
  SubscriptionsArgument,
} from "./arguments/index.js";
import { BABEL_RELAY_MACRO, PACKAGE_FILE } from "./consts.js";
import { Filesystem } from "./misc/Filesystem.js";
import { getPackageManger, getExecutingPackageManager } from "./misc/packageManagers/index.js";
import {
  GenerateArtifactDirectoryTask,
  GenerateRelayEnvironmentTask,
  GenerateGraphQlSchemaFileTask,
  TaskRunner,
  ConfigureRelayCompilerTask,
  Cra_AddBabelMacroTypeDefinitionsTask,
  InstallNpmDependenciesTask,
  InstallNpmDevDependenciesTask,
  Vite_ConfigureVitePluginRelayTask,
  Next_ConfigureNextCompilerTask,
  Cra_AddRelayEnvironmentProvider,
  Vite_AddRelayEnvironmentProvider,
  Next_AddRelayEnvironmentProvider,
  ConfigureEolOfArtifactsTask,
  HTTP_ENDPOINT,
  WEBSOCKET_ENDPOINT,
  Next_AddTypeHelpers,
} from "./tasks/index.js";
import { CliArguments } from "./types.js";
import { headline, bold, importantHeadline, printError } from "./utils/index.js";
import { ProjectContext } from "./misc/ProjectContext.js";
import { Environment, MissingPackageJsonError } from "./misc/Environment.js";
import { Git } from "./misc/Git.js";
import { CommandRunner } from "./misc/CommandRunner.js";

const fs = new Filesystem();
const cmdRunner = new CommandRunner();

const distDirectory = dirname(fileURLToPath(import.meta.url));
const ownPackageJsonFilepath = path.join(distDirectory, "..", PACKAGE_FILE);

const cwd = process.cwd();
const pacMan = getExecutingPackageManager();

const env = new Environment(cwd, ownPackageJsonFilepath, fs);

// Determine environment information, such as where the package.json
// of the target project lies.
try {
  await env.init();
} catch (error) {
  if (error instanceof MissingPackageJsonError) {
    printError(`Could not find a ${bold(PACKAGE_FILE)} in the ${bold(cwd)} directory.`);

    console.log();
    console.log(headline("Correct usage"));
    console.log();

    console.log("1. Remember to first scaffold a React project using:");
    console.log("   Next.js: " + bold(pacMan + "create next-app --typescript"));
    console.log("   Vite.js: " + bold(pacMan + "create vite --template react-ts"));
    console.log("   Create React App: " + bold(pacMan + "create react-app <project-name> --template typescript"));
    console.log();
    console.log("2. Move into the scaffolded directory:");
    console.log("   " + bold("cd <project-name>"));
    console.log();
    console.log(`3. Run the original command again:`);
    console.log("   " + bold(pacMan + "create relay-app"));
  } else if (error instanceof Error) {
    printError("Unexpected error while gathering environment information: " + error.message);
  } else {
    printError("Unexpected error while gathering environment information");
  }

  exit(1);
}

// Define all of the possible CLI arguments.
const argumentHandler = new ArgumentHandler([
  new ToolchainArgument(env),
  new TypeScriptArgument(fs, env),
  new SrcArgument(fs, env),
  new SchemaFileArgument(fs, env),
  new ArtifactDirectoryArgument(fs, env),
  new SubscriptionsArgument(),
  new PackageManagerArgument(fs, env),
]);

const git = new Git();
const isGitRepo = await git.isGitRepository(env.cwd);

let userArgs: CliArguments;

try {
  // Get the arguments provided to the program.
  const cliArgs = await argumentHandler.parseArgs(env);

  if (isGitRepo && !cliArgs.ignoreGitChanges) {
    const hasUnsavedChanges = await git.hasUnsavedChanges(env.cwd);

    if (hasUnsavedChanges) {
      printError(`Please commit or discard all changes in the ${bold(env.cwd)} directory before continuing.`);
      exit(1);
    }
  }

  // Prompt for all of the missing arguments, required to execute the program.
  userArgs = await argumentHandler.resolveMissingArgs(cliArgs);

  console.log();
} catch (error) {
  if (error instanceof InvalidArgError) {
    printError(error.message);
  } else if (error instanceof Error) {
    printError("Error while parsing CLI arguments: " + error.message);
  } else {
    printError("Unexpected error while parsing CLI arguments");
  }

  exit(1);
}

// Instantiate a package manager, based on the user's choice.
const packageManager = getPackageManger(userArgs.packageManager, cmdRunner, env.cwd);

// Build a context that contains all of the configuration.
const context = new ProjectContext(env, userArgs, packageManager, fs);

// Define tasks that should be executed.
const runner = new TaskRunner([
  new InstallNpmDependenciesTask(context),
  new InstallNpmDevDependenciesTask(context),
  new ConfigureRelayCompilerTask(context),
  new GenerateRelayEnvironmentTask(context),
  new GenerateGraphQlSchemaFileTask(context),
  new GenerateArtifactDirectoryTask(context),
  isGitRepo && new ConfigureEolOfArtifactsTask(context),
  new Cra_AddBabelMacroTypeDefinitionsTask(context),
  new Cra_AddRelayEnvironmentProvider(context),
  new Vite_ConfigureVitePluginRelayTask(context),
  new Vite_AddRelayEnvironmentProvider(context),
  new Next_ConfigureNextCompilerTask(context),
  new Next_AddTypeHelpers(context),
  new Next_AddRelayEnvironmentProvider(context),
]);

// Execute all of the tasks sequentially.
try {
  await runner.run();
} catch {
  // The error should've already been correctly handled by the runner,
  // we just exit the program here.

  console.log();
  printError("Some of the tasks failed unexpectedly.");
  exit(1);
}

console.log();
console.log();

// Display a guide to the user on how to continue setting up his project.
console.log(headline("Next steps"));
console.log();

console.log(`1. Replace ${bold(context.schemaPath.rel)} with your own GraphQL schema file.`);

const endpoints = bold(HTTP_ENDPOINT) + (!context.args.subscriptions ? "" : " / " + bold(WEBSOCKET_ENDPOINT));
console.log(`2. Replace the value of the ${endpoints} variable in the ${bold(context.relayEnvFile.rel)} file.`);

const artifactFileExt = "*" + context.artifactExtension;

console.log(`3. Ignore ${bold(artifactFileExt)} files in your linter / formatter configuration.`);

// Create React app comes with some annoyances, so we warn the user about it,
// and provide possible solutions that can be manually implemented.
if (context.is("cra")) {
  console.log();
  console.log(importantHeadline("Important"));
  console.log();
  console.log(`Remember you need to import ${bold("graphql")} like the following:`);
  console.log("   " + bold(`import graphql from \"${BABEL_RELAY_MACRO}\";`));
  console.log();
  console.log(`Otherwise the transform of the ${bold("graphql``")} tagged literal will not work!`);
  console.log("If you do not want to use the macro, you can check out the following document for guidance:");
  console.log("https://github.com/facebook/relay/blob/main/packages/create-relay-app/docs/cra-babel-setup.md");
}

if (context.is("next")) {
  console.log();
  console.log(importantHeadline("Important"));
  console.log();
  console.log(`Follow this guide, if you want to fetch data on the server instead of the client:`);
  console.log("https://github.com/facebook/relay/blob/main/packages/create-relay-app/docs/next-data-fetching.md");
}

console.log();

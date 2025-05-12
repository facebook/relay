/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {BabelState} from './BabelPluginRelay';
import type {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql';

// $FlowFixMe[cannot-resolve-module]
const crypto = require('crypto');
const {print} = require('graphql');
const {
  dirname,
  join: joinPath,
  normalize: normalizePath,
  relative: relativePath,
  resolve: resolvePath,
  sep: pathSep,
  // $FlowFixMe[cannot-resolve-module]
} = require('path');

const GENERATED = './__generated__/';

/**
 * Converts backslashes in a path to forward slashes (POSIX style) for
 * cross-platform compatibility.
 */
function posixifyPath(path: string): string {
  // $FlowFixMe[cannot-resolve-name]
  return process.platform === 'win32' ? path.replace(/\\/g, '/') : path;
}

/**
 * Finds the projects for a given file path based on the configuration.
 */
function getProjectsForFile(
  filePath: string,
  RelayConfig: Object,
): ?Array<string> {
  // Check if we have a multi-project configuration
  if (!RelayConfig || !RelayConfig.projects || !RelayConfig.sources) {
    return null; // Not a multi-project configuration
  }

  const normalizedFilePath = normalizePath(filePath);

  let bestMatchDepth = -1;
  let matchingProjects: ?Array<string> = null;

  // Find the most specific path match in sources
  Object.entries(RelayConfig.sources).forEach(([sourcePath, projectsValue]) => {
    const normalizedSourcePath = normalizePath(sourcePath);

    // Check if this is an exact match or if file is inside the directory
    const isExactMatch = normalizedFilePath === normalizedSourcePath;
    const relPath = relativePath(normalizedSourcePath, normalizedFilePath);
    const isInDirectory = !relPath.startsWith('..') && relPath !== '';

    if (isExactMatch || isInDirectory) {
      // Calculate path depth using the normalized path
      const pathDepth = normalizedSourcePath
        .split(pathSep)
        .filter(Boolean).length;

      // If this match is more specific (deeper) than our current match, use it
      if (pathDepth > bestMatchDepth) {
        bestMatchDepth = pathDepth;

        // Handle the case where projectsValue is null or an empty array
        if (projectsValue === null) {
          matchingProjects = [];
        } else if (Array.isArray(projectsValue)) {
          matchingProjects = projectsValue.length > 0 ? projectsValue : [];
        } else {
          matchingProjects = [projectsValue];
        }
      }
    }
  });

  return matchingProjects && matchingProjects.length > 0
    ? matchingProjects
    : null;
}

/**
 * Gets config for a specific project from the multi-project configuration.
 */
function getProjectConfig(projectName: string, RelayConfig: Object): ?Object {
  if (!RelayConfig || !RelayConfig.projects) {
    return null;
  }

  return RelayConfig.projects[projectName] || null;
}

/**
 * Gets project-specific configuration based on the current file path.
 */
function getConfigForFile(state: BabelState): Object {
  const config = state.opts || {};

  if (!state.file || !state.file.opts || !state.file.opts.filename) {
    return config;
  }

  const filePath = state.file.opts.filename;

  // If this is not a multi-project config, just return the global config
  if (!config.projects || !config.sources) {
    return config;
  }

  const projectNames = getProjectsForFile(filePath, config);

  // If no matching projects found, return the global config
  if (!projectNames || projectNames.length === 0) {
    return config;
  }

  // For files that match multiple projects, we prioritize the first project
  const primaryProjectName = projectNames[0];
  const primaryProjectConfig = getProjectConfig(primaryProjectName, config);

  if (!primaryProjectConfig) {
    return config;
  }

  // For conflicting settings, log detailed warnings if we're choosing one over others
  if (projectNames.length > 1) {
    // Get configs for all matching projects
    const projectConfigs = projectNames
      .map(name => ({
        name,
        config: getProjectConfig(name, config),
      }))
      .filter(p => p.config != null);

    // Check for important settings that might conflict
    const settingsToCheck = [
      {key: 'eagerEsModules', displayName: 'eagerEsModules'},
      {key: 'output', displayName: 'output/artifactDirectory'},
      {key: 'jsModuleFormat', displayName: 'jsModuleFormat'},
      {key: 'codegenCommand', displayName: 'codegenCommand'},
      {key: 'isDevVariableName', displayName: 'isDevVariableName'},
    ];

    // Collect conflicts
    const conflicts = settingsToCheck.filter(setting => {
      const primaryValue = primaryProjectConfig[setting.key];
      return projectConfigs.some(
        p =>
          p.config != null &&
          p.config[setting.key] !== undefined &&
          primaryValue !== undefined &&
          p.config[setting.key] !== primaryValue,
      );
    });

    // Log detailed warning for conflicts
    if (conflicts.length > 0) {
      const conflictDetails = conflicts
        .map(setting => {
          const values = projectConfigs
            .map(p =>
              p.config != null
                ? `${p.name}: ${JSON.stringify(p.config[setting.key])}`
                : '',
            )
            .filter(Boolean)
            .join(', ');

          return `${setting.displayName} (${values})`;
        })
        .join('\n  ');

      console.warn(
        `BabelPluginRelay: File ${filePath} matches multiple projects with conflicting settings:\n` +
          `  ${conflictDetails}\n` +
          `Using settings from the first project (${primaryProjectName}).`,
      );
    }
  }

  // Create a new config with appropriate field mappings
  const mergedConfig = {
    ...config, // Global settings
    ...primaryProjectConfig, // Project-specific settings
  };

  // Handle field name differences between multi-project and single-project configs
  if (primaryProjectConfig.output && !mergedConfig.artifactDirectory) {
    mergedConfig.artifactDirectory = primaryProjectConfig.output;
  }

  return mergedConfig;
}

/**
 * Given a graphql`` tagged template literal, replace it with the appropriate
 * runtime artifact.
 */
function compileGraphQLTag(
  t: $FlowFixMe,
  path: Object,
  state: BabelState,
  ast: DocumentNode,
): void {
  if (ast.definitions.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Expected exactly one definition per graphql tag.',
    );
  }
  const definition = ast.definitions[0];
  if (
    definition.kind !== 'FragmentDefinition' &&
    definition.kind !== 'OperationDefinition'
  ) {
    throw new Error(
      'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
        'subscription, got `' +
        definition.kind +
        '`.',
    );
  }

  // Get the configuration for the current file
  const config = getConfigForFile(state);

  const eagerEsModules = config.eagerEsModules ?? false;
  const isHasteMode = config.jsModuleFormat === 'haste';
  const isDevVariable = config.isDevVariableName;
  const artifactDirectory = config.artifactDirectory;
  const buildCommand = config.codegenCommand ?? 'relay-compiler';
  // Fallback is 'true'
  const isDevelopment =
    // $FlowFixMe[cannot-resolve-name]
    (process.env.BABEL_ENV || process.env.NODE_ENV) !== 'production';

  return createNode(t, state, path, definition, {
    artifactDirectory,
    eagerEsModules,
    buildCommand,
    isDevelopment,
    isHasteMode,
    isDevVariable,
  });
}

/**
 * The Relay compiler generates separate modules that contain the compiled code.
 * Here we generate:
 *  - a memoized `require` call for that generated code
 *  - for development mode, runtime validation that the artifacts are up to date
 */
function createNode(
  t: $FlowFixMe,
  state: BabelState,
  path: $FlowFixMe,
  graphqlDefinition: OperationDefinitionNode | FragmentDefinitionNode,
  options: {
    // If an output directory is specified when running relay-compiler this should point to that directory
    artifactDirectory: ?string,
    // Generate eager es modules instead of lazy require
    eagerEsModules: boolean,
    // The command to run to compile Relay files, used for error messages.
    buildCommand: string,
    // Generate extra validation, defaults to true.
    isDevelopment: boolean,
    // Wrap the validation code in a conditional checking this variable.
    isDevVariable: ?string,
    // Use haste style global requires, defaults to false.
    isHasteMode: boolean,
  },
): Object {
  const definitionName = graphqlDefinition.name && graphqlDefinition.name.value;
  if (!definitionName) {
    throw new Error('GraphQL operations and fragments must contain names');
  }
  const requiredFile = definitionName + '.graphql';
  const requiredPath = posixifyPath(
    options.isHasteMode
      ? requiredFile
      : options.artifactDirectory
        ? getRelativeImportPath(state, options.artifactDirectory, requiredFile)
        : GENERATED + requiredFile,
  );

  const hash = crypto
    .createHash('md5')
    .update(print(graphqlDefinition), 'utf8')
    .digest('hex');

  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }

  const id = topScope.generateUidIdentifier(definitionName);

  const expHash = t.MemberExpression(t.cloneNode(id), t.Identifier('hash'));
  const expWarn = warnNeedsRebuild(t, definitionName, options.buildCommand);
  const expWarnIfOutdated = t.LogicalExpression(
    '&&',
    t.cloneNode(expHash),
    t.LogicalExpression(
      '&&',
      t.BinaryExpression('!==', expHash, t.StringLiteral(hash)),
      expWarn,
    ),
  );

  if (options.eagerEsModules) {
    const importDeclaration = t.ImportDeclaration(
      [t.ImportDefaultSpecifier(id)],
      t.StringLiteral(requiredPath),
    );
    const program = path.findParent(parent => parent.isProgram());
    program.unshiftContainer('body', importDeclaration);

    const expAssignAndCheck = t.SequenceExpression([
      expWarnIfOutdated,
      t.cloneNode(id),
    ]);

    let expAssign;
    if (options.isDevVariable != null) {
      expAssign = t.ConditionalExpression(
        t.Identifier(options.isDevVariable),
        expAssignAndCheck,
        t.cloneNode(id),
      );
    } else if (options.isDevelopment) {
      expAssign = expAssignAndCheck;
    } else {
      expAssign = t.cloneNode(id);
    }

    path.replaceWith(expAssign);
  } else {
    topScope.push({id: t.cloneNode(id)});

    const requireGraphQLModule = t.CallExpression(t.Identifier('require'), [
      t.StringLiteral(requiredPath),
    ]);

    const expAssignProd = t.AssignmentExpression(
      '=',
      t.cloneNode(id),
      requireGraphQLModule,
    );
    const expAssignAndCheck = t.SequenceExpression([
      expAssignProd,
      expWarnIfOutdated,
      t.cloneNode(id),
    ]);

    let expAssign;
    if (options.isDevVariable != null) {
      expAssign = t.ConditionalExpression(
        t.Identifier(options.isDevVariable),
        expAssignAndCheck,
        expAssignProd,
      );
    } else if (options.isDevelopment) {
      expAssign = expAssignAndCheck;
    } else {
      expAssign = expAssignProd;
    }

    const expVoid0 = t.UnaryExpression('void', t.NumericLiteral(0));
    path.replaceWith(
      t.ConditionalExpression(
        t.BinaryExpression('!==', t.cloneNode(id), expVoid0),
        t.cloneNode(id),
        t.cloneNode(expAssign),
      ),
    );
  }
}

function warnNeedsRebuild(
  t: $FlowFixMe,
  definitionName: string,
  buildCommand: string,
) {
  return t.callExpression(
    t.memberExpression(t.identifier('console'), t.identifier('error')),
    [
      t.stringLiteral(
        `The definition of '${definitionName}' appears to have changed. Run ` +
          '`' +
          buildCommand +
          '` to update the generated files to receive the expected data.',
      ),
    ],
  );
}

function getRelativeImportPath(
  state: BabelState,
  artifactDirectory: string,
  fileToRequire: string,
): string {
  if (state.file == null) {
    throw new Error('Babel state is missing expected file name');
  }
  const filename = state.file.opts.filename;

  const relative = relativePath(
    dirname(filename),
    resolvePath(artifactDirectory),
  );

  const relativeReference =
    relative.length === 0 || !relative.startsWith('.') ? './' : '';

  return relativeReference + joinPath(relative, fileToRequire);
}

module.exports = compileGraphQLTag;

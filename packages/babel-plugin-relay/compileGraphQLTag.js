/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {BabelState} from './BabelPluginRelay';
import type {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql';

const crypto = require('crypto');
const {print} = require('graphql');
const {
  dirname,
  join: joinPath,
  relative: relativePath,
  resolve: resolvePath,
} = require('path');

const GENERATED = './__generated__/';

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

  const eagerESModules = Boolean(state.opts && state.opts.eagerESModules);
  const isHasteMode = Boolean(state.opts && state.opts.haste);
  const isDevVariable = state.opts && state.opts.isDevVariable;
  const artifactDirectory = state.opts && state.opts.artifactDirectory;
  const buildCommand =
    (state.opts && state.opts.buildCommand) || 'relay-compiler';
  // Fallback is 'true'
  const isDevelopment =
    (process.env.BABEL_ENV || process.env.NODE_ENV) !== 'production';

  return createNode(t, state, path, definition, {
    artifactDirectory,
    eagerESModules,
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
  options: {|
    // If an output directory is specified when running relay-compiler this should point to that directory
    artifactDirectory: ?string,
    // Generate eager es modules instead of lazy require
    eagerESModules: boolean,
    // The command to run to compile Relay files, used for error messages.
    buildCommand: string,
    // Generate extra validation, defaults to true.
    isDevelopment: boolean,
    // Wrap the validation code in a conditional checking this variable.
    isDevVariable: ?string,
    // Use haste style global requires, defaults to false.
    isHasteMode: boolean,
  |},
): Object {
  const definitionName = graphqlDefinition.name && graphqlDefinition.name.value;
  if (!definitionName) {
    throw new Error('GraphQL operations and fragments must contain names');
  }
  const requiredFile = definitionName + '.graphql';
  const requiredPath = options.isHasteMode
    ? requiredFile
    : options.artifactDirectory
    ? getRelativeImportPath(state, options.artifactDirectory, requiredFile)
    : GENERATED + requiredFile;

  const hash = crypto
    .createHash('md5')
    .update(print(graphqlDefinition), 'utf8')
    .digest('hex');

  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }

  const id = topScope.generateUidIdentifier(definitionName);

  const expHash = t.MemberExpression(id, t.Identifier('hash'));
  const expWarn = warnNeedsRebuild(t, definitionName, options.buildCommand);
  const expWarnIfOutdated = t.LogicalExpression(
    '&&',
    expHash,
    t.LogicalExpression(
      '&&',
      t.BinaryExpression('!==', expHash, t.StringLiteral(hash)),
      expWarn,
    ),
  );

  if (options.eagerESModules) {
    const importDeclaration = t.ImportDeclaration(
      [t.ImportDefaultSpecifier(id)],
      t.StringLiteral(requiredPath),
    );
    const program = path.findParent(parent => parent.isProgram());
    program.unshiftContainer('body', importDeclaration);

    const expAssignAndCheck = t.SequenceExpression([expWarnIfOutdated, id]);

    let expAssign;
    if (options.isDevVariable != null) {
      expAssign = t.ConditionalExpression(
        t.Identifier(options.isDevVariable),
        expAssignAndCheck,
        id,
      );
    } else if (options.isDevelopment) {
      expAssign = expAssignAndCheck;
    } else {
      expAssign = id;
    }

    path.replaceWith(expAssign);
  } else {
    topScope.push({id});

    const requireGraphQLModule = t.CallExpression(t.Identifier('require'), [
      t.StringLiteral(requiredPath),
    ]);

    const expAssignProd = t.AssignmentExpression('=', id, requireGraphQLModule);
    const expAssignAndCheck = t.SequenceExpression([
      expAssignProd,
      expWarnIfOutdated,
      id,
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
        t.BinaryExpression('!==', id, expVoid0),
        id,
        expAssign,
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

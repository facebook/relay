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

const crypto = require('crypto');
const invariant = require('./invariant');
const path = require('path');

const {print} = require('graphql');

const GENERATED = './__generated__/';

import type {OperationDefinitionNode, FragmentDefinitionNode} from 'graphql';
import type {BabelState} from './BabelPluginRelay';

/**
 * Relay Modern creates separate generated files, so Babel transforms graphql
 * definitions to lazy require function calls.
 */
function createModernNode(
  t: $FlowFixMe,
  graphqlDefinition: OperationDefinitionNode | FragmentDefinitionNode,
  state: BabelState,
  options: {
    // If an output directory is specified when running relay-compiler this should point to that directory
    artifactDirectory: ?string,
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
  const requiredPath = options.isHasteMode
    ? requiredFile
    : options.artifactDirectory
      ? getRelativeImportPath(state, options.artifactDirectory, requiredFile)
      : GENERATED + requiredFile;

  const hash = crypto
    .createHash('md5')
    .update(print(graphqlDefinition), 'utf8')
    .digest('hex');

  const requireGraphQLModule = t.callExpression(t.identifier('require'), [
    t.stringLiteral(requiredPath),
  ]);

  const bodyStatements = [t.returnStatement(requireGraphQLModule)];
  if (options.isDevVariable != null || options.isDevelopment) {
    const nodeVariable = t.identifier('node');
    const nodeDotHash = t.memberExpression(nodeVariable, t.identifier('hash'));
    let checkStatements = [
      t.variableDeclaration('const', [
        t.variableDeclarator(nodeVariable, requireGraphQLModule),
      ]),
      t.ifStatement(
        t.logicalExpression(
          '&&',
          nodeDotHash,
          t.binaryExpression('!==', nodeDotHash, t.stringLiteral(hash)),
        ),
        t.blockStatement([
          t.expressionStatement(
            warnNeedsRebuild(t, definitionName, options.buildCommand),
          ),
        ]),
      ),
    ];
    if (options.isDevVariable != null) {
      checkStatements = [
        t.ifStatement(
          t.identifier(options.isDevVariable),
          t.blockStatement(checkStatements),
        ),
      ];
    }
    bodyStatements.unshift(...checkStatements);
  }
  return t.functionExpression(null, [], t.blockStatement(bodyStatements));
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
  invariant(state.file != null, 'babel state file is null');
  const filename = state.file.opts.filename;

  const relative = path.relative(
    path.dirname(filename),
    path.resolve(artifactDirectory),
  );

  const relativeReference =
    relative.length === 0 || !relative.startsWith('.') ? './' : '';

  return relativeReference + path.join(relative, fileToRequire);
}

module.exports = createModernNode;

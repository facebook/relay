/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule createModernNode
 * @flow
 * @format
 */

'use strict';

const crypto = require('crypto');

const {print} = require('graphql');

const GENERATED = './__generated__/';

import typeof BabelTypes from 'babel-types';
import type {OperationDefinitionNode, FragmentDefinitionNode} from 'graphql';

/**
 * Relay Modern creates separate generated files, so Babel transforms graphql
 * definitions to lazy require function calls.
 */
function createModernNode(
  t: BabelTypes,
  graphqlDefinition: OperationDefinitionNode | FragmentDefinitionNode,
  options: {
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
  t: BabelTypes,
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

module.exports = createModernNode;

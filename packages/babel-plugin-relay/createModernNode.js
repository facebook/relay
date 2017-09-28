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
  isHasteMode: boolean,
): Object {
  const definitionName = graphqlDefinition.name;
  if (!definitionName) {
    throw new Error('GraphQL operations and fragments must contain names');
  }
  const requiredFile = definitionName.value + '.graphql';
  const requiredPath = isHasteMode ? requiredFile : GENERATED + requiredFile;
  return t.functionExpression(
    null,
    [],
    t.blockStatement([
      t.returnStatement(
        t.callExpression(t.identifier('require'), [
          t.stringLiteral(requiredPath),
        ]),
      ),
    ]),
  );
}

module.exports = createModernNode;

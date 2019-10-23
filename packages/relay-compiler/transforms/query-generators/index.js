/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const NodeQueryGenerator = require('./NodeQueryGenerator');
const QueryQueryGenerator = require('./QueryQueryGenerator');
const ViewerQueryGenerator = require('./ViewerQueryGenerator');

const {createUserError} = require('../../core/RelayCompilerError');

import type {Fragment, Root} from '../../core/GraphQLIR';
import type {Schema} from '../../core/Schema';

export type RefetchRoot = {|
  path: $ReadOnlyArray<string>,
  node: Root,
  transformedFragment: Fragment,
|};

/**
 * A strategy to generate queries for a given fragment. Multiple stategies
 * can be tried, such as generating a `node(id: ID)` query or a query directly
 * on the root query type.
 */
export type QueryGenerator = {|
  /**
   * Used to describe what fragments this QueryGenerator applies to, used in
   * error messages.
   */
  +description: string,
  /**
   * Returns RefetchRoot or null if not applicable. Might throw a user error
   * for an invalid schema or other problems.
   */
  +buildRefetchOperation: (
    schema: Schema,
    fragment: Fragment,
    queryName: string,
  ) => ?RefetchRoot,
|};

const GENERATORS = [
  ViewerQueryGenerator,
  QueryQueryGenerator,
  NodeQueryGenerator,
];

/**
 * Builds a query to refetch the given fragment or throws if we have not way to
 * generate one.
 */
function buildRefetchOperation(
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): RefetchRoot {
  for (const generator of GENERATORS) {
    const refetchRoot = generator.buildRefetchOperation(
      schema,
      fragment,
      queryName,
    );
    if (refetchRoot != null) {
      return refetchRoot;
    }
  }
  throw createUserError(
    `Invalid use of @refetchable on fragment '${fragment.name}', only ` +
      'supported are fragments on:\n' +
      GENERATORS.map(generator => ` - ${generator.description}`).join('\n'),
    [fragment.loc],
  );
}

module.exports = {
  buildRefetchOperation,
};

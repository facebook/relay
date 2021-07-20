/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const IRTransformer = require('../core/IRTransformer');
const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const invariant = require('invariant');
import type {Root} from '../core/IR';

import type CompilerContext from '../core/CompilerContext';

const SCHEMA_EXTENSION = `
directive @cache(
  ttl: Int,
) on QUERY
`;

/**
 * A transform that extracts `@ttl(expiration: Int)` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function cacheDirectiveTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    Root: visitRoot,
  });
}

function visitRoot(node: Root) {
  const cacheDirective = node.directives.find(
    directive => directive.name === 'cache',
  );
  if (cacheDirective == null) {
    return node;
  }
  const {ttl} = getLiteralArgumentValues(cacheDirective.args);
  invariant(
    ttl === undefined || typeof ttl === 'number',
    'RelayDirectiveTransform: Expected the "ttl" argument to @cache ' +
      'to be a number literal if specified.',
  );
  return {
    ...node,
    // $FlowFixMe[cannot-spread-indexer]
    metadata: {
      ...(node.metadata || {}),
      ttl,
    },
  };
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: cacheDirectiveTransform,
};

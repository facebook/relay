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

const IRTransformer = require('../core/IRTransformer');

import type CompilerContext from '../core/CompilerContext';
import type {ClientExtension, Fragment} from '../core/IR';

function skipClientExtensionTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    Fragment: visitFragment,
    ClientExtension: visitClientExtension,
  });
}

function visitFragment(node: Fragment): ?Fragment {
  const context: CompilerContext = this.getContext();
  if (context.getSchema().isServerType(node.type)) {
    return this.traverse(node);
  }
  return null;
}

function visitClientExtension(
  node: ClientExtension,
  state: void,
): ?ClientExtension {
  return null;
}

module.exports = {
  transform: skipClientExtensionTransform,
};

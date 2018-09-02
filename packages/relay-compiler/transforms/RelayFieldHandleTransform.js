/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

const {CompilerContext, IRTransformer} = require('graphql-compiler');
const {getRelayHandleKey} = require('relay-runtime');

import type {Field} from 'graphql-compiler';

function relayFieldHandleTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitField,
    ScalarField: visitField,
  });
}

/**
 * @internal
 */
function visitField<F: Field>(field: F): F {
  if (field.kind === 'LinkedField') {
    field = this.traverse(field);
  }
  const handles = field.handles;
  if (!handles || !handles.length) {
    return field;
  }
  // ensure exactly one handle
  invariant(
    handles.length === 1,
    'RelayFieldHandleTransform: Expected fields to have at most one ' +
      '"handle" property, got `%s`.',
    handles.join(', '),
  );
  const alias = field.alias || field.name;
  const handle = handles[0];
  const name = getRelayHandleKey(handle.name, handle.key, field.name);
  const filters = handle.filters;
  const args = filters
    ? field.args.filter(arg => filters.indexOf(arg.name) > -1)
    : [];

  return ({
    ...field,
    args,
    alias,
    name,
    handles: null,
  }: $FlowIssue);
}

module.exports = {
  transform: relayFieldHandleTransform,
};

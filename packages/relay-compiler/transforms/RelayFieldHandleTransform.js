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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const invariant = require('invariant');

const {GraphQLString} = require('graphql');
const {getRelayHandleKey} = require('relay-runtime');

import type {LinkedField, ScalarField} from '../core/GraphQLIR';

function relayFieldHandleTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitField,
    ScalarField: visitField,
  });
}

/**
 * @internal
 */
function visitField<F: LinkedField | ScalarField>(field: F): F {
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
    ? field.args.filter(arg => filters.indexOf(arg.name) !== -1)
    : [];
  // T45504512: new connection model
  if (handle.dynamicKey != null) {
    args.push({
      kind: 'Argument',
      loc: handle.dynamicKey.loc,
      metadata: null,
      name: '__dynamicKey',
      type: GraphQLString,
      value: handle.dynamicKey,
    });
  }

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

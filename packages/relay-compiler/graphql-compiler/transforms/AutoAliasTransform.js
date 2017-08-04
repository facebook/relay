/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AutoAliasTransform
 * @flow
 * @format
 */

'use strict';

const RelayCompilerContext = require('../core/RelayCompilerContext');

const getIdentifierForRelayArgumentValue = require('../core/getIdentifierForRelayArgumentValue');
const invariant = require('invariant');
const murmurHash = require('../util/murmurHash');
const stableJSONStringify = require('../util/stableJSONStringifyOSS');

import type {
  Argument,
  LinkedField,
  ScalarField,
  Selection,
} from '../core/RelayIR';

/**
 * A transform to generate a unique alias for every combination of field name
 * and static calls. This transform requires that fragment spreads with
 * arguments have been inlined.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  const documents = context.documents();
  return (documents: $FlowIssue).reduce((ctx, node) => {
    const selections = transformSelections(node.selections);
    return ctx.add({
      ...node,
      selections,
    });
  }, new RelayCompilerContext(context.schema));
}

function transformSelections(
  nodeSelections: Array<Selection>,
): Array<Selection> {
  return nodeSelections.map(selection => {
    if (selection.kind === 'LinkedField') {
      const alias = generateAlias(selection);
      const selections = transformSelections(selection.selections);
      return ({
        ...selection,
        alias,
        selections,
      }: $FlowIssue);
    } else if (selection.kind === 'ScalarField') {
      const alias = generateAlias(selection);
      return ({
        ...selection,
        alias,
      }: $FlowIssue);
    } else if (
      selection.kind === 'InlineFragment' ||
      selection.kind === 'Condition'
    ) {
      const selections = transformSelections(selection.selections);
      return ({
        ...selection,
        selections,
      }: $FlowIssue);
    } else if (selection.kind === 'FragmentSpread') {
      invariant(
        !selection.args.length,
        'AutoAliasTransform: Expected arguments to fragment spread ' +
          '`%s` to be inlined.',
        selection.name,
      );
      return selection;
    } else {
      invariant(
        false,
        'AutoAliasTransform: Unexpected node kind `%s`.',
        selection.kind,
      );
    }
  });
}

function generateAlias(field: LinkedField | ScalarField): ?string {
  if (!field.args.length) {
    return null;
  }
  const args = [...field.args]
    .sort(sortByName)
    .map(arg => getIdentifierForRelayArgumentValue(arg.value));
  const hash = murmurHash(stableJSONStringify(args));
  return (field.alias || field.name) + '_' + hash;
}

function sortByName(a: Argument, b: Argument): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

module.exports = {transform};

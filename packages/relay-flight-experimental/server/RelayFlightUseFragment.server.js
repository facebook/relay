/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {GraphQLTaggedNode} from 'relay-runtime';

import {lookup} from 'RelayFlightStore.server';

import invariant from 'invariant';
import {getFragment, getFragmentIdentifier, getSelector} from 'relay-runtime';

export default function useFragment(
  taggedNode: GraphQLTaggedNode,
  fragmentRef: mixed,
): mixed {
  const fragmentNode = getFragment(taggedNode);
  const fragmentSelector = getSelector(fragmentNode, fragmentRef);
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);
  const componentName = 'useFragment()';
  invariant(
    fragmentSelector != null,
    'Relay: Expected to receive an object where `...%s` was spread, ' +
      'but the fragment reference was not found`. This is most ' +
      'likely the result of:\n' +
      "- Forgetting to spread `%s` in `%s`'s parent's fragment.\n" +
      '- Conditionally fetching `%s` but unconditionally passing %s prop ' +
      'to `%s`. If the parent fragment only fetches the fragment conditionally ' +
      '- with e.g. `@include`, `@skip`, or inside a `... on SomeType { }` ' +
      'spread  - then the fragment reference will not exist. ' +
      'In this case, pass `null` if the conditions for evaluating the ' +
      'fragment are not met (e.g. if the `@include(if)` value is false.)',
    fragmentNode.name,
    fragmentNode.name,
    componentName,
    fragmentNode.name,
    fragmentIdentifier == null
      ? 'a fragment reference'
      : `the \`${fragmentIdentifier}\``,
    componentName,
  );

  switch (fragmentSelector.kind) {
    case 'SingularReaderSelector':
      return lookup(fragmentSelector).data;
    case 'PluralReaderSelector':
      return fragmentSelector.selectors.map(selector => {
        lookup(selector).data;
      });
  }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3e3c02ca325550970336f2737d4fd530>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import userGreetingResolver from "../../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js";
declare export opaque type ResolverTest2Fragment$fragmentType: FragmentType;
type ResolverTest1FragmentRefetchableQuery$variables = any;
export type ResolverTest2Fragment$data = {|
  +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  +id: string,
  +$fragmentType: ResolverTest2Fragment$fragmentType,
|};
export type ResolverTest2Fragment$key = {
  +$data?: ResolverTest2Fragment$data,
  +$fragmentSpreads: ResolverTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ResolverTest1FragmentRefetchableQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "ResolverTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UserGreetingResolver"
      },
      "kind": "RelayResolver",
      "name": "greeting",
      "resolverModule": require('./../../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js'),
      "path": "greeting"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9064332782abe615b663971d3f85a3ea";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  ResolverTest2Fragment$fragmentType,
  ResolverTest2Fragment$data,
  ResolverTest1FragmentRefetchableQuery$variables,
>*/);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d598a861598b3b97c645f56b089be02a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import userGreetingResolver from "../UserGreetingResolver.js";
declare export opaque type RelayReaderResolverTest2Fragment$fragmentType: FragmentType;
type RelayReaderResolverTest1FragmentRefetchableQuery$variables = any;
export type RelayReaderResolverTest2Fragment$data = {|
  +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  +id: string,
  +$fragmentType: RelayReaderResolverTest2Fragment$fragmentType,
|};
export type RelayReaderResolverTest2Fragment$key = {
  +$data?: RelayReaderResolverTest2Fragment$data,
  +$fragmentSpreads: RelayReaderResolverTest2Fragment$fragmentType,
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
      "operation": require('./RelayReaderResolverTest1FragmentRefetchableQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RelayReaderResolverTest2Fragment",
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
      "resolverModule": require('./../UserGreetingResolver.js'),
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
  (node/*: any*/).hash = "4e682183594a1a0c644eb582547abed6";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RelayReaderResolverTest2Fragment$fragmentType,
  RelayReaderResolverTest2Fragment$data,
  RelayReaderResolverTest1FragmentRefetchableQuery$variables,
>*/);

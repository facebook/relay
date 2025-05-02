/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a130679b5e328f4e39739326c1648689>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./UserGreetingResolver.graphql";
import type { FragmentType } from "relay-runtime";
import {greeting as userGreetingResolverType} from "../UserGreetingResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType: (
  rootKey: UserGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type ResolverTest2Fragment$fragmentType: FragmentType;
type ResolverTest1FragmentRefetchableQuery$variables = any;
export type ResolverTest2Fragment$data = {|
  +greeting: ?string,
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
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
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
      "resolverModule": require('../UserGreetingResolver').greeting,
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

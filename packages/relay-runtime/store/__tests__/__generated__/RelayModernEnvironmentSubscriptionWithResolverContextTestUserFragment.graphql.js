/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8e6c9a64b2d02bc018f3af54839ad5fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import {age as userAgeResolverType} from "../resolvers/UserAgeResolvers.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAgeResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?number);
declare export opaque type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data = {|
  +age: ?number,
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$key = {
  +$data?: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "age",
          "resolverModule": require('../resolvers/UserAgeResolvers').age,
          "path": "age"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "66a7aeaa5486c95229787503c12b1aa0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
  RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data,
>*/);

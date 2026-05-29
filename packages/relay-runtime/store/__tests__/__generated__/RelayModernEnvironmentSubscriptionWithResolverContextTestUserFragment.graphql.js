/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<daa88bd91712ed9b3a7fe84fe6078bd5>>
 * @flow
 * @lightSyntaxTransform
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
(userAgeResolverType as (
  args: void,
  context: TestResolverContextType,
) => ?number);
declare export opaque type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data = {
  readonly age: ?number,
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
};
export type RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$key = {
  readonly $data?: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "66a7aeaa5486c95229787503c12b1aa0";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$fragmentType,
  RelayModernEnvironmentSubscriptionWithResolverContextTestUserFragment$data,
>*/);

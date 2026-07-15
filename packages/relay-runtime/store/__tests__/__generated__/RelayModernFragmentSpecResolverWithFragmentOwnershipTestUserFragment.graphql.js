/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<451a0c77a4ee1e984aa98ca23734d88b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType } from "./RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profilePicture?: ?{
    readonly uri: ?string,
  },
  readonly $fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
  readonly $fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType,
};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$key = {
  readonly $data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "fetchSize"
    },
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment",
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
      "condition": "fetchSize",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "size",
              "variableName": "size"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "3b994d79b46ec897654d4f567082023b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$fragmentType,
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUserFragment$data,
>*/);

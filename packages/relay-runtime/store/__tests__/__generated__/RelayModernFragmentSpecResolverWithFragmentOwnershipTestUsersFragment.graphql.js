/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<95a57892fe844b08b8658418b4c2ba7c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType } from "./RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data = ReadonlyArray<{
  readonly id: string,
  readonly name: ?string,
  readonly profilePicture?: ?{
    readonly uri: ?string,
  },
  readonly $fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
  readonly $fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
}>;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$key = ReadonlyArray<{
  readonly $data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data,
  readonly $fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
  ...
}>;
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
  "metadata": {
    "plural": true
  },
  "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment",
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
  (node/*:: as any*/).hash = "f7a3d2c363740f133497c1eba167af9d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$fragmentType,
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestUsersFragment$data,
>*/);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a50c1db9a79b41d8ea0f30d4bd523cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreSubscriptionsTest1Fragment$fragmentType: FragmentType;
export type RelayModernStoreSubscriptionsTest1Fragment$data = {|
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernStoreSubscriptionsTest1Fragment$fragmentType,
|};
export type RelayModernStoreSubscriptionsTest1Fragment$key = {
  +$data?: RelayModernStoreSubscriptionsTest1Fragment$data,
  +$fragmentSpreads: RelayModernStoreSubscriptionsTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreSubscriptionsTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "emailAddresses",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "44361045253a4616961f066af4240126";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreSubscriptionsTest1Fragment$fragmentType,
  RelayModernStoreSubscriptionsTest1Fragment$data,
>*/);

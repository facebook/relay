/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7ccf8a8aa013ca92c6fc250541672ad4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreSubscriptionsTest2Fragment$fragmentType: FragmentType;
export type RelayModernStoreSubscriptionsTest2Fragment$ref = RelayModernStoreSubscriptionsTest2Fragment$fragmentType;
export type RelayModernStoreSubscriptionsTest2Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$fragmentType: RelayModernStoreSubscriptionsTest2Fragment$fragmentType,
|};
export type RelayModernStoreSubscriptionsTest2Fragment = RelayModernStoreSubscriptionsTest2Fragment$data;
export type RelayModernStoreSubscriptionsTest2Fragment$key = {
  +$data?: RelayModernStoreSubscriptionsTest2Fragment$data,
  +$fragmentSpreads: RelayModernStoreSubscriptionsTest2Fragment$fragmentType,
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
  "name": "RelayModernStoreSubscriptionsTest2Fragment",
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
  (node/*: any*/).hash = "62772b04e13398db69cb01e0fffd5b96";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreSubscriptionsTest2Fragment$fragmentType,
  RelayModernStoreSubscriptionsTest2Fragment$data,
>*/);

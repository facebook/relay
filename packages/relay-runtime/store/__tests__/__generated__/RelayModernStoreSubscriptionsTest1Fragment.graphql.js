/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3d7ecfe0410764604c231632b4825969>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreSubscriptionsTest1Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreSubscriptionsTest1Fragment$fragmentType: RelayModernStoreSubscriptionsTest1Fragment$ref;
export type RelayModernStoreSubscriptionsTest1Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayModernStoreSubscriptionsTest1Fragment$ref,
|};
export type RelayModernStoreSubscriptionsTest1Fragment$data = RelayModernStoreSubscriptionsTest1Fragment;
export type RelayModernStoreSubscriptionsTest1Fragment$key = {
  +$data?: RelayModernStoreSubscriptionsTest1Fragment$data,
  +$fragmentRefs: RelayModernStoreSubscriptionsTest1Fragment$ref,
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

module.exports = node;

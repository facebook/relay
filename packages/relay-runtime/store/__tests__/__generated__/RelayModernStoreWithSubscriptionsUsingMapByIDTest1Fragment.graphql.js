/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<25ab7b810b1337a818f2c4dfde57a3b8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$fragmentType: RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref,
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$data = RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$key = {
  +$data?: RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$data,
  +$fragmentRefs: RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment$ref,
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
  "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest1Fragment",
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
  (node/*: any*/).hash = "27ceb153f10066d821ae50a6a4df8d66";
}

module.exports = node;

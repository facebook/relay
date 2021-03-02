/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d56aa4b3a50fb32954e7a081c95e7044>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$fragmentType: RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref,
|};
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$data = RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment;
export type RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$key = {
  +$data?: RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$data,
  +$fragmentRefs: RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment$ref,
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
  "name": "RelayModernStoreWithSubscriptionsUsingMapByIDTest2Fragment",
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
  (node/*: any*/).hash = "2ab94abf6689e14663b56d610fb4e66e";
}

module.exports = node;

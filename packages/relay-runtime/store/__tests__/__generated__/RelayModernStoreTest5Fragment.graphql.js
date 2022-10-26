/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<69f7652b0538f8adbff02751cba95003>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest5Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest5Fragment$data = {|
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernStoreTest5Fragment$fragmentType,
|};
export type RelayModernStoreTest5Fragment$key = {
  +$data?: RelayModernStoreTest5Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest5Fragment$fragmentType,
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
  "name": "RelayModernStoreTest5Fragment",
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
  (node/*: any*/).hash = "bafa0effa0e5f104fada10c8e21b490a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest5Fragment$fragmentType,
  RelayModernStoreTest5Fragment$data,
>*/);

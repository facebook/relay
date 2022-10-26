/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d341ee567f955dc0166f58210ab04fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernStoreTest4Fragment$fragmentType } from "./RelayModernStoreTest4Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest3Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest3Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentSpreads: RelayModernStoreTest4Fragment$fragmentType,
  +$fragmentType: RelayModernStoreTest3Fragment$fragmentType,
|};
export type RelayModernStoreTest3Fragment$key = {
  +$data?: RelayModernStoreTest3Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest3Fragment$fragmentType,
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
  "name": "RelayModernStoreTest3Fragment",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernStoreTest4Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f0b65213433460d0f0f561df0d788d31";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest3Fragment$fragmentType,
  RelayModernStoreTest3Fragment$data,
>*/);

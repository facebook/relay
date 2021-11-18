/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c2c458de6ec6044c2465db417fe5cafb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest3Fragment$fragmentType: FragmentType;
export type DataCheckerTest3Fragment$ref = DataCheckerTest3Fragment$fragmentType;
export type DataCheckerTest3Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest3Fragment$fragmentType,
|};
export type DataCheckerTest3Fragment = DataCheckerTest3Fragment$data;
export type DataCheckerTest3Fragment$key = {
  +$data?: DataCheckerTest3Fragment$data,
  +$fragmentSpreads: DataCheckerTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest3Fragment",
  "selections": [
    {
      "alias": "profilePicture",
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "__profilePicture_test",
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
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e5a41edb95a798fa731c3074cc026ba9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest3Fragment$fragmentType,
  DataCheckerTest3Fragment$data,
>*/);

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ec1f48ba65b5b80d4fe147da4ba4782>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest2Fragment$fragmentType: FragmentType;
export type DataCheckerTest2Fragment$ref = DataCheckerTest2Fragment$fragmentType;
export type DataCheckerTest2Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest2Fragment$fragmentType,
|};
export type DataCheckerTest2Fragment = DataCheckerTest2Fragment$data;
export type DataCheckerTest2Fragment$key = {
  +$data?: DataCheckerTest2Fragment$data,
  +$fragmentSpreads: DataCheckerTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest2Fragment",
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
  (node/*: any*/).hash = "9a91f81e017f3267c21ec7f465854acf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest2Fragment$fragmentType,
  DataCheckerTest2Fragment$data,
>*/);

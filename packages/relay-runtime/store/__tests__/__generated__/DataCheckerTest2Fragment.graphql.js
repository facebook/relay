/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a4b7411125b34faf327a60cd401aa45>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest2Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest2Fragment$fragmentType: DataCheckerTest2Fragment$ref;
export type DataCheckerTest2Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: DataCheckerTest2Fragment$ref,
|};
export type DataCheckerTest2Fragment$data = DataCheckerTest2Fragment;
export type DataCheckerTest2Fragment$key = {
  +$data?: DataCheckerTest2Fragment$data,
  +$fragmentRefs: DataCheckerTest2Fragment$ref,
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

module.exports = node;

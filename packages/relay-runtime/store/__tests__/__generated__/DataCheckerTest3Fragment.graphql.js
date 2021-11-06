/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d7758e09f57cfb47d1e58f4ab856f51a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest3Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest3Fragment$fragmentType: DataCheckerTest3Fragment$ref;
export type DataCheckerTest3Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: DataCheckerTest3Fragment$ref,
|};
export type DataCheckerTest3Fragment$data = DataCheckerTest3Fragment;
export type DataCheckerTest3Fragment$key = {
  +$data?: DataCheckerTest3Fragment$data,
  +$fragmentRefs: DataCheckerTest3Fragment$ref,
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

module.exports = node;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<803f1ca590111eff8f509c6447b97285>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest1Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest1Fragment$fragmentType: DataCheckerTest1Fragment$ref;
export type DataCheckerTest1Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: DataCheckerTest1Fragment$ref,
|};
export type DataCheckerTest1Fragment$data = DataCheckerTest1Fragment;
export type DataCheckerTest1Fragment$key = {
  +$data?: DataCheckerTest1Fragment$data,
  +$fragmentRefs: DataCheckerTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest1Fragment",
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
  (node/*: any*/).hash = "7702da48eb9fdb96ec074fad8380c6ae";
}

module.exports = node;

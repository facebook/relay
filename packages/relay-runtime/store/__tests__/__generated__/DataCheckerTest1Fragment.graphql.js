/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8ad7d5c529f8aae46366a1bf28023028>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest1Fragment$fragmentType: FragmentType;
export type DataCheckerTest1Fragment$ref = DataCheckerTest1Fragment$fragmentType;
export type DataCheckerTest1Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest1Fragment$fragmentType,
|};
export type DataCheckerTest1Fragment = DataCheckerTest1Fragment$data;
export type DataCheckerTest1Fragment$key = {
  +$data?: DataCheckerTest1Fragment$data,
  +$fragmentSpreads: DataCheckerTest1Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest1Fragment$fragmentType,
  DataCheckerTest1Fragment$data,
>*/);

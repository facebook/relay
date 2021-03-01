/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<71ef82217b7c73c2bd01ca00d7999574>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest11Fragment$ref: FragmentReference;
declare export opaque type DataCheckerTest11Fragment$fragmentType: DataCheckerTest11Fragment$ref;
export type DataCheckerTest11Fragment = {|
  +hometown: ?{|
    +name: ?string,
  |},
  +$refType: DataCheckerTest11Fragment$ref,
|};
export type DataCheckerTest11Fragment$data = DataCheckerTest11Fragment;
export type DataCheckerTest11Fragment$key = {
  +$data?: DataCheckerTest11Fragment$data,
  +$fragmentRefs: DataCheckerTest11Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest11Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Page",
      "kind": "LinkedField",
      "name": "hometown",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
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
  (node/*: any*/).hash = "ab4c345ae17cbde4d56adde3a13999c7";
}

module.exports = node;

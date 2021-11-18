/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ee070a5d775bdc393c7d393b9b3d4df4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest11Fragment$fragmentType: FragmentType;
export type DataCheckerTest11Fragment$ref = DataCheckerTest11Fragment$fragmentType;
export type DataCheckerTest11Fragment$data = {|
  +hometown: ?{|
    +name: ?string,
  |},
  +$fragmentType: DataCheckerTest11Fragment$fragmentType,
|};
export type DataCheckerTest11Fragment = DataCheckerTest11Fragment$data;
export type DataCheckerTest11Fragment$key = {
  +$data?: DataCheckerTest11Fragment$data,
  +$fragmentSpreads: DataCheckerTest11Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest11Fragment$fragmentType,
  DataCheckerTest11Fragment$data,
>*/);

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<00440a5894917b09230b403f7eaeec27>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest1Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest1Fragment$ref = RelayConcreteVariablesTest1Fragment$fragmentType;
export type RelayConcreteVariablesTest1Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest1Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest1Fragment = RelayConcreteVariablesTest1Fragment$data;
export type RelayConcreteVariablesTest1Fragment$key = {
  +$data?: RelayConcreteVariablesTest1Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayConcreteVariablesTest1Fragment",
  "selections": [
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4d33dd3cbeb50208651ac69652c702d9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest1Fragment$fragmentType,
  RelayConcreteVariablesTest1Fragment$data,
>*/);

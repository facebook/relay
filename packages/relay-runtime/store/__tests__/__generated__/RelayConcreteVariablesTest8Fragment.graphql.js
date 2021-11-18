/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<684ac62e5cda8768bbfd7b9334ec4486>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest8Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest8Fragment$ref = RelayConcreteVariablesTest8Fragment$fragmentType;
export type RelayConcreteVariablesTest8Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest8Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest8Fragment = RelayConcreteVariablesTest8Fragment$data;
export type RelayConcreteVariablesTest8Fragment$key = {
  +$data?: RelayConcreteVariablesTest8Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest8Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": 42,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayConcreteVariablesTest8Fragment",
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
  (node/*: any*/).hash = "5ff9a88277cf3070772076b880c3b3c6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest8Fragment$fragmentType,
  RelayConcreteVariablesTest8Fragment$data,
>*/);

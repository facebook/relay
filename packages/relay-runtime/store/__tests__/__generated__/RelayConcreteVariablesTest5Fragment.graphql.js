/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4d0080daaae6c2c175507ca370ac1811>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest5Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest5Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest5Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest5Fragment$key = {
  +$data?: RelayConcreteVariablesTest5Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest5Fragment$fragmentType,
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
  "name": "RelayConcreteVariablesTest5Fragment",
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
  (node/*: any*/).hash = "547656b480e781cce1de6ab5a4b1c05d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest5Fragment$fragmentType,
  RelayConcreteVariablesTest5Fragment$data,
>*/);

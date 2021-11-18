/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4392d77b8ce395680b13dec5ee4c7ea0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest9Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest9Fragment$ref = RelayConcreteVariablesTest9Fragment$fragmentType;
export type RelayConcreteVariablesTest9Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest9Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest9Fragment = RelayConcreteVariablesTest9Fragment$data;
export type RelayConcreteVariablesTest9Fragment$key = {
  +$data?: RelayConcreteVariablesTest9Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest9Fragment$fragmentType,
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
  "name": "RelayConcreteVariablesTest9Fragment",
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
  (node/*: any*/).hash = "82ed3d21666e09944a51bcdada635441";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest9Fragment$fragmentType,
  RelayConcreteVariablesTest9Fragment$data,
>*/);

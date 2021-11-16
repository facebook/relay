/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dad792f10abf4f37c71686061e006d0e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest6Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest6Fragment$ref = RelayConcreteVariablesTest6Fragment$fragmentType;
export type RelayConcreteVariablesTest6Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest6Fragment$fragmentType,
  +$fragmentType: RelayConcreteVariablesTest6Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest6Fragment = RelayConcreteVariablesTest6Fragment$data;
export type RelayConcreteVariablesTest6Fragment$key = {
  +$data?: RelayConcreteVariablesTest6Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest6Fragment$fragmentType,
  +$fragmentSpreads: RelayConcreteVariablesTest6Fragment$fragmentType,
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
  "name": "RelayConcreteVariablesTest6Fragment",
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
  (node/*: any*/).hash = "cc5446f34312d7bd3d63c6fb8a588e93";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest6Fragment$fragmentType,
  RelayConcreteVariablesTest6Fragment$data,
>*/);

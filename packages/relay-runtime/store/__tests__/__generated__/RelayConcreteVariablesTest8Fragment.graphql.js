/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1d34825a8f84613d1929e783a79adfd5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest8Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest8Fragment$fragmentType: RelayConcreteVariablesTest8Fragment$ref;
export type RelayConcreteVariablesTest8Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest8Fragment$ref,
|};
export type RelayConcreteVariablesTest8Fragment$data = RelayConcreteVariablesTest8Fragment;
export type RelayConcreteVariablesTest8Fragment$key = {
  +$data?: RelayConcreteVariablesTest8Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest8Fragment$ref,
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

module.exports = node;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fc01fecb93e4ebfffaa57ec17d4b30e6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest10Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest10Fragment$fragmentType: RelayConcreteVariablesTest10Fragment$ref;
export type RelayConcreteVariablesTest10Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest10Fragment$ref,
|};
export type RelayConcreteVariablesTest10Fragment$data = RelayConcreteVariablesTest10Fragment;
export type RelayConcreteVariablesTest10Fragment$key = {
  +$data?: RelayConcreteVariablesTest10Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest10Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayConcreteVariablesTest10Fragment",
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
  (node/*: any*/).hash = "f37068b7edf72bb19803a1357a29eb77";
}

module.exports = node;

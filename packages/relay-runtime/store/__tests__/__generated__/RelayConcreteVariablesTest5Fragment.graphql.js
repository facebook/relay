/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e0297dc1e21a31d2f7e7b55e4a706de4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest5Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest5Fragment$fragmentType: RelayConcreteVariablesTest5Fragment$ref;
export type RelayConcreteVariablesTest5Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest5Fragment$ref,
|};
export type RelayConcreteVariablesTest5Fragment$data = RelayConcreteVariablesTest5Fragment;
export type RelayConcreteVariablesTest5Fragment$key = {
  +$data?: RelayConcreteVariablesTest5Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest5Fragment$ref,
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

module.exports = node;

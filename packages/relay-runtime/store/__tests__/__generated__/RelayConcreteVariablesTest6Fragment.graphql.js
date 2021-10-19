/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<df64d09b453fa5f6c05fba63e0d9e5bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest6Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest6Fragment$fragmentType: RelayConcreteVariablesTest6Fragment$ref;
export type RelayConcreteVariablesTest6Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest6Fragment$ref,
|};
export type RelayConcreteVariablesTest6Fragment$data = RelayConcreteVariablesTest6Fragment;
export type RelayConcreteVariablesTest6Fragment$key = {
  +$data?: RelayConcreteVariablesTest6Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest6Fragment$ref,
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

module.exports = node;

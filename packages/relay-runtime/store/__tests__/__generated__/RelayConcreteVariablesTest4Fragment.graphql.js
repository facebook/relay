/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f6a5d3b5a166d061f9355df31b6d0821>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest4Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest4Fragment$fragmentType: RelayConcreteVariablesTest4Fragment$ref;
export type RelayConcreteVariablesTest4Fragment = {|
  +profilePicture: ?{|
    +uri: ?string
  |},
  +$refType: RelayConcreteVariablesTest4Fragment$ref,
|};
export type RelayConcreteVariablesTest4Fragment$data = RelayConcreteVariablesTest4Fragment;
export type RelayConcreteVariablesTest4Fragment$key = {
  +$data?: RelayConcreteVariablesTest4Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest4Fragment$ref,
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
  "name": "RelayConcreteVariablesTest4Fragment",
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
  (node/*: any*/).hash = "3ee9a6f3516b8d6a3e740e2f93486c35";
}

module.exports = node;

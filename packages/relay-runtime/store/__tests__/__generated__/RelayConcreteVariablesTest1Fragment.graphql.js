/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<09dbc3090fba3c2a593d3aeccc10ac54>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest1Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest1Fragment$fragmentType: RelayConcreteVariablesTest1Fragment$ref;
export type RelayConcreteVariablesTest1Fragment = {|
  +profilePicture: ?{|
    +uri: ?string
  |},
  +$refType: RelayConcreteVariablesTest1Fragment$ref,
|};
export type RelayConcreteVariablesTest1Fragment$data = RelayConcreteVariablesTest1Fragment;
export type RelayConcreteVariablesTest1Fragment$key = {
  +$data?: RelayConcreteVariablesTest1Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest1Fragment$ref,
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

module.exports = node;

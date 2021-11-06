/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<96c2464dec6715e9ad484daec61d24b2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest9Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest9Fragment$fragmentType: RelayConcreteVariablesTest9Fragment$ref;
export type RelayConcreteVariablesTest9Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest9Fragment$ref,
|};
export type RelayConcreteVariablesTest9Fragment$data = RelayConcreteVariablesTest9Fragment;
export type RelayConcreteVariablesTest9Fragment$key = {
  +$data?: RelayConcreteVariablesTest9Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest9Fragment$ref,
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

module.exports = node;

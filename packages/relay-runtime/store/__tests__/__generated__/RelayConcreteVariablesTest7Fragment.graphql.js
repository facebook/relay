/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<36d8399c5ba10537b7232a56b0dd3abb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest7Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest7Fragment$fragmentType: RelayConcreteVariablesTest7Fragment$ref;
export type RelayConcreteVariablesTest7Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayConcreteVariablesTest7Fragment$ref,
|};
export type RelayConcreteVariablesTest7Fragment$data = RelayConcreteVariablesTest7Fragment;
export type RelayConcreteVariablesTest7Fragment$key = {
  +$data?: RelayConcreteVariablesTest7Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest7Fragment$ref,
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
  "name": "RelayConcreteVariablesTest7Fragment",
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
  (node/*: any*/).hash = "22a028f3cff5badef6dcd50e54d564ca";
}

module.exports = node;

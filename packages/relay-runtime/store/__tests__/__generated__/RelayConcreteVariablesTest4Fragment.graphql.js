/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<896930629dd7160ac9868a18c3c1e06d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest4Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest4Fragment$ref = RelayConcreteVariablesTest4Fragment$fragmentType;
export type RelayConcreteVariablesTest4Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest4Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest4Fragment = RelayConcreteVariablesTest4Fragment$data;
export type RelayConcreteVariablesTest4Fragment$key = {
  +$data?: RelayConcreteVariablesTest4Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest4Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest4Fragment$fragmentType,
  RelayConcreteVariablesTest4Fragment$data,
>*/);

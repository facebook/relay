/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4eeb518767037f1313ed00df923ef5a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest7Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest7Fragment$ref = RelayConcreteVariablesTest7Fragment$fragmentType;
export type RelayConcreteVariablesTest7Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest7Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest7Fragment = RelayConcreteVariablesTest7Fragment$data;
export type RelayConcreteVariablesTest7Fragment$key = {
  +$data?: RelayConcreteVariablesTest7Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest7Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest7Fragment$fragmentType,
  RelayConcreteVariablesTest7Fragment$data,
>*/);

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f60593e5134e89dbff59499150b69fb4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest10Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest10Fragment$ref = RelayConcreteVariablesTest10Fragment$fragmentType;
export type RelayConcreteVariablesTest10Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayConcreteVariablesTest10Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest10Fragment = RelayConcreteVariablesTest10Fragment$data;
export type RelayConcreteVariablesTest10Fragment$key = {
  +$data?: RelayConcreteVariablesTest10Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest10Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest10Fragment$fragmentType,
  RelayConcreteVariablesTest10Fragment$data,
>*/);

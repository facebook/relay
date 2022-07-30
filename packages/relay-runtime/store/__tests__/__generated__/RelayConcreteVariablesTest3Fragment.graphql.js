/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<86310854c7671e268b0fefb247f17e04>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest3Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest3Fragment$data = {|
  +firstName: ?string,
  +$fragmentType: RelayConcreteVariablesTest3Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest3Fragment$key = {
  +$data?: RelayConcreteVariablesTest3Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "condition"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayConcreteVariablesTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "if",
          "variableName": "condition"
        }
      ],
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6c87dfeeb571df49cf0cee8a299a5dec";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest3Fragment$fragmentType,
  RelayConcreteVariablesTest3Fragment$data,
>*/);

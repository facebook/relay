/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d51c42674df02fcffe7f7fd67d50d921>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest2Fragment$fragmentType: FragmentType;
export type RelayConcreteVariablesTest2Fragment$data = {|
  +firstName: ?string,
  +$fragmentType: RelayConcreteVariablesTest2Fragment$fragmentType,
|};
export type RelayConcreteVariablesTest2Fragment$key = {
  +$data?: RelayConcreteVariablesTest2Fragment$data,
  +$fragmentSpreads: RelayConcreteVariablesTest2Fragment$fragmentType,
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
  "name": "RelayConcreteVariablesTest2Fragment",
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
  (node/*: any*/).hash = "df79c95ad35ba6394bc4ff9a22a8c95c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayConcreteVariablesTest2Fragment$fragmentType,
  RelayConcreteVariablesTest2Fragment$data,
>*/);

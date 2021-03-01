/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0f1d85d67c26e445d226aa24a329f0f4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest2Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest2Fragment$fragmentType: RelayConcreteVariablesTest2Fragment$ref;
export type RelayConcreteVariablesTest2Fragment = {|
  +firstName: ?string,
  +$refType: RelayConcreteVariablesTest2Fragment$ref,
|};
export type RelayConcreteVariablesTest2Fragment$data = RelayConcreteVariablesTest2Fragment;
export type RelayConcreteVariablesTest2Fragment$key = {
  +$data?: RelayConcreteVariablesTest2Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest2Fragment$ref,
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

module.exports = node;

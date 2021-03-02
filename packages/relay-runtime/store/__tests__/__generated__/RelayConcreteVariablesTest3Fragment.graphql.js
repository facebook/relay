/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8225677c1dd069e88595154805a5e42d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayConcreteVariablesTest3Fragment$ref: FragmentReference;
declare export opaque type RelayConcreteVariablesTest3Fragment$fragmentType: RelayConcreteVariablesTest3Fragment$ref;
export type RelayConcreteVariablesTest3Fragment = {|
  +firstName: ?string,
  +$refType: RelayConcreteVariablesTest3Fragment$ref,
|};
export type RelayConcreteVariablesTest3Fragment$data = RelayConcreteVariablesTest3Fragment;
export type RelayConcreteVariablesTest3Fragment$key = {
  +$data?: RelayConcreteVariablesTest3Fragment$data,
  +$fragmentRefs: RelayConcreteVariablesTest3Fragment$ref,
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

module.exports = node;

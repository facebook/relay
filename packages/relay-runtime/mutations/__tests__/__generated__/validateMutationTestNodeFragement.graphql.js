/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1731b6c0440f901e25e93cd840750b8d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type validateMutationTestNodeFragement$fragmentType: FragmentType;
export type validateMutationTestNodeFragement$data = {|
  +name: ?string,
  +$fragmentType: validateMutationTestNodeFragement$fragmentType,
|};
export type validateMutationTestNodeFragement$key = {
  +$data?: validateMutationTestNodeFragement$data,
  +$fragmentSpreads: validateMutationTestNodeFragement$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "validateMutationTestNodeFragement",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*: any*/).hash = "7937f42a3405303e086508700243d29d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  validateMutationTestNodeFragement$fragmentType,
  validateMutationTestNodeFragement$data,
>*/);

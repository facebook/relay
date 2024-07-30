/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2c48473c046371240563533927d884d3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ModuleAutoBindTestFragment_user$fragmentType: FragmentType;
export type ModuleAutoBindTestFragment_user$data = {|
  +name: ?string,
  +$fragmentType: ModuleAutoBindTestFragment_user$fragmentType,
|};
export type ModuleAutoBindTestFragment_user$key = {
  +$data?: ModuleAutoBindTestFragment_user$data,
  +$fragmentSpreads: ModuleAutoBindTestFragment_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModuleAutoBindTestFragment_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e9d12e81d55414721e8b7f51db3693b8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ModuleAutoBindTestFragment_user$fragmentType,
  ModuleAutoBindTestFragment_user$data,
>*/);

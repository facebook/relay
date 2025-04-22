/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c9149d75c70c25ba1686401a0788e0c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ClientEdgesTest5Query_user$fragmentType: FragmentType;
export type ClientEdgesTest5Query_user$data = {|
  +name: ?string,
  +$fragmentType: ClientEdgesTest5Query_user$fragmentType,
|};
export type ClientEdgesTest5Query_user$key = {
  +$data?: ClientEdgesTest5Query_user$data,
  +$fragmentSpreads: ClientEdgesTest5Query_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientEdgesTest5Query_user",
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
  (node/*: any*/).hash = "4241c685ba9bb5a0aa7810321b0d1b0d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ClientEdgesTest5Query_user$fragmentType,
  ClientEdgesTest5Query_user$data,
>*/);

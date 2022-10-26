/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fad992fbb4054993a839179e09929872>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserClientEdgeResolver$fragmentType: FragmentType;
export type UserClientEdgeResolver$data = {|
  +name: ?string,
  +$fragmentType: UserClientEdgeResolver$fragmentType,
|};
export type UserClientEdgeResolver$key = {
  +$data?: UserClientEdgeResolver$data,
  +$fragmentSpreads: UserClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserClientEdgeResolver",
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
  (node/*: any*/).hash = "229602ceb28357007afbf2ef87e3720b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserClientEdgeResolver$fragmentType,
  UserClientEdgeResolver$data,
>*/);

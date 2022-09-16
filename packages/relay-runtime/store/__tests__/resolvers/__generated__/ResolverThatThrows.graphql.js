/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa380ef09c7eab5d446816f74be58ce8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ResolverThatThrows$fragmentType: FragmentType;
export type ResolverThatThrows$data = {|
  +username: string,
  +$fragmentType: ResolverThatThrows$fragmentType,
|};
export type ResolverThatThrows$key = {
  +$data?: ResolverThatThrows$data,
  +$fragmentSpreads: ResolverThatThrows$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResolverThatThrows",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      },
      "action": "THROW",
      "path": "username"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0d3dadba39e7d5319a2fff75c35f8787";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ResolverThatThrows$fragmentType,
  ResolverThatThrows$data,
>*/);

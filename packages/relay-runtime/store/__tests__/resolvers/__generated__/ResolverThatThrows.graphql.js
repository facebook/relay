/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<629b400a34be06263f75b89d3504d24c>>
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
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "0d3dadba39e7d5319a2fff75c35f8787";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ResolverThatThrows$fragmentType,
  ResolverThatThrows$data,
>*/);

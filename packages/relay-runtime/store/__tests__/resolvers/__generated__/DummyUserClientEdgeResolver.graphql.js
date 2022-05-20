/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<199c1665898e27666debbab53512cbc2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DummyUserClientEdgeResolver$fragmentType: FragmentType;
export type DummyUserClientEdgeResolver$data = {|
  +id: string,
  +$fragmentType: DummyUserClientEdgeResolver$fragmentType,
|};
export type DummyUserClientEdgeResolver$key = {
  +$data?: DummyUserClientEdgeResolver$data,
  +$fragmentSpreads: DummyUserClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DummyUserClientEdgeResolver",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "THROW",
      "path": "id"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d8712284424e7d688dcbf01e306652a1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DummyUserClientEdgeResolver$fragmentType,
  DummyUserClientEdgeResolver$data,
>*/);

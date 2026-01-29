/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dc2015f380e8269bc265fc7ff2a5716d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest7Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest7Fragment$data = {|
  +storySearch: ?ReadonlyArray<?{|
    +id: string,
  |}>,
  +$fragmentType: RelayStoreUtilsTest7Fragment$fragmentType,
|};
export type RelayStoreUtilsTest7Fragment$key = {
  +$data?: RelayStoreUtilsTest7Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest7Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest7Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "query",
          "value": {
            "limit": 10,
            "offset": 100,
            "text": "foo"
          }
        }
      ],
      "concreteType": "Story",
      "kind": "LinkedField",
      "name": "storySearch",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": "storySearch(query:{\"limit\":10,\"offset\":100,\"text\":\"foo\"})"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "def7915d9aa4b51e02e316bfd7f174a0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest7Fragment$fragmentType,
  RelayStoreUtilsTest7Fragment$data,
>*/);

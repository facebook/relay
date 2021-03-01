/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<61e57fa1b320825e0cf5bc4eb08b9912>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest7Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest7Fragment$fragmentType: RelayStoreUtilsTest7Fragment$ref;
export type RelayStoreUtilsTest7Fragment = {|
  +storySearch: ?$ReadOnlyArray<?{|
    +id: string,
  |}>,
  +$refType: RelayStoreUtilsTest7Fragment$ref,
|};
export type RelayStoreUtilsTest7Fragment$data = RelayStoreUtilsTest7Fragment;
export type RelayStoreUtilsTest7Fragment$key = {
  +$data?: RelayStoreUtilsTest7Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest7Fragment$ref,
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

module.exports = node;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<99bdb4983ace30ea732aac218c654d83>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest8Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest8Fragment$fragmentType: RelayStoreUtilsTest8Fragment$ref;
export type RelayStoreUtilsTest8Fragment = {|
  +storySearch: ?$ReadOnlyArray<?{|
    +id: string,
  |}>,
  +$refType: RelayStoreUtilsTest8Fragment$ref,
|};
export type RelayStoreUtilsTest8Fragment$data = RelayStoreUtilsTest8Fragment;
export type RelayStoreUtilsTest8Fragment$key = {
  +$data?: RelayStoreUtilsTest8Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest8Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "foo"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest8Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "fields": [
            {
              "kind": "Literal",
              "name": "limit",
              "value": 10
            },
            {
              "kind": "Literal",
              "name": "offset",
              "value": 100
            },
            {
              "kind": "Variable",
              "name": "text",
              "variableName": "foo"
            }
          ],
          "kind": "ObjectValue",
          "name": "query"
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
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "504bebd30110d70bcd1c2af482676a90";
}

module.exports = node;

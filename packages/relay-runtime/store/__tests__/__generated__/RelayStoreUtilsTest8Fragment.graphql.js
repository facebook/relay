/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab609464762546107c1e4a561eb03d9f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest8Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest8Fragment$data = {|
  +storySearch: ?ReadonlyArray<?{|
    +id: string,
  |}>,
  +$fragmentType: RelayStoreUtilsTest8Fragment$fragmentType,
|};
export type RelayStoreUtilsTest8Fragment$key = {
  +$data?: RelayStoreUtilsTest8Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest8Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest8Fragment$fragmentType,
  RelayStoreUtilsTest8Fragment$data,
>*/);

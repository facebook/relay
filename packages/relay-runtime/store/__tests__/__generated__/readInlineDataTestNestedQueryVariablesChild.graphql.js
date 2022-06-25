/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<56f6329262c409a206e63def6ccfa118>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type readInlineDataTestNestedQueryVariablesGrandchild$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type readInlineDataTestNestedQueryVariablesChild$fragmentType: FragmentType;
export type readInlineDataTestNestedQueryVariablesChild$data = {|
  +$fragmentSpreads: readInlineDataTestNestedQueryVariablesGrandchild$fragmentType,
  +$fragmentType: readInlineDataTestNestedQueryVariablesChild$fragmentType,
|};
export type readInlineDataTestNestedQueryVariablesChild$key = {
  +$data?: readInlineDataTestNestedQueryVariablesChild$data,
  +$fragmentSpreads: readInlineDataTestNestedQueryVariablesChild$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "readInlineDataTestNestedQueryVariablesChild",
  "selections": [
    {
      "kind": "InlineDataFragmentSpread",
      "name": "readInlineDataTestNestedQueryVariablesGrandchild",
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "scale",
              "variableName": "scale"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profile_picture",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "args": null,
      "argumentDefinitions": [
        {
          "kind": "RootArgument",
          "name": "scale"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "07443f80b006430044e79ee785ad46d9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  readInlineDataTestNestedQueryVariablesChild$fragmentType,
  readInlineDataTestNestedQueryVariablesChild$data,
>*/);

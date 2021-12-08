/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<45244e50d17c78e5ef4e00ffec64c32b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type commitMutationTest2Fragment$fragmentType: FragmentType;
export type commitMutationTest2Fragment$ref = commitMutationTest2Fragment$fragmentType;
export type commitMutationTest2Fragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: commitMutationTest2Fragment$fragmentType,
|};
export type commitMutationTest2Fragment = commitMutationTest2Fragment$data;
export type commitMutationTest2Fragment$key = {
  +$data?: commitMutationTest2Fragment$data,
  +$fragmentSpreads: commitMutationTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "commitMutationTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "35279f7d4b8a2aaa3943ab0d3636f25d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  commitMutationTest2Fragment$fragmentType,
  commitMutationTest2Fragment$data,
>*/);

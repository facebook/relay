/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0d63dbb3e37ffee571ed3b3b893518fb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type commitMutationTest1Fragment$fragmentType: FragmentType;
export type commitMutationTest1Fragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +id: string,
  +$fragmentType: commitMutationTest1Fragment$fragmentType,
|};
export type commitMutationTest1Fragment$key = {
  +$data?: commitMutationTest1Fragment$data,
  +$fragmentSpreads: commitMutationTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "commitMutationTest1Fragment",
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
  (node/*: any*/).hash = "5531c772eb51f5d19ad21d26c583105b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  commitMutationTest1Fragment$fragmentType,
  commitMutationTest1Fragment$data,
>*/);

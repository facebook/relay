/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<06b2914424646baaebb5d99df418aa00>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type commitMutationTest1Fragment$ref: FragmentReference;
declare export opaque type commitMutationTest1Fragment$fragmentType: commitMutationTest1Fragment$ref;
export type commitMutationTest1Fragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: commitMutationTest1Fragment$ref,
|};
export type commitMutationTest1Fragment$data = commitMutationTest1Fragment;
export type commitMutationTest1Fragment$key = {
  +$data?: commitMutationTest1Fragment$data,
  +$fragmentRefs: commitMutationTest1Fragment$ref,
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

module.exports = node;

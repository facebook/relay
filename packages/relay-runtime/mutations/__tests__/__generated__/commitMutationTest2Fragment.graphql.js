/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a03188b679bba62c440d13dc10309a5a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type commitMutationTest2Fragment$ref: FragmentReference;
declare export opaque type commitMutationTest2Fragment$fragmentType: commitMutationTest2Fragment$ref;
export type commitMutationTest2Fragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: commitMutationTest2Fragment$ref,
|};
export type commitMutationTest2Fragment$data = commitMutationTest2Fragment;
export type commitMutationTest2Fragment$key = {
  +$data?: commitMutationTest2Fragment$data,
  +$fragmentRefs: commitMutationTest2Fragment$ref,
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

module.exports = node;

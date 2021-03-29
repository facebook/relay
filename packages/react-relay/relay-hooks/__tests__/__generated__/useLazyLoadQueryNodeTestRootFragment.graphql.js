/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aa29f927cfd0cf16a216b0a558c1a27f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestRootFragment$ref: FragmentReference;
declare export opaque type useLazyLoadQueryNodeTestRootFragment$fragmentType: useLazyLoadQueryNodeTestRootFragment$ref;
export type useLazyLoadQueryNodeTestRootFragment = {|
  +node: ?{|
    +id: string,
    +name: ?string,
  |},
  +$refType: useLazyLoadQueryNodeTestRootFragment$ref,
|};
export type useLazyLoadQueryNodeTestRootFragment$data = useLazyLoadQueryNodeTestRootFragment;
export type useLazyLoadQueryNodeTestRootFragment$key = {
  +$data?: useLazyLoadQueryNodeTestRootFragment$data,
  +$fragmentRefs: useLazyLoadQueryNodeTestRootFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "id"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeTestRootFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "id"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
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
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7b96fc5af262cbf50968eb501640c178";
}

module.exports = node;

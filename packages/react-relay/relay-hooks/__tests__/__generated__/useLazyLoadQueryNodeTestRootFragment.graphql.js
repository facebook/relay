/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a4ea2280d230e995c68be787a066eedb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestRootFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeTestRootFragment$ref = useLazyLoadQueryNodeTestRootFragment$fragmentType;
export type useLazyLoadQueryNodeTestRootFragment$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: useLazyLoadQueryNodeTestRootFragment$fragmentType,
|};
export type useLazyLoadQueryNodeTestRootFragment = useLazyLoadQueryNodeTestRootFragment$data;
export type useLazyLoadQueryNodeTestRootFragment$key = {
  +$data?: useLazyLoadQueryNodeTestRootFragment$data,
  +$fragmentSpreads: useLazyLoadQueryNodeTestRootFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useLazyLoadQueryNodeTestRootFragment$fragmentType,
  useLazyLoadQueryNodeTestRootFragment$data,
>*/);

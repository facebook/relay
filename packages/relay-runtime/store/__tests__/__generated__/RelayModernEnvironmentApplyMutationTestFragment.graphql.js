/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<79a2eca9be5c2fb4df6f0bb0379ce39c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentApplyMutationTestFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentApplyMutationTestFragment$ref = RelayModernEnvironmentApplyMutationTestFragment$fragmentType;
export type RelayModernEnvironmentApplyMutationTestFragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
|};
export type RelayModernEnvironmentApplyMutationTestFragment = RelayModernEnvironmentApplyMutationTestFragment$data;
export type RelayModernEnvironmentApplyMutationTestFragment$key = {
  +$data?: RelayModernEnvironmentApplyMutationTestFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentApplyMutationTestFragment",
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
  (node/*: any*/).hash = "d2674d63012707069f7de0e0e3449a02";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
  RelayModernEnvironmentApplyMutationTestFragment$data,
>*/);

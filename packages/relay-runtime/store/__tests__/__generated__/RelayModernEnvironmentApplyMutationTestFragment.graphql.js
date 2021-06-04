/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<68818a68795bb02008d9f9b11708dc77>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentApplyMutationTestFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentApplyMutationTestFragment$fragmentType: RelayModernEnvironmentApplyMutationTestFragment$ref;
export type RelayModernEnvironmentApplyMutationTestFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentApplyMutationTestFragment$ref,
|};
export type RelayModernEnvironmentApplyMutationTestFragment$data = RelayModernEnvironmentApplyMutationTestFragment;
export type RelayModernEnvironmentApplyMutationTestFragment$key = {
  +$data?: RelayModernEnvironmentApplyMutationTestFragment$data,
  +$fragmentRefs: RelayModernEnvironmentApplyMutationTestFragment$ref,
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

module.exports = node;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ae63b158bb63982a7d5a38665b49cc3d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$data = RelayModernEnvironmentExecuteSubscriptionTestCommentFragment;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionTestCommentFragment",
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
  (node/*: any*/).hash = "63c56dd08d121f0bd12dea86bb5b8c94";
}

module.exports = node;

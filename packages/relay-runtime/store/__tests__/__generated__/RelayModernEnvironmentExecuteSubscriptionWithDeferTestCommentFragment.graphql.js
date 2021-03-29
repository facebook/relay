/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c1b8f6e554e26debbd66b80c09d6f8d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$data = RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment",
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": "name",
          "args": null,
          "kind": "ScalarField",
          "name": "__name_name_handler",
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
  (node/*: any*/).hash = "3f43a3ad199bd0b3f314e82db5533579";
}

module.exports = node;

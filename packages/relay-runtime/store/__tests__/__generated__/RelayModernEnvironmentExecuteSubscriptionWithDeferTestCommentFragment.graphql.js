/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<373eb6e5761b0b9ca06583a6d990a5d1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$data = {|
  +actor: ?{|
    +name: ?string,
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionWithDeferTestCommentFragment$data,
>*/);

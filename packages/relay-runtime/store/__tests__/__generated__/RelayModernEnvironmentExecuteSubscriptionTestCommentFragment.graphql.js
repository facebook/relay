/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3b600eeeb386eab1722e6e63380e8f13>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionTestCommentFragment$data,
>*/);

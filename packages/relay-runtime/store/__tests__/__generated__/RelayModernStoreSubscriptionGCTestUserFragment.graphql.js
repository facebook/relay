/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d5c49a534d3a950a02ceb21baf2cc0cb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreSubscriptionGCTestUserFragment$fragmentType: FragmentType;
export type RelayModernStoreSubscriptionGCTestUserFragment$data = {
  readonly birthdate: ?{
    readonly day: ?number,
  },
  readonly name: ?string,
  readonly $fragmentType: RelayModernStoreSubscriptionGCTestUserFragment$fragmentType,
};
export type RelayModernStoreSubscriptionGCTestUserFragment$key = {
  readonly $data?: RelayModernStoreSubscriptionGCTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernStoreSubscriptionGCTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreSubscriptionGCTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Date",
      "kind": "LinkedField",
      "name": "birthdate",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "day",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e7e01b5a3eba056ab3680a2cef28cc82";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreSubscriptionGCTestUserFragment$fragmentType,
  RelayModernStoreSubscriptionGCTestUserFragment$data,
>*/);

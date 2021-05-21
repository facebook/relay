/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5a901bdc143a8fda5f2c3adae209e8a1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type ActorChangeWithDeferTestDeferFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActorChangeWithDeferTestFragment$ref: FragmentReference;
declare export opaque type ActorChangeWithDeferTestFragment$fragmentType: ActorChangeWithDeferTestFragment$ref;
export type ActorChangeWithDeferTestFragment = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
  |},
  +$fragmentRefs: ActorChangeWithDeferTestDeferFragment$ref,
  +$refType: ActorChangeWithDeferTestFragment$ref,
|};
export type ActorChangeWithDeferTestFragment$data = ActorChangeWithDeferTestFragment;
export type ActorChangeWithDeferTestFragment$key = {
  +$data?: ActorChangeWithDeferTestFragment$data,
  +$fragmentRefs: ActorChangeWithDeferTestFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ActorChangeWithDeferTestFragment",
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ActorChangeWithDeferTestDeferFragment"
        }
      ]
    }
  ],
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};

if (__DEV__) {
  (node/*: any*/).hash = "41ca2a82da7fb665ea29eaa3ed7d07dd";
}

module.exports = node;

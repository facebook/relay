/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<44974e2b3b10d999b44101e207009e4d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type ActorChangeWithDeferTestDeferFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type ActorChangeWithDeferTestFragment$fragmentType: FragmentType;
export type ActorChangeWithDeferTestFragment$data = {|
  +actor: ?{|
    +name: ?string,
  |},
  +id: string,
  +$fragmentSpreads: ActorChangeWithDeferTestDeferFragment$fragmentType,
  +$fragmentType: ActorChangeWithDeferTestFragment$fragmentType,
|};
export type ActorChangeWithDeferTestFragment$key = {
  +$data?: ActorChangeWithDeferTestFragment$data,
  +$fragmentSpreads: ActorChangeWithDeferTestFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ActorChangeWithDeferTestFragment$fragmentType,
  ActorChangeWithDeferTestFragment$data,
>*/);

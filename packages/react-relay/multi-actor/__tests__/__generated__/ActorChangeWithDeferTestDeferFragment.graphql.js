/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4a33ee5859bd3455ad5d0bab0ab6ffc3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ActorChangeWithDeferTestDeferFragment$fragmentType: FragmentType;
export type ActorChangeWithDeferTestDeferFragment$data = {|
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: ActorChangeWithDeferTestDeferFragment$fragmentType,
|};
export type ActorChangeWithDeferTestDeferFragment$key = {
  +$data?: ActorChangeWithDeferTestDeferFragment$data,
  +$fragmentSpreads: ActorChangeWithDeferTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ActorChangeWithDeferTestDeferFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "message",
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
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "38584886de5cea46382e76aa3694a4bd";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ActorChangeWithDeferTestDeferFragment$fragmentType,
  ActorChangeWithDeferTestDeferFragment$data,
>*/);

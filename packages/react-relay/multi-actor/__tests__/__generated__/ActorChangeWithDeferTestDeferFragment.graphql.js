/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5586ba272ac81f7fea7c2172c7a66afe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActorChangeWithDeferTestDeferFragment$ref: FragmentReference;
declare export opaque type ActorChangeWithDeferTestDeferFragment$fragmentType: ActorChangeWithDeferTestDeferFragment$ref;
export type ActorChangeWithDeferTestDeferFragment = {|
  +message: ?{|
    +text: ?string,
  |},
  +$refType: ActorChangeWithDeferTestDeferFragment$ref,
|};
export type ActorChangeWithDeferTestDeferFragment$data = ActorChangeWithDeferTestDeferFragment;
export type ActorChangeWithDeferTestDeferFragment$key = {
  +$data?: ActorChangeWithDeferTestDeferFragment$data,
  +$fragmentRefs: ActorChangeWithDeferTestDeferFragment$ref,
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
  (node/*: any*/).hash = "38584886de5cea46382e76aa3694a4bd";
}

module.exports = node;

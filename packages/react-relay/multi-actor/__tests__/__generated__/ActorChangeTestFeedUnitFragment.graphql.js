/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9b3d22c4bb96be0892586e0a4a2d85af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActorChangeTestFeedUnitFragment$ref: FragmentReference;
declare export opaque type ActorChangeTestFeedUnitFragment$fragmentType: ActorChangeTestFeedUnitFragment$ref;
export type ActorChangeTestFeedUnitFragment = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
  |},
  +$refType: ActorChangeTestFeedUnitFragment$ref,
|};
export type ActorChangeTestFeedUnitFragment$data = ActorChangeTestFeedUnitFragment;
export type ActorChangeTestFeedUnitFragment$key = {
  +$data?: ActorChangeTestFeedUnitFragment$data,
  +$fragmentRefs: ActorChangeTestFeedUnitFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ActorChangeTestFeedUnitFragment",
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
    }
  ],
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};

if (__DEV__) {
  (node/*: any*/).hash = "da7a170ddd5452b9936c41f99bf7a85c";
}

module.exports = node;

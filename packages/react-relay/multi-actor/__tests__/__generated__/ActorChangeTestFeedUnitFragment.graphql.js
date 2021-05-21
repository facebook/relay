/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eb88a73a08abe9530c3c15bf719dc348>>
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
  +message: ?{|
    +text: ?string,
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
  (node/*: any*/).hash = "52c3c2a080b7bc16a00e823abf0cdb25";
}

module.exports = node;

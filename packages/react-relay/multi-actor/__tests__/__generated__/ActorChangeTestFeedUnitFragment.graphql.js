/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ddf3b6fc0d7e0eb7e0d7254d7a7e5bf4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ActorChangeTestFeedUnitFragment$fragmentType: FragmentType;
export type ActorChangeTestFeedUnitFragment$ref = ActorChangeTestFeedUnitFragment$fragmentType;
export type ActorChangeTestFeedUnitFragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: ActorChangeTestFeedUnitFragment$fragmentType,
|};
export type ActorChangeTestFeedUnitFragment = ActorChangeTestFeedUnitFragment$data;
export type ActorChangeTestFeedUnitFragment$key = {
  +$data?: ActorChangeTestFeedUnitFragment$data,
  +$fragmentSpreads: ActorChangeTestFeedUnitFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ActorChangeTestFeedUnitFragment$fragmentType,
  ActorChangeTestFeedUnitFragment$data,
>*/);

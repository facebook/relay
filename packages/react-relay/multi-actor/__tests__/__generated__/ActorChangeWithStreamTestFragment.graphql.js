/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84e8f72d0c0972d9649efeee083cc9e5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ActorChangeWithStreamTestFragment$fragmentType: FragmentType;
export type ActorChangeWithStreamTestFragment$data = {|
  +feedback: ?{|
    +actors: ?ReadonlyArray<?{|
      +name: ?string,
    |}>,
    +id: string,
  |},
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +$fragmentType: ActorChangeWithStreamTestFragment$fragmentType,
|};
export type ActorChangeWithStreamTestFragment$key = {
  +$data?: ActorChangeWithStreamTestFragment$data,
  +$fragmentSpreads: ActorChangeWithStreamTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ActorChangeWithStreamTestFragment",
  "selections": [
    (v0/*: any*/),
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Feedback",
      "kind": "LinkedField",
      "name": "feedback",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "kind": "Stream",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "actors",
              "plural": true,
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
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f6caca148f49ab0721890ee040c47e77";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ActorChangeWithStreamTestFragment$fragmentType,
  ActorChangeWithStreamTestFragment$data,
>*/);

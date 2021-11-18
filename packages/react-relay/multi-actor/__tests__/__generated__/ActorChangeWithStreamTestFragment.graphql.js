/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<86201f294d6f5a938db2654b81556a7f>>
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
export type ActorChangeWithStreamTestFragment$ref = ActorChangeWithStreamTestFragment$fragmentType;
export type ActorChangeWithStreamTestFragment$data = {|
  +id: string,
  +message: ?{|
    +text: ?string,
  |},
  +feedback: ?{|
    +id: string,
    +actors: ?$ReadOnlyArray<?{|
      +name: ?string,
    |}>,
  |},
  +$fragmentType: ActorChangeWithStreamTestFragment$fragmentType,
|};
export type ActorChangeWithStreamTestFragment = ActorChangeWithStreamTestFragment$data;
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

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<847f8d9885f73ce03004497b4be78f51>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActorChangeWithStreamTestFragment$ref: FragmentReference;
declare export opaque type ActorChangeWithStreamTestFragment$fragmentType: ActorChangeWithStreamTestFragment$ref;
export type ActorChangeWithStreamTestFragment = {|
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
  +$refType: ActorChangeWithStreamTestFragment$ref,
|};
export type ActorChangeWithStreamTestFragment$data = ActorChangeWithStreamTestFragment;
export type ActorChangeWithStreamTestFragment$key = {
  +$data?: ActorChangeWithStreamTestFragment$data,
  +$fragmentRefs: ActorChangeWithStreamTestFragment$ref,
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

module.exports = node;

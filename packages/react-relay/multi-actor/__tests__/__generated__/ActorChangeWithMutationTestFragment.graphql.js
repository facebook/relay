/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2760c9940c873ecdc88c7c8569658e1f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActorChangeWithMutationTestFragment$ref: FragmentReference;
declare export opaque type ActorChangeWithMutationTestFragment$fragmentType: ActorChangeWithMutationTestFragment$ref;
export type ActorChangeWithMutationTestFragment = {|
  +id: string,
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +$refType: ActorChangeWithMutationTestFragment$ref,
|};
export type ActorChangeWithMutationTestFragment$data = ActorChangeWithMutationTestFragment;
export type ActorChangeWithMutationTestFragment$key = {
  +$data?: ActorChangeWithMutationTestFragment$data,
  +$fragmentRefs: ActorChangeWithMutationTestFragment$ref,
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
  "name": "ActorChangeWithMutationTestFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "19cbfdfb8e8c68efa9a193744af18576";
}

module.exports = node;

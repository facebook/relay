/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87fe5075c2120550bc0af46f976c7678>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ActorChangeWithMutationTestFragment$fragmentType: FragmentType;
export type ActorChangeWithMutationTestFragment$data = {|
  +actor: ?{|
    +id: string,
    +name: ?string,
  |},
  +id: string,
  +$fragmentType: ActorChangeWithMutationTestFragment$fragmentType,
|};
export type ActorChangeWithMutationTestFragment$key = {
  +$data?: ActorChangeWithMutationTestFragment$data,
  +$fragmentSpreads: ActorChangeWithMutationTestFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ActorChangeWithMutationTestFragment$fragmentType,
  ActorChangeWithMutationTestFragment$data,
>*/);

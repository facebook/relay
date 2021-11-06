/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b537c622e770dc9776fc9684a8f6b69f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$fragmentType: RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$ref;
export type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment = {|
  +viewer: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
  +me: ?{|
    +name: ?string,
  |},
  +$refType: RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$ref,
|};
export type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$data = RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment;
export type RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$key = {
  +$data?: RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$data,
  +$fragmentRefs: RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentConditionalSelectionsTestQueryUnconditionalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Viewer",
      "kind": "LinkedField",
      "name": "viewer",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actor",
          "plural": false,
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6d296854cc443c9208203a8665a5c938";
}

module.exports = node;

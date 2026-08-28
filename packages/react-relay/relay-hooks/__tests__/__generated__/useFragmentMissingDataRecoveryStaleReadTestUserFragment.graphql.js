/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<71c38fc4d5df3a306c1d94fa42d4d655>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType: FragmentType;
export type useFragmentMissingDataRecoveryStaleReadTestUserFragment$data = {
  readonly author: ?{
    readonly id: string,
    readonly name: ?string,
  },
  readonly name: ?string,
  readonly $fragmentType: useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType,
};
export type useFragmentMissingDataRecoveryStaleReadTestUserFragment$key = {
  readonly $data?: useFragmentMissingDataRecoveryStaleReadTestUserFragment$data,
  readonly $fragmentSpreads: useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentMissingDataRecoveryStaleReadTestUserFragment",
  "selections": [
    (v0/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        (v0/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f04b73fa207c0d656ae6ea3e4391fc1b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType,
  useFragmentMissingDataRecoveryStaleReadTestUserFragment$data,
>*/);

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e73e5423a3a508d51c1b3286c1ebe04>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTestClientInterface$data = {
  readonly description: ?string,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTestClientInterface$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTestClientInterface$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "description",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestClientInterface",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "ClientTypeImplementingClientInterface",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*:: as any*/),
          "type": "OtherClientTypeImplementingClientInterface",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "ClientInterface",
  "abstractKey": "__isClientInterface"
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "287f546a52c69fb148055d6382052c98";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  RelayModernEnvironmentTypeRefinementTestClientInterface$data,
>*/);

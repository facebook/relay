/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<de611fd62e05bb784faf591a98865831>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestClientInterface$fragmentType: FragmentType;
export type DataCheckerTestClientInterface$data = {
  readonly description: ?string,
  readonly $fragmentType: DataCheckerTestClientInterface$fragmentType,
};
export type DataCheckerTestClientInterface$key = {
  readonly $data?: DataCheckerTestClientInterface$data,
  readonly $fragmentSpreads: DataCheckerTestClientInterface$fragmentType,
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
  "name": "DataCheckerTestClientInterface",
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
  (node/*:: as any*/).hash = "4995889c6c2685693be9b60dccb0b095";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTestClientInterface$fragmentType,
  DataCheckerTestClientInterface$data,
>*/);

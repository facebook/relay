/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<66088f059cf3a4b366c33280ad9f7311>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestClient2Interface$fragmentType: FragmentType;
export type DataCheckerTestClient2Interface$data = {
  readonly description: ?string,
  readonly $fragmentType: DataCheckerTestClient2Interface$fragmentType,
};
export type DataCheckerTestClient2Interface$key = {
  readonly $data?: DataCheckerTestClient2Interface$data,
  readonly $fragmentSpreads: DataCheckerTestClient2Interface$fragmentType,
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
  "name": "DataCheckerTestClient2Interface",
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
  (node/*:: as any*/).hash = "9650b9ade2708e969935ffb73b26a4c8";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTestClient2Interface$fragmentType,
  DataCheckerTestClient2Interface$data,
>*/);

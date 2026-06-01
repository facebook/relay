/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ff35570e65e414599458f9d80256f846>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestClientInterfaceFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestClientInterfaceFragment$data = {
  readonly description: ?string,
  readonly $fragmentType: RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
};
export type RelayResponseNormalizerTestClientInterfaceFragment$key = {
  readonly $data?: RelayResponseNormalizerTestClientInterfaceFragment$data,
  readonly $fragmentSpreads: RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
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
  "name": "RelayResponseNormalizerTestClientInterfaceFragment",
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
  (node/*:: as any*/).hash = "8750bf96f36b4fbad1dd3506ec7d4c1d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
  RelayResponseNormalizerTestClientInterfaceFragment$data,
>*/);

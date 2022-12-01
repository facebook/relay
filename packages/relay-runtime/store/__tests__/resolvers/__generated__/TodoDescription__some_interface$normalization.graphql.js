/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d89dbb07a7ec7fa8d47e32a4b1d5072>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type TodoDescription__some_interface$normalization = {|
  +__typename: "ClientTypeImplementingClientInterface",
  +description: ?string,
|} | {|
  +__typename: "OtherClientTypeImplementingClientInterface",
  +description: ?string,
|};

*/

var node/*: NormalizationSplitOperation*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "description",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  }
];
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "TodoDescription__some_interface$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "ClientTypeImplementingClientInterface",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "OtherClientTypeImplementingClientInterface",
          "abstractKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;

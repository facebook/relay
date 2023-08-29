/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<04a7e96a12e051f0dde60a9ee322b8c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type tests_TodoDescription__some_interface$normalization = {|
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
  "name": "tests_TodoDescription__some_interface$normalization",
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

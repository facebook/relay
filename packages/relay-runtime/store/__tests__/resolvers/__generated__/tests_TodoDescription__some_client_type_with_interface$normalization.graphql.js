/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<36da3b39114ed651f96df8a70743e44f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type tests_TodoDescription__some_client_type_with_interface$normalization = {|
  +client_interface: {|
    +__typename: "ClientTypeImplementingClientInterface",
    +description: ?string,
  |} | {|
    +__typename: "OtherClientTypeImplementingClientInterface",
    +description: ?string,
  |} | {|
    +__typename: string,
  |},
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
  }
];
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "tests_TodoDescription__some_client_type_with_interface$normalization",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "client_interface",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
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
          ],
          "storageKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;

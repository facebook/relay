/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0f6b849291f122fa62b726720e1851eb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type TodoDescription__some_client_type_with_interface$normalization = {
  readonly client_interface: {
    readonly __typename: "ClientTypeImplementingClientInterface",
    readonly description: ?string,
  } | {
    readonly __typename: "OtherClientTypeImplementingClientInterface",
    readonly description: ?string,
  } | {
    readonly __typename: string,
  },
};

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
  "name": "TodoDescription__some_client_type_with_interface$normalization",
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
          ],
          "storageKey": null
        }
      ]
    }
  ]
};
})();

module.exports = node;

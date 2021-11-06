/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8b019524afab2ff2e5f1dde3ff2fb101>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$normalization",
  "selections": [
    {
      "alias": "mark",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Mark"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "args": [
            {
              "kind": "Variable",
              "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline$cond",
              "variableName": "global_cond"
            }
          ],
          "fragment": require('./RelayModernEnvironmentNoInlineTest_nestedNoInline$normalization.graphql'),
          "kind": "FragmentSpread"
        },
        (v1/*: any*/)
      ],
      "storageKey": "username(name:\"Mark\")"
    },
    {
      "alias": "zuck",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Zuck"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "args": [
            {
              "kind": "Literal",
              "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline$cond",
              "value": false
            }
          ],
          "fragment": require('./RelayModernEnvironmentNoInlineTest_nestedNoInline$normalization.graphql'),
          "kind": "FragmentSpread"
        },
        (v1/*: any*/)
      ],
      "storageKey": "username(name:\"Zuck\")"
    },
    {
      "alias": "joe",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Joe"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "args": [
            {
              "kind": "Variable",
              "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline$cond",
              "variableName": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$cond"
            }
          ],
          "fragment": require('./RelayModernEnvironmentNoInlineTest_nestedNoInline$normalization.graphql'),
          "kind": "FragmentSpread"
        },
        (v1/*: any*/)
      ],
      "storageKey": "username(name:\"Joe\")"
    }
  ]
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d674bb7d0e482ecdd681a2e8574ff5fe";
}

module.exports = node;

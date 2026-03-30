/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<95071fae4b30719e64d07a63e41abe74>>
 * @flow
 * @lightSyntaxTransform
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
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$normalization",
  "selections": [
    (v0/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "MarkdownUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markup",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "filters": null,
          "handle": "markup_handler",
          "key": "",
          "kind": "ScalarHandle",
          "name": "markup"
        },
        (v1/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": "innerRenderer",
          "args": [
            {
              "kind": "Literal",
              "name": "supported",
              "value": "1AwQS7"
            }
          ],
          "concreteType": null,
          "kind": "LinkedField",
          "name": "nameRenderer",
          "plural": false,
          "selections": [
            (v0/*:: as any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name",
                  "fragmentName": "RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "PlainUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": "nameRenderer(supported:\"1AwQS7\")"
        },
        (v1/*:: as any*/)
      ],
      "storageKey": null
    }
  ]
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "44c58e2b7f52b082c9fbb6fc18edbfa3";
}

module.exports = node;

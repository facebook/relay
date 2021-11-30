/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<97c238f2c1848f2f158291574afe2bc9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType = any;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$variables = {||};
export type RelayReaderTestWhenMatchDirectiveIsPresentBarQueryVariables = RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$variables;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentBarFragment$fragmentType,
  |},
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentBarQueryResponse = RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$data;
export type RelayReaderTestWhenMatchDirectiveIsPresentBarQuery = {|
  variables: RelayReaderTestWhenMatchDirectiveIsPresentBarQueryVariables,
  response: RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentBarQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentBarQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "supported",
                "value": [
                  "PlainUserNameRenderer",
                  "MarkdownUserNameRenderer"
                ]
              }
            ],
            "concreteType": null,
            "kind": "LinkedField",
            "name": "nameRenderer",
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
                "selections": [
                  {
                    "args": null,
                    "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment",
                    "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name",
                    "fragmentPropName": "name",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "PlainUserNameRenderer",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentBarFragment",
                    "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name",
                    "fragmentPropName": "name",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "MarkdownUserNameRenderer",
                "abstractKey": null
              }
            ],
            "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0dd6f246ce5cc94d8f04238418cccd67",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentBarQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestWhenMatchDirectiveIsPresentBarQuery {\n  me {\n    ...RelayReaderTestWhenMatchDirectiveIsPresentBarFragment\n    id\n  }\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentBarFragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name\n      __module_operation_RelayReaderTestWhenMatchDirectiveIsPresentBarFragment: js(module: \"RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer\")\n      __module_component_RelayReaderTestWhenMatchDirectiveIsPresentBarFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name\n      __module_operation_RelayReaderTestWhenMatchDirectiveIsPresentBarFragment: js(module: \"RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer\")\n      __module_component_RelayReaderTestWhenMatchDirectiveIsPresentBarFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentBarFragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ef129a52e6ca5b6a54a16caac745a44a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$variables,
  RelayReaderTestWhenMatchDirectiveIsPresentBarQuery$data,
>*/);

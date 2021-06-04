/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c97c31d702697caf9f9b1d9a00062714>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref = any;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryVariables = {||};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$ref,
  |},
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery = {|
  variables: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryVariables,
  response: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery",
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
            "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment"
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
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery",
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
            "args": null,
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
                    "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment",
                    "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name",
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
                    "documentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment",
                    "fragmentName": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name",
                    "fragmentPropName": "name",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "MarkdownUserNameRenderer",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "aeb13687397ad5d70d440d3243f3b79a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery {\n  me {\n    ...RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment\n    id\n  }\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name\n      __module_operation_RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment: js(module: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name$normalization.graphql\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer\")\n      __module_component_RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name\n      __module_operation_RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment: js(module: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer\")\n      __module_component_RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n}\n\nfragment RelayReaderTestWhenMatchDirectiveIsPresentNoModulePlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "52e8fb8b490569a5a7125ef7dac411f1";
}

module.exports = node;

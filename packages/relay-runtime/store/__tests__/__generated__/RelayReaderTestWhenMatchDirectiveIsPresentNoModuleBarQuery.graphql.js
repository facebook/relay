/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9c978079066cc44cf5c230e75eed0de2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType = any;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$variables = {||};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryVariables = RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$variables;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarFragment$fragmentType,
  |},
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryResponse = RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$data;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery = {|
  variables: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQueryVariables,
  response: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$variables,
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleBarQuery$data,
>*/);

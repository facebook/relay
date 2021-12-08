/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e412bec2180d785b11b9bdbfef2ff53e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentCommitPayloadTest6ActorQuery.me.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType = any;
export type RelayModernEnvironmentCommitPayloadTest6ActorQuery$variables = {||};
export type RelayModernEnvironmentCommitPayloadTest6ActorQueryVariables = RelayModernEnvironmentCommitPayloadTest6ActorQuery$variables;
export type RelayModernEnvironmentCommitPayloadTest6ActorQuery$data = {|
  +me: ?{|
    +name: ?string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType,
    |},
    +$fragmentSpreads: RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentCommitPayloadTest6ActorQueryResponse = RelayModernEnvironmentCommitPayloadTest6ActorQuery$data;
export type RelayModernEnvironmentCommitPayloadTest6ActorQuery = {|
  variables: RelayModernEnvironmentCommitPayloadTest6ActorQueryVariables,
  response: RelayModernEnvironmentCommitPayloadTest6ActorQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentCommitPayloadTest6ActorQuery",
      "fragmentName": "RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCommitPayloadTest6ActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "nameRenderer",
            "plural": false,
            "selections": [
              (v1/*: any*/)
            ],
            "storageKey": null
          },
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentCommitPayloadTest6UserFragment"
              }
            ]
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
    "name": "RelayModernEnvironmentCommitPayloadTest6ActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
              (v1/*: any*/)
            ],
            "storageKey": null
          },
          {
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentCommitPayloadTest6ActorQuery$defer$RelayModernEnvironmentCommitPayloadTest6UserFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "658f24b2b3a739a303364ff9cfed2fe3",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCommitPayloadTest6ActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCommitPayloadTest6ActorQuery {\n  me {\n    name\n    nameRenderer {\n      __typename\n      ... on MarkdownUserNameRenderer {\n        ...RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentCommitPayloadTest6ActorQuery: js(module: \"RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentCommitPayloadTest6ActorQuery.me.nameRenderer\")\n        __module_component_RelayModernEnvironmentCommitPayloadTest6ActorQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentCommitPayloadTest6ActorQuery.me.nameRenderer\")\n      }\n    }\n    ...RelayModernEnvironmentCommitPayloadTest6UserFragment @defer(label: \"RelayModernEnvironmentCommitPayloadTest6ActorQuery$defer$RelayModernEnvironmentCommitPayloadTest6UserFragment\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n}\n\nfragment RelayModernEnvironmentCommitPayloadTest6UserFragment on User {\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a6b604953d655581e78c5617d1c01e66";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCommitPayloadTest6ActorQuery$variables,
  RelayModernEnvironmentCommitPayloadTest6ActorQuery$data,
>*/);

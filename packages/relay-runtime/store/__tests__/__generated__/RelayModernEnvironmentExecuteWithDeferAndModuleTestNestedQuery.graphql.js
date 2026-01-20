/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6d1ca0804e52b8e33179e46bc5e6343f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery.node {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user.graphql";
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$data = {|
  +node: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery = {|
  response: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = [
  {
    "kind": "InlineFragment",
    "selections": [
      {
        "args": null,
        "documentName": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery",
        "fragmentName": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user",
        "fragmentPropName": "user",
        "kind": "ModuleImport"
      }
    ],
    "type": "User",
    "abstractKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "Defer",
            "selections": (v2/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user",
            "selections": (v2/*: any*/)
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
    "cacheID": "a16923b5bc118000c7d645a32ed29c3b",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... @defer(label: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user\") {\n      ... on User {\n        ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user\n        __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery: js(module: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery.node\")\n        __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery: js(module: \"User.react\", id: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery.node\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment on User {\n  lastName\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment on User {\n  name\n  ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment\")\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user on User {\n  id\n  ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment\")\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "68b0b6cd9b9dfde4d6098cd27348c45f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$variables,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$data,
>*/);

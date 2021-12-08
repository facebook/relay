/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9f81093550104db605b2122fef144f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.node {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.viewer.actor {"branches":{"User":{"component":"Actor.react","fragment":"RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType = any;
type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType = any;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQueryVariables = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$data = {|
  +node: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  |},
  +viewer: ?{|
    +actor: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQueryResponse = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$data,
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
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor",
      "fragmentName": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor",
      "fragmentPropName": "actor",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v3/*: any*/)
            ],
            "storageKey": null
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
    "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v2/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v3/*: any*/),
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d54d1e867410f10004f827a429c25e78",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user\n      __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.node\")\n      __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery: js(module: \"User.react\", id: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.node\")\n    }\n    id\n  }\n  viewer {\n    actor {\n      __typename\n      ... on User {\n        ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor\n        __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor: js(module: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.viewer.actor\")\n        __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor: js(module: \"Actor.react\", id: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery.viewer.actor\")\n      }\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor on User {\n  ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment on User {\n  id\n  name\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user on User {\n  ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment\")\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6fc860d6ca313fa0941c63838338854b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery$data,
>*/);

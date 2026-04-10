/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3a865bd3ee15a34f23cda797072bb235>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery.node {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user.graphql";
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$data = {|
  +node: ?({|
    +__typename: "User",
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$fragmentType,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery = {|
  response: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$variables,
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
        "documentName": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery",
        "fragmentName": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "Defer",
            "selections": (v2/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
            "label": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user",
            "selections": (v2/*:: as any*/)
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
    "cacheID": "aed3e45e980901713d2d1d0c6fe07c46",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... @defer(label: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user\") {\n      ... on User {\n        ...RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user\n        __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery: js(module: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery.node\")\n        __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery: js(module: \"User.react\", id: \"RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery.node\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e1e0184ec7d619431104e6bada8a3318";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$variables,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$data,
>*/);

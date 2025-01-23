/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fd1d541a67ef0ff1db5b0d842aae690c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_a {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_b {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestModuleA_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModuleA_user.graphql";
import type { RelayReaderAliasedFragmentsTestModuleB_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModuleB_user.graphql";
export type RelayReaderAliasedFragmentsTestMultipleModulesQuery$variables = {|
  conditionA: boolean,
  conditionB: boolean,
  id: string,
|};
export type RelayReaderAliasedFragmentsTestMultipleModulesQuery$data = {|
  +node: ?{|
    +alias_a?: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
    |},
    +alias_b?: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleB_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestMultipleModulesQuery = {|
  response: RelayReaderAliasedFragmentsTestMultipleModulesQuery$data,
  variables: RelayReaderAliasedFragmentsTestMultipleModulesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "conditionA"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "conditionB"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_a",
      "fragmentName": "RelayReaderAliasedFragmentsTestModuleA_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_b",
      "fragmentName": "RelayReaderAliasedFragmentsTestModuleB_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "condition": "conditionA",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "fragment": (v4/*: any*/),
                "kind": "AliasedInlineFragmentSpread",
                "name": "alias_a"
              }
            ]
          },
          {
            "condition": "conditionB",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "fragment": (v5/*: any*/),
                "kind": "AliasedInlineFragmentSpread",
                "name": "alias_b"
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
            "condition": "conditionA",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v4/*: any*/)
            ]
          },
          {
            "condition": "conditionB",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v5/*: any*/)
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
    "cacheID": "d74c686aa3b59ad8e84f1695b25d87e5",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestMultipleModulesQuery(\n  $id: ID!\n  $conditionA: Boolean!\n  $conditionB: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ... on User @include(if: $conditionA) {\n      ...RelayReaderAliasedFragmentsTestModuleA_user\n      __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_a: js(module: \"RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_a\")\n      __module_component_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_a: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_a\")\n    }\n    ... on User @include(if: $conditionB) {\n      ...RelayReaderAliasedFragmentsTestModuleB_user\n      __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_b: js(module: \"RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_b\")\n      __module_component_RelayReaderAliasedFragmentsTestMultipleModulesQuery_alias_b: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesQuery.node.alias_b\")\n    }\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestModuleA_user on User {\n  name\n}\n\nfragment RelayReaderAliasedFragmentsTestModuleB_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "63907b10c529badf9ae8d1ca38e8bc4d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestMultipleModulesQuery$variables,
  RelayReaderAliasedFragmentsTestMultipleModulesQuery$data,
>*/);

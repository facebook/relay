/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aac93c16b88e49e062920e739f7935f2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_a {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_b {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestModuleA_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModuleA_user.graphql";
import type { RelayReaderAliasedFragmentsTestModuleB_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModuleB_user.graphql";
export type RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$variables = {|
  conditionA: boolean,
  conditionB: boolean,
  id: string,
|};
export type RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$data = {|
  +node: ?{|
    +alias_a?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleA_user$fragmentType,
    |},
    +alias_b?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleB_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery = {|
  response: RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$data,
  variables: RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$variables,
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
      "documentName": "RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_a",
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
      "documentName": "RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_b",
      "fragmentName": "RelayReaderAliasedFragmentsTestModuleB_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
},
v6 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isNode"
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
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery",
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
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    (v4/*: any*/)
                  ],
                  "type": null,
                  "abstractKey": null
                },
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
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    (v5/*: any*/)
                  ],
                  "type": null,
                  "abstractKey": null
                },
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
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery",
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
              (v6/*: any*/),
              (v4/*: any*/)
            ]
          },
          {
            "condition": "conditionB",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v6/*: any*/),
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
    "cacheID": "f419ef5b67b87868396e418219525001",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery(\n  $id: ID!\n  $conditionA: Boolean!\n  $conditionB: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    __isNode: __typename @include(if: $conditionA)\n    ... on User @include(if: $conditionA) {\n      ...RelayReaderAliasedFragmentsTestModuleA_user\n      __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_a: js(module: \"RelayReaderAliasedFragmentsTestModuleA_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_a\")\n      __module_component_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_a: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_a\")\n    }\n    __isNode: __typename @include(if: $conditionB)\n    ... on User @include(if: $conditionB) {\n      ...RelayReaderAliasedFragmentsTestModuleB_user\n      __module_operation_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_b: js(module: \"RelayReaderAliasedFragmentsTestModuleB_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_b\")\n      __module_component_RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery_alias_b: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery.node.alias_b\")\n    }\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestModuleA_user on User {\n  name\n}\n\nfragment RelayReaderAliasedFragmentsTestModuleB_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f307853eb13bf7597c45d4189e881c15";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$variables,
  RelayReaderAliasedFragmentsTestMultipleModulesInInlineFragmentsQuery$data,
>*/);
